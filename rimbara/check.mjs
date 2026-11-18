import assert from "node:assert/strict";
import { validCart, addItem, priceFor } from "./src/cart.js";
import { interpolatePose } from "./src/motion.js";
assert.deepEqual(
  validCart([
    { id: "bad", size: 50, quantity: 1 },
    { id: "embun", size: 50, quantity: -1 },
  ]),
  [],
);
assert.deepEqual(
  addItem([{ id: "embun", size: 50, quantity: 19 }], "embun", 50, 3),
  [{ id: "embun", size: 50, quantity: 20 }],
);
assert.equal(priceFor("embun", 50), 890000);
assert.equal(addItem([], "iris", 30, 1)[0].size, 30);
const a = { scroll: 0, x: 0, y: 0, height: 100, rx: 0, ry: 0, rz: 0 };
const b = { scroll: 100, x: 100, y: 100, height: 200, rx: 1, ry: 1, rz: 1 };
assert.equal(interpolatePose(50, [a, b]).x, 50);
assert.equal(interpolatePose(100, [a, b]).height, 200);
assert.equal(interpolatePose(150, [a, b]).y, 50);
const landed = [
  { ...a, y: 400 },
  { ...b, y: 300 },
];
assert.equal(interpolatePose(25, landed).y, 375);
console.log(
  "Cart validation, quantity limits, pricing, and scroll interpolation passed.",
);
