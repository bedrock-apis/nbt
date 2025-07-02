import { Byte, Double, Float, Int, Short, TagType } from "@bedrock-apis/nbt-core";
import { BinaryDataTransformerInstance } from "./binary-source";
import type { ReaderLike } from "../readers";

const UTF8_DECODER = new TextDecoder();
export enum ReadMode {
    RootTag = 0xf1,
    ValueTag = 0xf2
}
export const VALUE_SIZES: Record<number, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 8,
    // Indeed this is correct, variable size int for network nbt requires 5 bytes at most
    5: 5,
    6: 8,
};
export const TYPE_TOKENS: Record<number, new (v: any)=>Token> = {
    1: Byte,
    2: Short,
    3: Int,
    5: Float,
    6: Double
}
export type Token = Byte | Short | Int | bigint | Float | Double | string | { type: 10 | 9 | 11 | 12, length: number, tagType?: TagType } | Uint8Array;
export class NBTTokenizerTransformer extends BinaryDataTransformerInstance<ArrayBufferLike, Token> {
    public constructor(buffer: Uint8Array, public format: ReaderLike, public readonly mode: ReadMode | TagType){
        super(buffer, 256);
    }
    protected * getProgram(controller: TransformStreamDefaultController<string | number | bigint | object>): Iterator<number, void, number> {
        let typeToRead = this.mode;
        if(this.mode === ReadMode.ValueTag){
            yield 1;
            typeToRead = this.format.readType(this);
        }
        if(this.mode === ReadMode.RootTag){
            yield 1 + 5;
            typeToRead = this.format.readType(this);
            yield * this.batchSkip(this.format.readStringLength(this));
        }
        yield * this.push(typeToRead);
    }
    protected *push(tag: number): Generator<number, void, number>{
        if(tag in VALUE_SIZES)
            yield VALUE_SIZES[tag];
        if(tag in TYPE_TOKENS)
            return void this.controller.enqueue(new TYPE_TOKENS[tag](this.format[tag as 1](this)));
        let length;
        switch(tag){
            case 4: return void this.controller.enqueue(this.format[4](this));
            case 8: return void (yield * this.pushString());
            case 9: return void (yield * this.pushList());
            case 10: return void (yield * this.pushCompound());
            case 7:
                yield 5;
                length = this.format.readArrayLength(this);
                return void this.controller.enqueue(yield * this.bufferUp(new Uint8Array(length)));
        }
        throw new ReferenceError("Type not supported yet, " + TagType[tag]);
    }
    protected * pushString(): Generator<number, void, number>{
        yield 5;
        const length = this.format.readStringLength(this);
        const buffer = new Uint8Array(length);
        yield * this.bufferUp(buffer);
        this.controller.enqueue(UTF8_DECODER.decode(buffer))
    }
    protected * pushList(): Generator<number, void, number>{
        yield 6;
        const type = this.format.readType(this);
        const length = this.format.readArrayLength(this);
        if (type === 0 || length === 0) return void this.controller.enqueue({type: 9, length: 0, tagType: type});
        if (!(type in this.format)) throw new SyntaxError('Unexpected NBT token type: ' + type);
        for (let i = 0; i < length; i++) yield * this.push(type);
        return void this.controller.enqueue({type: 9, length, tagType: type});
    }
    protected * pushCompound(): Generator<number, void, number>{
        let count = 0;
        // Empty Object prototype for safety, maybe for performance as well?
        let type;
        yield 1;
        while((type = this.format.readType(this)) !== 0){
            yield 5;
            const length = this.format.readStringLength(this);
            if(length > this.maxSubChunkSize) throw new Error("Key Length is too big, max valid key name is: " + this.maxSubChunkSize);
            yield length;
            this.controller.enqueue(UTF8_DECODER.decode(this.rentSlice(length)));
            yield * this.push(type);
            count++;
            yield 1;
        }
        this.controller.enqueue({type: 10, length: count});
    }
}