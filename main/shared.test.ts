import { expect, test } from 'vitest'
import * as ZIG from './shared';


test('ZigZag32 code/decode', () => {
  expect(ZIG.zigZagDecode32(ZIG.zigZagEncode32(-351))).toBe(-351);
  expect(ZIG.zigZagDecode32(ZIG.zigZagEncode32(3512))).toBe(3512);
});
test('ZigZag64 code/decode', () => {
  expect(ZIG.zigZagDecode64(ZIG.zigZagEncode64(-351n))).toBe(-351n);
  expect(ZIG.zigZagDecode64(ZIG.zigZagEncode64(3512n))).toBe(3512n);
});