import { test } from "node:test";
import assert from "node:assert/strict";
import { convertNewlines, normalizeSpaces, compressBlankLines, formatAll, detectNewlines } from "../js/lib/text.mjs";

// --- convertNewlines ---
test("CRLF → LF", () => {
  assert.equal(convertNewlines("a\r\nb\r\nc", "lf"), "a\nb\nc");
});

test("LF → CRLF", () => {
  assert.equal(convertNewlines("a\nb\nc", "crlf"), "a\r\nb\r\nc");
});

test("混在(CR/CRLF/LF) → LF", () => {
  assert.equal(convertNewlines("a\r\nb\rc\nd", "lf"), "a\nb\nc\nd");
});

test("不正な to は TypeError", () => {
  assert.throws(() => convertNewlines("a\nb", "unix"), TypeError);
});

// --- normalizeSpaces ---
test("全角スペース → 半角", () => {
  assert.equal(normalizeSpaces("hello　world"), "hello world");
});

test("連続スペース → 1つ", () => {
  assert.equal(normalizeSpaces("a   b"), "a b");
});

test("行頭行末の空白除去", () => {
  assert.equal(normalizeSpaces("  hello  "), "hello");
});

test("タブも1スペースに", () => {
  assert.equal(normalizeSpaces("a\t\tb"), "a b");
});

// --- compressBlankLines ---
test("連続3空行 → 1空行 (maxBlank=1)", () => {
  const input = "a\n\n\n\nb";
  assert.equal(compressBlankLines(input, 1), "a\n\nb");
});

test("連続空行を全除去 (maxBlank=0)", () => {
  const input = "a\n\n\nb";
  assert.equal(compressBlankLines(input, 0), "a\nb");
});

// --- formatAll ---
test("CRLF + 全角スペース + 空行まとめて整形", () => {
  const input = "hello\r\n　world\r\n\r\n\r\nend";
  const r = formatAll(input, { newlines: "lf", spaces: true, maxBlank: 1 });
  assert.equal(r, "hello\nworld\n\nend");
});

// --- detectNewlines ---
test("LF のみ検出", () => {
  const r = detectNewlines("a\nb\nc");
  assert.equal(r.lf, 2);
  assert.equal(r.crlf, 0);
  assert.equal(r.dominant, "LF");
});

test("CRLF のみ検出", () => {
  const r = detectNewlines("a\r\nb\r\nc");
  assert.equal(r.crlf, 2);
  assert.equal(r.dominant, "CRLF");
});
