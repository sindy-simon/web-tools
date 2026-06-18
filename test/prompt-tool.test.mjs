import { test } from "node:test";
import assert from "node:assert/strict";
import {
  estimateTokens,
  normalizeForPrompt,
  optimizePrompt,
} from "../js/lib/prompt-tool.mjs";

test("空文字は0トークン", () => {
  assert.equal(estimateTokens(""), 0);
});

test("漢字は約1トークン/字", () => {
  assert.equal(estimateTokens("日本語"), 3);
});

test("ASCIIは約4文字で1トークン", () => {
  assert.equal(estimateTokens("hello world"), 3); // 11/4 ≈ 2.75 → 3
});

test("トークン数は文字が増えれば増える(単調)", () => {
  assert.ok(estimateTokens("あいうえおかきくけこ") > estimateTokens("あい"));
});

test("normalize: 全角英数記号を半角にする", () => {
  assert.equal(normalizeForPrompt("０１２ＡＢＣ！"), "012ABC!");
});

test("normalize: 全角・連続スペースを1つにする", () => {
  assert.equal(normalizeForPrompt("a　b"), "a b");
  assert.equal(normalizeForPrompt("a   b"), "a b");
});

test("normalize: 3行以上の空行を2行に圧縮", () => {
  assert.equal(normalizeForPrompt("a\n\n\n\nb"), "a\n\nb");
});

test("normalize: かなはそのまま(半角カナ化しない)", () => {
  assert.equal(normalizeForPrompt("ひらがな"), "ひらがな");
});

test("optimize: 全角を減らすとトークンが減る", () => {
  const r = optimizePrompt("０１２　ＡＢＣ");
  assert.equal(r.optimized, "012 ABC");
  assert.ok(r.after.tokens <= r.before.tokens);
  assert.ok(r.savedTokens >= 0);
});

test("文字列以外はエラー", () => {
  assert.throws(() => estimateTokens(123), TypeError);
  assert.throws(() => optimizePrompt(null), TypeError);
});
