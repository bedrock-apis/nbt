import { Byte, Double, Float, Int, Short, TagType } from "@bedrock-apis/nbt-core";
import { BinaryDataTransformerInstance } from "./binary-source";
import type { ReaderLike } from "../readers";
import { type NBTToken } from "./binary-writer";
import { UTF8_DECODER } from "../shared";

export enum ReadMode {
    RootTag = 0xf1,
    ValueTag = 0xf2
}
export const VALUE_SIZES: Record<number, number> = {
    1: 1,
    2: 2,
    // Indeed this is correct, variable size int for network nbt requires 5 bytes for int32 and 10bytes for int64 at most
    3: 5,
    4: 10,
    5: 4,
    6: 8,
};
export const TYPE_TOKENS: Record<number, new (v: any) => Token> = {
    1: Byte,
    2: Short,
    3: Int,
    5: Float,
    6: Double
}
export type Token = Byte | Short | Int | bigint | Float | Double | string | { type: 10 | 9 | 11 | 12, length: number, tagType?: TagType } | Uint8Array;
export class NBTTokenizerTransformer extends BinaryDataTransformerInstance<ArrayBufferLike, Token> {
    public constructor(buffer: Uint8Array, public format: ReaderLike, public readonly mode: ReadMode | TagType) {
        super(buffer, 256);
    }
    protected * getProgram(controller: TransformStreamDefaultController<string | number | bigint | object>): Iterator<number, void, number> {
        let typeToRead = this.mode;
        if (this.mode === ReadMode.ValueTag) {
            yield 1;
            typeToRead = this.format.readType(this);
        }
        if (this.mode === ReadMode.RootTag) {
            yield 1 + 5;
            typeToRead = this.format.readType(this);
            yield* this.batchSkip(this.format.readStringLength(this));
        }
        yield* this.push(typeToRead);
    }
    protected *push(tag: number): Generator<number, void, number> {
        if (tag in VALUE_SIZES)
            yield VALUE_SIZES[tag];
        if (tag in TYPE_TOKENS)
            return void this.controller.enqueue(new TYPE_TOKENS[tag](this.format[tag as 1](this)));
        let length;
        switch (tag) {
            case 4: return void this.controller.enqueue(this.format[4](this));
            case 8: return void (yield* this.pushString());
            case 9: return void (yield* this.pushList());
            case 10: return void (yield* this.pushCompound());
            case 7:
                yield 5;
                length = this.format.readArrayLength(this);
                return void this.controller.enqueue(yield* this.bufferUp(new Uint8Array(length)));
        }
        throw new ReferenceError("Type not supported yet, " + TagType[tag]);
    }
    protected * pushString(): Generator<number, void, number> {
        yield 5;
        const length = this.format.readStringLength(this);
        const buffer = new Uint8Array(length);
        yield* this.bufferUp(buffer);
        this.controller.enqueue(UTF8_DECODER.decode(buffer))
    }
    protected * pushList(): Generator<number, void, number> {
        yield 6;
        const type = this.format.readType(this);
        const length = this.format.readArrayLength(this);
        if (type === 0 || length === 0) return void this.controller.enqueue({ type: 9, length: 0, tagType: type });
        if (!(type in this.format)) throw new SyntaxError('Unexpected NBT token type: ' + type);
        for (let i = 0; i < length; i++) yield* this.push(type);
        return void this.controller.enqueue({ type: 9, length, tagType: type });
    }
    protected * pushCompound(): Generator<number, void, number> {
        let count = 0;
        // Empty Object prototype for safety, maybe for performance as well?
        let type;
        yield 1;
        while ((type = this.format.readType(this)) !== 0) {
            yield 5;
            const length = this.format.readStringLength(this);
            if (length > this.maxSubChunkSize) throw new Error("Key Length is too big, max valid key name is: " + this.maxSubChunkSize);
            yield length;
            this.controller.enqueue(UTF8_DECODER.decode(this.rentSlice(length)));
            yield* this.push(type);
            count++;
            yield 1;
        }
        this.controller.enqueue({ type: 10, length: count });
    }
}
const BYTE = new Byte(0);
const GetTagType = (v: number): Byte => {
    BYTE.value = v;
    return BYTE;
}
export class NBTTokenize {
    public static * getRootIterator(value: unknown, rootKey = ""): Iterator<NBTToken> {
        const type = (value as Byte).__internal_tag_type__;
        yield GetTagType(type);
        yield rootKey;
        if(type < 9) return void (yield * [value as Byte].values());
        if(type in this) return void (yield * this[type as 10](value as object));
        throw new ReferenceError("Unknown or not serializable tag type: " + type);
    }
    public static *10(value: object): Generator<NBTToken> {
        for (const key in value) {
            const valueType = (value[key as keyof object] as Byte);
            if (!isFinite(valueType.__internal_tag_type__ ?? NaN)) continue;
            yield GetTagType(valueType.__internal_tag_type__);
            yield key;
            if (valueType.__internal_tag_type__ < 9) yield valueType;
            else if (valueType.__internal_tag_type__ in this) yield* this[valueType.__internal_tag_type__ as 10](valueType);
            else throw new SyntaxError("No Serializer for " + valueType.__internal_tag_type__);
        }
        yield GetTagType(0);
    }
    public static *9(value: unknown[]): Generator<NBTToken> {
        if (value.length === 0) {
            yield GetTagType(0);
            yield new Int(0);
            return;
        }

        const valueType = (value[0] as Byte);
        const tagType: number = valueType.__internal_tag_type__;
        if(tagType > 8 && !(tagType in this)) throw new ReferenceError("Not serializable tag type: " + tagType);
        yield GetTagType(tagType);
        yield new Int(value.length);
        for(let i = 0; i < value.length; i++){
            const v = value[i] as Byte;
            const type = v?.__internal_tag_type__;
            if(type !== tagType) throw new ReferenceError("Array has to be of only of the one type");
            if(type < 9) yield v;
            yield * this[type as 10](v);
        }
    }
}