export interface IDataCursor<T extends ArrayBufferLike = ArrayBufferLike> {
   readonly buffer: Uint8Array<T>;
   readonly view: DataView<T>;
   pointer: number;
}