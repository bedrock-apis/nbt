import { IDataCursor, TagType } from "@bedrock-apis/nbt-core";

export interface WriterLike {
   writeType(cursor: IDataCursor, value: TagType): void;
   writeStringLength(cursor: IDataCursor, length: number): void;
   writeArrayLength(cursor: IDataCursor, length: number): void;

   [TagType.Byte](cursor: IDataCursor, value: number): void;
   [TagType.Short](cursor: IDataCursor, value: number): void;
   [TagType.Int](cursor: IDataCursor, value: number): void;
   [TagType.Long](cursor: IDataCursor, value: bigint): void;
   [TagType.Float](cursor: IDataCursor, value: number): void;
   [TagType.Double](cursor: IDataCursor, value: number): void;
   [TagType.ByteArray](cursor: IDataCursor, value: Uint8Array): void;

   [TagType.String](cursor: IDataCursor, value: string): void;
   [TagType.IntArray](cursor: IDataCursor, value: Int32Array): void;
   [TagType.LongArray](cursor: IDataCursor, value: BigInt64Array): void;
   [TagType.List](cursor: IDataCursor, value: unknown[]): void;
   [TagType.Compound](cursor: IDataCursor, value: object): void;

   determinateType(_: unknown): TagType;
}