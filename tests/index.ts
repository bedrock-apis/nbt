import { IDataCursor } from "@bedrock-apis/nbt-core";
import { NBTTokenize, TokenReader } from "../main/dist/async.js";
import { parseRootSync, writeRootSync, NBT_FORMAT_WRITER } from "../main/dist/main.js";

const obj: Record<number, string> = {};
for (let i = 0; i < 10000; i++) obj[i] = "TheTestThatReallyMattersFocusedOnStringSerialization".repeat(100);

async_little: {
    console.time("async writer");
    for await(const _ of new TokenReader(NBTTokenize.getRootIterator(obj), NBT_FORMAT_WRITER, new Uint8Array(1 << 15)));
    console.timeEnd("async writer");
}
sync_root_little: {
    const cursor = createCursor(new Uint8Array(1 << 26));
    writeRootSync(cursor, obj);
    cursor.pointer = 0;
    parseRootSync(cursor);
    cursor.pointer = 0;
}

function createCursor(buffer: Uint8Array): IDataCursor {
    return {
        pointer: 0,
        buffer,
        view: new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    }
}
