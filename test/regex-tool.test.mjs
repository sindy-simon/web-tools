import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRegex,
  findMatches,
  replaceAll,
} from "../js/lib/regex-tool.mjs";

test("buildRegex は正しいパターンを生成し、不正はエラー", () => {
  assert.equal(buildRegex("\\d+").ok, true);
  const bad = buildRegex("(");
  assert.equal(bad.ok, false);
  assert.equal(typeof bad.error, "string");
});

test("findMatches はマッチ全件を位置つきで返す", () => {
  const r = findMatches("\\d+", "", "a1b22c333");
  assert.equal(r.ok, true);
  assert.deepEqual(r.matches.map((m) => m.value), ["1", "22", "333"]);
  assert.equal(r.matches[0].index, 1);
  assert.equal(r.matches[1].index, 3);
});

test("キャプチャグループを返す", () => {
  const r = findMatches("(\\w)(\\w)", "", "ab");
  assert.deepEqual(r.matches[0].groups, ["a", "b"]);
});

test("名前付きグループを返す", () => {
  const r = findMatches("(?<year>\\d{4})", "", "2026年");
  assert.deepEqual(r.matches[0].named, { year: "2026" });
});

test("i フラグで大文字小文字を無視する", () => {
  const r = findMatches("abc", "i", "XABCY");
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].value, "ABC");
});

test("不正なパターンは ok:false を返す", () => {
  const r = findMatches("(", "", "abc");
  assert.equal(r.ok, false);
  assert.equal(r.matches.length, 0);
});

test("空マッチでも無限ループしない", () => {
  const r = findMatches("a*", "", "baa");
  assert.equal(r.ok, true);
  assert.ok(r.matches.length > 0);
});

test("replaceAll は全マッチを置換する", () => {
  const r = replaceAll("\\d+", "", "a1b2c3", "#");
  assert.equal(r.ok, true);
  assert.equal(r.result, "a#b#c#");
});

test("replaceAll は後方参照を使える", () => {
  const r = replaceAll("(\\w)(\\w)", "", "ab", "$2$1");
  assert.equal(r.result, "ba");
});

test("文字列以外はエラー", () => {
  assert.throws(() => findMatches("\\d", "", 123), TypeError);
  assert.throws(() => buildRegex(123), TypeError);
});
