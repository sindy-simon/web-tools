import { test } from "node:test";
import assert from "node:assert/strict";
import { addTax, removeTax } from "../js/lib/tax.mjs";

test("税抜→税込(10%)", () => {
  assert.deepEqual(addTax(1000, 10), { price: 1000, tax: 100, total: 1100 });
});

test("税抜→税込(8% 軽減税率)", () => {
  assert.deepEqual(addTax(100, 8), { price: 100, tax: 8, total: 108 });
});

test("端数処理を選べる(123 円の 10%)", () => {
  assert.equal(addTax(123, 10, "floor").tax, 12);
  assert.equal(addTax(123, 10, "round").tax, 12);
  assert.equal(addTax(125, 10, "round").tax, 13);
  assert.equal(addTax(123, 10, "ceil").tax, 13);
});

test("税込→税抜(10%)", () => {
  assert.deepEqual(removeTax(1100, 10), { price: 1000, tax: 100, total: 1100 });
});

test("税込→税抜で割り切れない場合も price + tax = total を保つ", () => {
  const r = removeTax(1000, 10);
  assert.equal(r.price, 909);
  assert.equal(r.tax, 91);
  assert.equal(r.price + r.tax, r.total);
});

test("税込→税抜の端数処理を選べる(100 円の 8%)", () => {
  // ceil は本体価格を切り上げるため税額は小さくなる(floor:8 / round:7 / ceil:7)
  assert.equal(removeTax(100, 8, "floor").price, 92);
  assert.equal(removeTax(100, 8, "round").price, 93);
  assert.equal(removeTax(100, 8, "ceil").price, 93);
});

test("税込→税抜は税額が負にならず price + tax = total を保つ(境界値)", () => {
  for (const total of [1, 8, 9, 100, 1000]) {
    for (const mode of ["floor", "round", "ceil"]) {
      const r = removeTax(total, 10, mode);
      assert.ok(r.tax >= 0, `tax<0: total=${total} ${mode}`);
      assert.equal(r.price + r.tax, r.total);
    }
  }
});

test("浮動小数点誤差で 1 円ズレない(回帰防止)", () => {
  assert.equal(removeTax(1100, 10).price, 1000); // 1100/1.1 の誤差を踏まない
  assert.equal(addTax(99999, 10).tax, 9999);
});

test("0 円はそのまま 0 円", () => {
  assert.deepEqual(addTax(0, 10), { price: 0, tax: 0, total: 0 });
  assert.deepEqual(removeTax(0, 10), { price: 0, tax: 0, total: 0 });
});

test("金額の小数は受け付けない(整数円のみ)", () => {
  assert.throws(() => addTax(1000.5, 10), RangeError);
  assert.throws(() => removeTax(100.5, 10), RangeError);
});

test("不正な入力はエラー", () => {
  assert.throws(() => addTax(-1, 10), RangeError);
  assert.throws(() => addTax(100, NaN), RangeError);
  assert.throws(() => addTax(100, 10, "trunc"), RangeError);
  assert.throws(() => removeTax(-1, 10), RangeError);
});
