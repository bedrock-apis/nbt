// oxlint-disable no-unsafe-declaration-merging
import { TagType } from "./tag-type";

const { create } = Object, { setPrototypeOf, defineProperty } = Reflect;
const SHARED_PROTOTYPE: object = {
    valueOf(this: { value: any }) { return this.value; }
}
const NUMBER_FACTORY = <T>(name: string, $: number | bigint) => {
    function TypedNumber(this: unknown, _: number | bigint) {
        const value = this ?? create(prototype);
        value.value = _ ?? $;
        return value;
    }
    const { prototype } = TypedNumber;
    setPrototypeOf(prototype, SHARED_PROTOTYPE);
    defineProperty(TypedNumber, "name", { configurable: true, enumerable: false, writable: false, value: name });
    return TypedNumber as T;
}
export interface Constructor<T extends Prototype<unknown>> {
    new(value?: T extends Prototype<infer V>?V:never): T;
    readonly prototype: T;
    readonly internalTagType: TagType;
}
export interface Prototype<T = number> {
    readonly internalTagType: TagType;
    valueOf(): T;
}
export interface Byte extends Prototype { }
export interface Short extends Prototype { }
export interface Int extends Prototype { }
export interface Long extends Prototype<bigint> { }
export interface Float extends Prototype { }
export interface Double extends Prototype { }

export const
    Byte: Constructor<Byte> = NUMBER_FACTORY("Byte",0),
    Short: Constructor<Short> = NUMBER_FACTORY("Short",0),
    Int: Constructor<Int> = NUMBER_FACTORY("Int",0),
    Long: Constructor<Long> = NUMBER_FACTORY("Long",0n),
    Float: Constructor<Float> = NUMBER_FACTORY("Float",0),
    Double: Constructor<Double> = NUMBER_FACTORY("Double",0);


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
    const impls = [Byte, Short, Int, Long, BigInt, Float, Double, String, Array, Uint8Array, Int32Array, BigInt64Array, Object];
    const types = [TagType.Byte, TagType.Short, TagType.Int, TagType.Long, TagType.Long, TagType.Float, TagType.Double, TagType.String, TagType.List, TagType.ByteArray, TagType.IntArray, TagType.LongArray, TagType.Compound];
    for (let i = 0; i < impls.length; i++) {
        const type = impls[i];
        const property = { enumerable: false, configurable: true, writable: true, value: types[i] }
        defineProperty(type, "internalTagType", property);
        defineProperty(type.prototype, "internalTagType", property);
    }
}