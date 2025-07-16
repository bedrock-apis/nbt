import { IDataCursor } from "@bedrock-apis/nbt-core";

export const UTF8_DECODER: TextDecoder = new TextDecoder();
export const UTF8_ENCODER: TextEncoder = new TextEncoder();
export const UTF8_BUFFER_HELPER: Uint8Array = new Uint8Array(32768);
export function zigZagEncode32(n: number): number {
    return (n << 1) ^ (n >> 31);
}
export function zigZagDecode32(n: number): number {
    return (n >>> 1) ^ -(n & 1);
}
export function zigZagEncode64(n: bigint): bigint {
    return (n << 1n) ^ (n >> 63n);
}
export function zigZagDecode64(n: bigint): bigint {
    return (n >> 1n) ^ -(n & 1n);
}
export function readVarInt32(cursor: IDataCursor): number {
    for (let i = 0, shift = 0, num = 0; i < 5; i++, shift += 7) {
        const byte = cursor.buffer[cursor.pointer++];
        num |= (byte & 0x7F) << shift;
        if ((byte & 0x80) === 0) return num;
    }
    throw new Error("VarInt32 too long: exceeds 5 bytes");
}
export function readVarInt64(cursor: IDataCursor): bigint {
    for (let i = 0, shift = 0n, num = 0n; i < 10; i++, shift += 7n) {
        const byte = BigInt(cursor.buffer[cursor.pointer++]);
        num |= (byte & 0x7Fn) << shift;
        if ((byte & 0x80n) === 0n) return num;
    }
    throw new Error("VarInt64 too long: exceeds 10 bytes");
}
export function writeVarInt32(cursor: IDataCursor,n: number): void {
    for (let i = 0; i < 5; i++) {
        if ((n & ~0x7F) === 0) return void (cursor.buffer[cursor.pointer++] = n);
        cursor.buffer[cursor.pointer++] = (n & 0x7F) | 0x80;
        n >>>= 7;
    }
}
export function writeVarInt64(cursor: IDataCursor, n: bigint): void {
    for (let i = 0; i < 10; i++) {
        if ((n & ~0x7Fn) === 0n) return void (cursor.buffer[cursor.pointer++] = Number(n));
        cursor.buffer[cursor.pointer++] = Number((n & 0x7Fn) | 0x80n);
        n >>= 7n;
    }
    throw new ReferenceError("Exceeded size for VarInt64 max up to 10bytes");
}