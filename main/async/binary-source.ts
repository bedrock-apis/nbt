import { IDataCursor } from "@bedrock-apis/nbt-core";

/**
 * Make all properties in T readonly
 */
type NotReadonly<T> = {
    -readonly [P in keyof T]: T[P];
};
export abstract class BinaryDataTransformerInstance<T extends ArrayBufferLike, S> implements Transformer<Uint8Array<T>, S>, IDataCursor {
    public pointer: number = 0;
    public length: number = 0;
    public readonly view: DataView;
    public readonly program!: Iterator<number, void, number>;
    public readonly controller!: TransformStreamDefaultController<S>;
    protected requested: number = 0;
    protected isDone: boolean | undefined = false;
    public constructor(
        public readonly buffer: Uint8Array,
        protected readonly maxSubChunkSize: number = buffer.length - 256
    ) {
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
    public start(controller: TransformStreamDefaultController<S>): void {
        (this as NotReadonly<this>).controller = controller;
        (this as NotReadonly<this>).program = this.getProgram(controller);
    }
    public transform(chunk: Uint8Array<T>, controller: TransformStreamDefaultController<S>): void {
        try {
            if (this.isDone) return void controller.terminate();
            // Split the raw chunk into smaller chunks if necessary
            for (const c of BinaryDataTransformerInstance.getChunkIterator(chunk, this.maxSubChunkSize)) {
                
                //console.log("Chunk:",c.byteLength,(Date.now()/1000).toFixed(1));
                this.flushBuffer(); // Flush the buffer to make space for new data
                this.set(c); // Set the new chunk into the buffer

                // Process the data in the buffer
                while (this.requested <= (this.length - this.pointer)) {
                    const { done, value } = this.program.next((this.length - this.pointer)); // Get the next value from the program
                    if ((this.isDone = done)) return void controller.terminate();
                    if ((this.requested = value) === -1) { // Check if a reset is requested
                        this.requested = this.length = this.pointer = 0; // Reset pointers and length
                        this.isDone = true;
                        break;
                    }
                }
            }
        } catch (error) {
            controller.error(error);
        }
    }
    public flush(): void {
        if (this.isDone) return;
        try {
            let nextValue = this.program.next((this.length - this.pointer));
            while (!nextValue.done) nextValue = this.program.next((this.length - this.pointer));
        } catch (error) {
            this.controller.error(error);
        }
        this.controller.terminate();
    }
    // Abstract method to get the program iterator
    protected abstract getProgram(controller: TransformStreamDefaultController<S>): Iterator<number, void, number>;

    // Method to set data in the buffer
    protected set(u8: Uint8Array<T>): void {
        if (this.length + u8.length > this.buffer.byteLength) throw new Error(`Buffer overflow error, ${this.length}, ${this.buffer.byteLength}, ${u8.length}`);
        this.buffer.set(u8, this.length);
        this.length += u8.length;
    }

    // Method to flush the buffer
    protected flushBuffer(): void {
        if (this.pointer <= 0 || this.length <= 0) return;
        this.buffer.set(this.buffer.subarray(this.pointer, this.length), 0);
        this.length -= this.pointer;
        this.pointer = 0;
    }
    // Method to reset the consumer
    protected reset(): void {
        this.length = 0;
        this.pointer = 0;
    }
    // Static helper to get chunk iterator
    public static * getChunkIterator<T extends ArrayBufferLike>(buffer: Uint8Array<T>, chunkLength: number): Generator<Uint8Array<T>> {
        let start = 0;
        while (start < buffer.length) yield buffer.subarray(start, start += chunkLength);
    }



    //#region Binary Operations
    public createStreamController(): { readable: ReadableStream<Uint8Array<T>>, controller: ReadableStreamController<Uint8Array<T>> } {
        let controller: ReadableStreamController<Uint8Array<T>>;
        const readable = new ReadableStream<Uint8Array<T>>({ start(c) { controller = c } });
        return {
            controller: controller!,
            readable
        }
    }
    public * bufferUpController(controller: ReadableStreamController<Uint8Array>, length: number, close: boolean = true): Generator<number, void, number> {
        let offset = 0;
        while (offset < length) {
            const available = yield 1;
            let toRead = Math.min(available, (length - offset));
            if (toRead === 0)
                break;
            controller.enqueue(this.rentSlice(toRead));
            offset += toRead;
        }
        if (close)
            controller.close();
    }
    public createReadable(length: number): (Generator<number, void, number> & { readable: ReadableStream<Uint8Array<T>> }) {
        const { controller, readable } = this.createStreamController();
        const generator = this.bufferUpController(controller, length);
        (generator as (Generator<number, void, number> & { readable: ReadableStream<Uint8Array<T>> })).readable = readable;
        return generator as (Generator<number, void, number> & { readable: ReadableStream<Uint8Array<T>> });
    }
    public * bufferUp<T extends Uint8Array<ArrayBufferLike>>(buffer: T): Generator<number, T, number> {
        let offset = 0;
        while (offset < buffer.length) {
            const available = yield 1;
            let toRead = Math.min(available, (buffer.length - offset));
            if (toRead === 0) return buffer;
            buffer.set(this.rentSlice(toRead), offset);
            offset += toRead;
        }
        return buffer;
    }
    public * batchSkip(length: number): Generator<number, void, number> {
        let offset = 0;
        while (offset < length) {
            const available = yield 1;
            let toRead = Math.min(available, (length - offset));
            if (toRead === 0) return;
            this.pointer += (toRead);
            offset += toRead;
        }
    }
    public rentSlice(length: number): Uint8Array {
        const _ = this.buffer.subarray(this.pointer, this.pointer + length);
        this.pointer += (length);
        return _;
    }
    public rentDataView(length: number): DataView {
        const _ = new DataView(this.buffer.buffer, this.view.byteOffset + this.pointer, length);
        this.pointer += (length);
        return _;
    }
}