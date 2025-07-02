const {create} = Object;
class A extends Number {}
function B(){
    const value = this??create(bp);
    value.value = 0;
    return value;
}
const bp = B.prototype;

console.time("a");
for(let i = 0; i < 1e7; i++) new A;
console.timeEnd("a");
console.time("b");
for(let i = 0; i < 1e7; i++) new B();
console.timeEnd("b");
console.time("c");
for(let i = 0; i < 1e7; i++) B();
console.timeEnd("c");
console.time("c");
for(let i = 0; i < 1e7; i++) BigInt(0n);
console.timeEnd("c");