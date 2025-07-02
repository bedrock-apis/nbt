
import { TagType, IDataCursor } from '@bedrock-apis/nbt-core';

export interface ReaderLike {
   readType(cursor: IDataCursor): TagType;
   readStringLength(cursor: IDataCursor): number;
   readArrayLength(cursor: IDataCursor): number;

   [TagType.Byte](cursor: IDataCursor): number;
   [TagType.Short](cursor: IDataCursor): number;
   [TagType.Int](cursor: IDataCursor): number;
   [TagType.Long](cursor: IDataCursor): bigint;
   [TagType.Float](cursor: IDataCursor): number;
   [TagType.Double](cursor: IDataCursor): number;
   [TagType.ByteArray](cursor: IDataCursor): Uint8Array;

   [TagType.String](cursor: IDataCursor): string;
   [TagType.IntArray](cursor: IDataCursor): Int32Array;
   [TagType.LongArray](cursor: IDataCursor): BigInt64Array;
   [TagType.List](cursor: IDataCursor): unknown[];
   [TagType.Compound](cursor: IDataCursor): object;
}