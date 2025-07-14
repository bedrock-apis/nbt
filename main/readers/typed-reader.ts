import { Byte, Double, Float, IDataCursor, Int, Short, TagType } from "@bedrock-apis/nbt-core";
import { ReaderLike } from "./reader-like";

export class TypedReader {
    public static 1(cursor: IDataCursor, format: ReaderLike): Byte{return new Byte(format[1](cursor));}
    public static 2(cursor: IDataCursor, format: ReaderLike): Short{return new Short(format[2](cursor));}
    public static 3(cursor: IDataCursor, format: ReaderLike): Int{return new Int(format[3](cursor));}
    public static 5(cursor: IDataCursor, format: ReaderLike): Float{return new Float(format[5](cursor));}
    public static 6(cursor: IDataCursor, format: ReaderLike): Double{return new Double(format[6](cursor));}
    public static 4(cursor: IDataCursor, format: ReaderLike): bigint{return format[4](cursor);}
    public static 7(cursor: IDataCursor, format: ReaderLike): Uint8Array{return format[7](cursor);}
    public static 8(cursor: IDataCursor, format: ReaderLike): string{return format[8](cursor);}
    public static 11(cursor: IDataCursor, format: ReaderLike): Int32Array{return format[11](cursor);}
    public static 12(cursor: IDataCursor, format: ReaderLike): BigInt64Array{return format[12](cursor);}
    public static 10(cursor: IDataCursor, format: ReaderLike): object {
        // Empty Object prototype for safety, maybe for performance as well?
        const _: Record<string, unknown> = {};
        let type;
        while((type = format.readType(cursor)) !== 0)
            _[format["8"](cursor)] = this[type as 1](cursor, format);
        return _;
    }
    public static 9(cursor: IDataCursor, format: ReaderLike): unknown[] {
        const type = format.readType(cursor);
        const length = format.readArrayLength(cursor);
        if (type === 0 || length === 0) return [];
        if (!(type in this)) throw new SyntaxError('Unexpected NBT token type: ' + type);
        // Do not use Array.from, its slow as hell, i know ecma didn't cooked well with this one
        // eslint-disable-next-line no-new-array
        const _: unknown[] = new Array(length);
        const func: () => unknown = this[type as 1].bind(this, cursor, format);
        for (let i = 0; i < length; i++) _[i] = func();
        return _;
    }
    public static parseRootSync<T>(this: typeof TypedReader, cursor: IDataCursor, format: ReaderLike): T{
        const type = format.readType(cursor);
        let _ = format[8](cursor);
        return this[type as 1](cursor, format) as T;
    }
    public static parseSync<T>(this: typeof TypedReader, cursor: IDataCursor, format: ReaderLike): T{
        const type = format.readType(cursor);
        return this[type as 1](cursor, format) as T;
    }
    public static parseExplicitSync<T>(this: typeof TypedReader, cursor: IDataCursor, type: TagType, format: ReaderLike): T{
        return this[type as 1](cursor, format) as T;
    }
}