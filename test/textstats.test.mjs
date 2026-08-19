import { test } from "node:test";
import assert from "node:assert/strict";
import { textStats } from "../js/lib/textstats.mjs";

test("空文字列はすべて0", () => {
  assert.deepEqual(textStats(""), {
    total: 0,
    codePoints: 0,
    noWhitespace: 0,
    lines: 0,
    utf8Bytes: 0,
    manuscriptPages: 0,
  });
});

test("日本語は画面上の文字数とUTF-8形式のデータ量を返す", () => {
  const result = textStats("あいう");
  assert.equal(result.total, 3);
  assert.equal(result.codePoints, 3);
  assert.equal(result.noWhitespace, 3);
  assert.equal(result.lines, 1);
  assert.equal(result.utf8Bytes, 9);
});

test("空白・改行を除いた文字数と行数を返す", () => {
  const result = textStats("a b\nc");
  assert.equal(result.total, 5);
  assert.equal(result.noWhitespace, 3);
  assert.equal(result.lines, 2);
});

test("全角スペースも空白として除外する", () => {
  const result = textStats("あ　い");
  assert.equal(result.total, 3);
  assert.equal(result.noWhitespace, 2);
});

test("結合絵文字は画面上の1文字、内部では複数として数える", () => {
  assert.equal(textStats("👨‍👩‍👧‍👦").total, 1);
  assert.equal(textStats("👨‍👩‍👧‍👦").codePoints, 7);
  assert.equal(textStats("👍🏽").total, 1);
  assert.equal(textStats("👍🏽").codePoints, 2);
  assert.equal(textStats("🇯🇵").total, 1);
  assert.equal(textStats("🇯🇵").codePoints, 2);
  assert.equal(textStats("\u304B\u3099").total, 1);
});

test("末尾の改行は新しい行として数えない", () => {
  assert.equal(textStats("a\n").lines, 1);
  assert.equal(textStats("a\nb\n").lines, 2);
  assert.equal(textStats("a\nb").lines, 2);
  assert.equal(textStats("\n").lines, 1);
});

test("Windows形式の改行を1つの改行として扱う", () => {
  const result = textStats("a\r\nb");
  assert.equal(result.lines, 2);
  assert.equal(result.total, 3);
  assert.equal(result.codePoints, 4);
  assert.equal(result.noWhitespace, 2);
});


test("原稿用紙換算は400文字ごとに切り上げる", () => {
  assert.equal(textStats("あ".repeat(400)).manuscriptPages, 1);
  assert.equal(textStats("あ".repeat(401)).manuscriptPages, 2);
});

test("原稿用紙換算は空白込みの画面上の文字数を使う", () => {
  assert.equal(textStats("あ".repeat(400) + "   ").manuscriptPages, 2);
});

test("文字列以外はTypeError", () => {
  assert.throws(() => textStats(123), TypeError);
});
