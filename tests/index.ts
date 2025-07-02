import { NBT_BIG_ENDIAN_FORMAT, parseRootSync } from "../main/dist/main.js";

const response = await fetch(new URL("../data-tests/test3.nbt",import.meta.url))
const buffer = await new Response(response.body?.pipeThrough(new DecompressionStream("gzip"))).bytes();

console.time("Test");
for(let i = 0; i < 10; i++)
parseRootSync({buffer, view: new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength), pointer: 0}, NBT_BIG_ENDIAN_FORMAT)
console.timeEnd("Test");
/*
using file = await Deno.open("./data-tests/test_entities.mcstructure", { read: true });
let stack: Async.Token[] = [];
for await (const token of file.readable.pipeThrough(new TransformStream(new Async.NBTTokenizerTransformer(new Uint8Array(65536), NBT_FORMAT, Async.ReadMode.RootTag)))) {
    switch ((token as any).type) {
        case 10: {
            const length: number = (token as any).length;
            const size = length * 2;
            let obj: Record<any, any> = {};
            for (let i = 0; i < size; i++) {
                const key = stack[stack.length - size + i++];
                const value = stack[stack.length - size + i];
                obj[key as any] = value;
            }
            stack.length -= size
            stack.push(obj as any);
            break;
        }
        case 9: {
            const length: number = (token as any).length;
            if (length === 0) {
                stack.push([]);
                break;
            }
            const newArray = stack.slice(-length);
            stack.length -= length;
            stack.push(newArray as any);
            break;
        }
        default: {
            if (token instanceof Number) {
                stack.push(token.valueOf() as any);
                break;
            }
            stack.push(token);
        }
    }
    console.clear();
    console.log(stack.slice(-20),"STACK SIZE: " + stack.length)
}
//console.log(stack);
*/