// oxlint-disable no-unsafe-declaration-merging
import { TagType } from "./tag-type";

export class Byte extends Number {
    public static readonly internalTagType: number;
}
export class Short extends Number {
    public static readonly internalTagType: number;
}
export class Int extends Number {
    public static readonly internalTagType: number;
}
export class Float extends Number {
    public static readonly internalTagType: number;
}
export class Double extends Number {
    public static readonly internalTagType: number;
}
export class Long {
    public static readonly internalTagType: number;
    public constructor(
    public readonly value: bigint){}
    public valueOf(): bigint{return this.value;}
}
export interface Byte {readonly internalTagType: number;}
export interface Short {readonly internalTagType: number;}
export interface Int {readonly internalTagType: number;}
export interface Float {readonly internalTagType: number;}
export interface Double {readonly internalTagType: number;}
export interface Long {readonly internalTagType: number;}
declare global {
    interface Uint8ArrayConstructor {
        readonly internalTagType: number;
    }
    interface Int32ArrayConstructor {
        readonly internalTagType: number;
    }
    interface BigInt64ArrayConstructor {
        readonly internalTagType: number;
    }
    interface ArrayConstructor {
        readonly internalTagType: number;
    }
    interface StringConstructor {
        readonly internalTagType: number;
    }
    interface ObjectConstructor {
        readonly internalTagType: number;
    }

    interface Uint8Array {
        readonly internalTagType: number;
    }
    interface Int32Array {
        readonly internalTagType: number;
    }
    interface BigInt64Array {
        readonly internalTagType: number;
    }
    interface Array<T> {
        readonly internalTagType: number;
    }
    interface String {
        readonly internalTagType: number;
    }
    interface Object {
        readonly internalTagType: number;
    }
}
{
    const impls = [Byte, Short, Int, Long, Float, Double, String, Array, Uint8Array, Int32Array, BigInt64Array, Object];
    const types = [TagType.Byte, TagType.Short, TagType.Int, TagType.Long, TagType.Float, TagType.Double, TagType.String, TagType.List, TagType.ByteArray, TagType.IntArray, TagType.LongArray, TagType.Compound];
    for(let i = 0; i < impls.length; i++)
    {
        const type = impls[i];
        const property = {enumerable: false, configurable: true, writable: true, value: types[i]}
        Reflect.defineProperty(type, "internalTagType", property);
        Reflect.defineProperty(type.prototype, "internalTagType", property);
    }
}