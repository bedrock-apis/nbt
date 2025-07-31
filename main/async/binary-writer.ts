import { Byte, Double, Float, IDataCursor, Int, Long, Short, TagType } from "@bedrock-apis/nbt-core";
import { type WriterLike} from "../writers";
import { UTF8_BUFFER_HELPER, UTF8_ENCODER } from "../shared";

export type NBTToken = Byte | Short | Int | Long | bigint | Float | Double | string | Uint8Array;
export class TokenReader extends ReadableStream<Uint8Array> implements IDataCursor {
    public pointer: number = 0;
    public readonly view: DataView;
    protected get availableSpace(): number{return this.buffer.length - this.pointer;}
    // We use slice for safety reasons here
    protected getWrittenBuffer(): Uint8Array{
        return this.buffer.slice(0, this.pointer);
    }
    protected pushChunk(controller: ReadableStreamController<Uint8Array>, chunk: Uint8Array): void{
        let read = 0;
        while(read < chunk.length){
            if(this.pointer === 0 && (chunk.length - read) > this.buffer.length) {
                controller.enqueue(chunk.slice(read, read+=(chunk.length - read)));
                continue;
            }
            // No slice needed its being written to temporary
            const subchunk = chunk.subarray(read, read+=this.availableSpace);
            this.buffer.set(subchunk, this.pointer);
            this.pointer += subchunk.length;
            if(this.availableSpace === 0) this.flush(controller);
        }
    }
    public constructor(iterator: Iterator<NBTToken>, public readonly format: WriterLike, public readonly buffer: Uint8Array = new Uint8Array(1 << 14)) {
        super({
            pull: (controller) => {
                while ((this.pointer+8) < this.buffer.length) {
                    let { value, done } = iterator.next();
                    if (done) {
                        this.flush(controller);
                        controller.close();
                        return;
                    }
                    if ((value as Byte).__internal_tag_type__ < 7 /*ByteArray*/) {
                        format[(value as Byte).__internal_tag_type__ as 1](this, value.valueOf());
                        continue;
                    }
                    switch ((value as Byte).__internal_tag_type__) {
                        case TagType.ByteArray:
                            format.writeArrayLength(this, value.length);
                            this.pushChunk(controller, value);
                            continue;
                        case TagType.String:
                            const v = UTF8_ENCODER.encodeInto(value.valueOf(), UTF8_BUFFER_HELPER);
                            format.writeStringLength(this, v.written);
                            this.pushChunk(controller, UTF8_BUFFER_HELPER.subarray(0, v.written));
                            continue;
                        default:
                            throw new SyntaxError("Unexpected token type: " + (value as Byte).__internal_tag_type__);
                    }
                }
                this.flush(controller);
            },
            type: "bytes"
        }, {highWaterMark: 1<<10});
        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
    }
    private flush(controller: ReadableStreamController<Uint8Array>): void {
        if (this.pointer) {
            controller.enqueue(this.getWrittenBuffer());
            this.pointer = 0;
        }
    }
}
/*
Iterate over tokens and just write them, type is directly use with Byte
*/