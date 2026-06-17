import { test } from "node:test";
import assert from "node:assert/strict";
import {
  charLength,
  xWeightedLength,
  analyze,
  PLATFORMS,
} from "../js/lib/sns-count.mjs";

test("charLength はコードポイント数を数える", () => {
  assert.equal(charLength("あいうえお"), 5);
  assert.equal(charLength("Hello"), 5);
  assert.equal(charLength("😀"), 1);
  assert.equal(charLength(""), 0);
});

test("X方式: 全角は2、半角は1で数える", () => {
  assert.equal(xWeightedLength("あ"), 2);
  assert.equal(xWeightedLength("a"), 1);
  assert.equal(xWeightedLength("あa1"), 4); // 2 + 1 + 1
});

test("X方式: 全角記号は2、半角カナは1", () => {
  assert.equal(xWeightedLength("！"), 2); // 全角(U+FF01)
  assert.equal(xWeightedLength("ｱ"), 1); // 半角カナ(U+FF71)
});

test("X方式: 絵文字は2で数える", () => {
  assert.equal(xWeightedLength("😀"), 2);
});

test("X方式: URLは長さに関わらず23で数える", () => {
  assert.equal(
    xWeightedLength("https://example.com/very/long/path/to/page"),
    23
  );
  // 「テスト」=6 + 半角スペース1 + URL23 = 30
  assert.equal(xWeightedLength("テスト https://t.co/abc"), 30);
});

test("analyze は全プラットフォーム分を返す", () => {
  const r = analyze("あ");
  assert.equal(r.length, PLATFORMS.length);
  const x = r.find((p) => p.id === "x");
  assert.equal(x.used, 2);
  assert.equal(x.remaining, 278);
  assert.equal(x.over, false);
});

test("analyze: Xは重み付き、他は文字数で数える", () => {
  const text = "あ".repeat(150); // 全角150文字
  const r = analyze(text);
  const x = r.find((p) => p.id === "x");
  const insta = r.find((p) => p.id === "instagram");
  assert.equal(x.used, 300); // 150 * 2
  assert.equal(x.over, true); // 上限280超過
  assert.equal(insta.used, 150); // 文字数
  assert.equal(insta.over, false);
});

test("空文字は使用0・残りは上限のまま", () => {
  const r = analyze("");
  for (const p of r) {
    assert.equal(p.used, 0);
    assert.equal(p.remaining, p.limit);
    assert.equal(p.over, false);
  }
});

test("文字列以外はエラー", () => {
  assert.throws(() => charLength(123), TypeError);
  assert.throws(() => xWeightedLength(null), TypeError);
  assert.throws(() => analyze(undefined), TypeError);
});
