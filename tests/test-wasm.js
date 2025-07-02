/**
 * @type {WebAssembly.Module}
 */
const module = await WebAssembly.compileStreaming(fetch("data:application/wasm;base64,AGFzbQEAAAABBQFgAX8AAwMCAAAFAwEAAQcuAwNtZW0CABJyZXZlcnNlX2kzMl9lbmRpYW4AAA9yZXZlcnNlX2FsbF9pMzIAAQpeAjwBAX8gACAAKAIAIQEgAUH/AXFBGHQgAUGA/gNxQQh0ciABQYCA/AdxQQh2ciABQYCAgHhxQRh2cjYCAAsfAQF/QQAhAQNAIAEgAE8NASABEAAgAUEEaiEBDAALCwA4BG5hbWUBFQEAEnJldmVyc2VfaTMyX2VuZGlhbgIaAgACAANpZHgBA3ZhbAECAAZsZW5ndGgBAWk="));

const {mem, reverse_all_i32} = (await WebAssembly.instantiate(module)).exports;
console.log(mem.buffer)
const buffer = new Uint8Array(mem.buffer);
const view = new DataView(mem.buffer);

const array = new Uint32Array(mem.buffer, 0, mem.buffer.byteLength / 4);
for(let i = 0; i < array.length; i++) array[i] = i;
console.time("Test");
reverse_all_i32(array.length * 4);
console.timeEnd("Test");

console.time("Test");
for(let i = 0; i < array.length; i++) array[i] = view.getUint32(i << 2, false);
console.timeEnd("Test");
export {};