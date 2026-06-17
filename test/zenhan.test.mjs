import { test } from "node:test";
import assert from "node:assert/strict";
import { toHalfWidth, toFullWidth } from "../js/lib/zenhan.mjs";

test("英数字を全角化する", () => {
  assert.equal(toFullWidth("ABC123"), "ＡＢＣ１２３");
});

test("英数字を半角化する", () => {
  assert.equal(toHalfWidth("ＡＢＣ１２３"), "ABC123");
});

test("記号を相互変換する", () => {
  assert.equal(toFullWidth("!?&@#"), "！？＆＠＃");
  assert.equal(toHalfWidth("！？＆＠＃"), "!?&@#");
});

test("スペースを相互変換する", () => {
  assert.equal(toFullWidth("a b"), "ａ　ｂ");
  assert.equal(toHalfWidth("ａ　ｂ"), "a b");
});

test("半角カナを全角カナにする", () => {
  assert.equal(toFullWidth("ｱｲｳｴｵ"), "アイウエオ");
  assert.equal(toFullWidth("ﾊﾛｰ"), "ハロー");
});

test("半角カナの濁点・半濁点を結合して全角化する", () => {
  assert.equal(toFullWidth("ｶﾞｷﾞｸﾞ"), "ガギグ");
  assert.equal(toFullWidth("ﾊﾟﾋﾟ"), "パピ");
  assert.equal(toFullWidth("ｳﾞ"), "ヴ");
  assert.equal(toFullWidth("ﾃﾞｰﾀ"), "データ");
});

test("全角カナを半角カナにする(濁点は2文字に分解)", () => {
  assert.equal(toHalfWidth("アイウエオ"), "ｱｲｳｴｵ");
  assert.equal(toHalfWidth("ガパヴ"), "ｶﾞﾊﾟｳﾞ");
  assert.equal(toHalfWidth("データ"), "ﾃﾞｰﾀ");
});

test("対象外の文字(ひらがな・漢字)はそのまま通す", () => {
  assert.equal(toFullWidth("あ漢A"), "あ漢Ａ");
  assert.equal(toHalfWidth("あ漢Ａ"), "あ漢A");
});

test("英数字混在の和文を変換できる", () => {
  assert.equal(toFullWidth("ﾊﾛｰ123!"), "ハロー１２３！");
});

test("全角化は冪等(2回かけても結果は変わらない)", () => {
  const once = toFullWidth("Abc ｶﾞ!");
  assert.equal(toFullWidth(once), once);
});

test("英数字記号は往復しても元に戻る", () => {
  const s = "Hello, World! 2026 @sample #tag";
  assert.equal(toHalfWidth(toFullWidth(s)), s);
});

test("空文字は空文字を返す", () => {
  assert.equal(toFullWidth(""), "");
  assert.equal(toHalfWidth(""), "");
});

test("文字列以外はエラー", () => {
  assert.throws(() => toFullWidth(123), TypeError);
  assert.throws(() => toHalfWidth(null), TypeError);
});
