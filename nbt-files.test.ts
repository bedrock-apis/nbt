import {test} from "vitest";
import { IDataCursor } from "./core/dist/main";
import {NBT_NETWORK_VARIANT_FORMAT_READER, parseRootSync} from "./main/readers";
import { readFileSync } from "node:fs";

const buffer = Uint8Array.from(readFileSync("./data-tests/canonical_block_states.nbt"));
const cursor: IDataCursor = {pointer: 0, buffer, view: new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)};
test("VarInt NBT Bedrock", ()=>{
    while(cursor.pointer < cursor.buffer.length) parseRootSync(cursor, NBT_NETWORK_VARIANT_FORMAT_READER);
});