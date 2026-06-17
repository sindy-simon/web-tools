import { test } from "node:test";
import assert from "node:assert/strict";
import { textStats } from "../js/lib/textstats.mjs";

test("空文字列はすべて 0", () => {
  assert.deepEqual(textStats(""), {
    total: 0,
    noWhitespace: 0,
    lines: 0,
    utf8Bytes: 0,
    manuscriptPages: 0,
  });
});

test("日本語は 1 文字 3 バイト(UTF-8)で数える", () => {
  const s = textStats("あいう");
  assert.equal(s.total, 3);
  assert.equal(s.noWhitespace, 3);
  assert.equal(s.lines, 1);
  assert.equal(s.utf8Bytes, 9);
});

test("空白・改行は noWhitespace から除外、行数は改行で数える", () => {
  const s = textStats("a b\nc");
  assert.equal(s.total, 5);
  assert.equal(s.noWhitespace, 3);
  assert.equal(s.lines, 2);
});

test("全角スペースも空白として除外する", () => {
  const s = textStats("あ　い");
  assert.equal(s.total, 3);
  assert.equal(s.noWhitespace, 2);
});

test("サロゲートペア(絵文字)は 1 文字と数える", () => {
  const s = textStats("😀");
  assert.equal(s.total, 1);
  assert.equal(s.utf8Bytes, 4);
});

test("複数コードポイントの絵文字は仕様どおり複数文字(コードポイント単位)", () => {
  assert.equal(textStats("👨‍👩‍👧‍👦").total, 7); // ZWJ 結合の家族絵文字
  assert.equal(textStats("👍🏽").total, 2); // 肌色修飾
  assert.equal(textStats("🇯🇵").total, 2); // 国旗(地域指示記号 2 つ)
  assert.equal(textStats("\u304B\u3099").total, 2); // か + 結合用濁点(分解形)= が
});

test("末尾の改行は行数に含めない(エディタ準拠)", () => {
  assert.equal(textStats("a\n").lines, 1);
  assert.equal(textStats("a\nb\n").lines, 2);
  assert.equal(textStats("a\nb").lines, 2);
  assert.equal(textStats("\n").lines, 1); // 空行 1 つ
});

test("CRLF でも行数は正しい(\\r は文字数に含まれる)", () => {
  const s = textStats("a\r\nb");
  assert.equal(s.lines, 2);
  assert.equal(s.total, 4); // \r も 1 文字
  assert.equal(s.noWhitespace, 2); // \r は空白として除外
});

test("原稿用紙換算は 400 字で 1 枚、401 字で 2 枚", () => {
  assert.equal(textStats("あ".repeat(400)).manuscriptPages, 1);
  assert.equal(textStats("あ".repeat(401)).manuscriptPages, 2);
});

test("原稿用紙換算は空白込み(total)で繰り上げる", () => {
  assert.equal(textStats("あ".repeat(400) + "   ").manuscriptPages, 2);
});

test("文字列以外は TypeError", () => {
  assert.throws(() => textStats(123), TypeError);
});
