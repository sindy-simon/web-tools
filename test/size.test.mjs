import { test } from "node:test";
import assert from "node:assert/strict";
import {
  lookupShoe,
  lookupClothing,
  SHOE_TABLE_MEN,
  SHOE_TABLE_WOMEN,
  CLOTHING_TABLE_WOMEN,
} from "../js/lib/size.mjs";

test("靴: メンズ US=9 は 27.0cm(完全一致)", () => {
  const r = lookupShoe({ category: "men", system: "us", value: 9 });
  assert.equal(r.jp, 27.0);
  assert.equal(r.uk, 8.5);
  assert.equal(r.eu, 42.5);
  assert.equal(r.exact, true);
});

test("靴: 同じ US 値でもメンズとレディースで cm が違う(別テーブル)", () => {
  const men = lookupShoe({ category: "men", system: "us", value: 7 });
  const women = lookupShoe({ category: "women", system: "us", value: 7 });
  assert.equal(men.jp, 25.0);
  assert.equal(women.jp, 24.0);
  assert.notEqual(men.jp, women.jp);
});

test("靴: cm 基準でも引ける(レディース 23.0cm → US6)", () => {
  const r = lookupShoe({ category: "women", system: "jp", value: 23.0 });
  assert.equal(r.us, 6);
  assert.equal(r.exact, true);
});

test("靴: 範囲内の中間値は最も近い行を返し exact:false", () => {
  // メンズ US に 9.2 は無い → 最も近い 9 の行
  const r = lookupShoe({ category: "men", system: "us", value: 9.2 });
  assert.equal(r.us, 9);
  assert.equal(r.exact, false);
});

test("靴: 範囲外は RangeError", () => {
  assert.throws(() => lookupShoe({ category: "men", system: "us", value: 99 }), RangeError);
  assert.throws(() => lookupShoe({ category: "men", system: "us", value: 1 }), RangeError);
});

test("靴: 不正なカテゴリ・系統は RangeError、非数値は TypeError", () => {
  assert.throws(() => lookupShoe({ category: "kids", system: "us", value: 9 }), RangeError);
  assert.throws(() => lookupShoe({ category: "men", system: "xx", value: 9 }), RangeError);
  assert.throws(() => lookupShoe({ category: "men", system: "us", value: "abc" }), TypeError);
});

test("服: レディース 国際M → 9号・US6・EU38・UK10", () => {
  const r = lookupClothing({ category: "women", system: "intl", value: "M" });
  assert.equal(r.jp, "9号");
  assert.equal(r.us, "6");
  assert.equal(r.eu, "38");
  assert.equal(r.uk, "10");
});

test("服: 国際表記は小文字でも引ける(xl→XL)", () => {
  const r = lookupClothing({ category: "men", system: "intl", value: "xl" });
  assert.equal(r.intl, "XL");
  assert.equal(r.jp, "LL");
});

test("服: 日本表記から引ける(レディース 11号 → 国際L)", () => {
  const r = lookupClothing({ category: "women", system: "jp", value: "11号" });
  assert.equal(r.intl, "L");
});

test("服: 一致しないサイズ・不正カテゴリは RangeError、空文字は TypeError", () => {
  assert.throws(() => lookupClothing({ category: "women", system: "intl", value: "XXXL" }), RangeError);
  assert.throws(() => lookupClothing({ category: "kids", system: "intl", value: "M" }), RangeError);
  assert.throws(() => lookupClothing({ category: "women", system: "intl", value: "" }), TypeError);
});

test("テーブルの整合性: 靴は jp が昇順・服は6段階(XS〜XXL)", () => {
  for (const table of [SHOE_TABLE_MEN, SHOE_TABLE_WOMEN]) {
    for (let i = 1; i < table.length; i++) {
      assert.ok(table[i].jp > table[i - 1].jp, "jp は昇順であるべき");
    }
  }
  assert.equal(CLOTHING_TABLE_WOMEN.length, 6);
});
