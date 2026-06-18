import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatJson,
  minifyJson,
  isValidJson,
} from "../js/lib/json-tool.mjs";

test("正しいJSONを2スペースで整形する", () => {
  const r = formatJson('{"a":1,"b":[1,2]}');
  assert.equal(r.ok, true);
  assert.equal(r.error, null);
  assert.equal(r.result, '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
});

test("インデント4スペースを指定できる", () => {
  const r = formatJson('{"a":1}', 4);
  assert.equal(r.result, '{\n    "a": 1\n}');
});

test("タブインデントを指定できる", () => {
  const r = formatJson('{"a":1}', "tab");
  assert.equal(r.result, '{\n\t"a": 1\n}');
});

test("minifyJson は1行に圧縮する", () => {
  const r = minifyJson('{ "a": 1, "b": [1, 2] }');
  assert.equal(r.ok, true);
  assert.equal(r.result, '{"a":1,"b":[1,2]}');
});

test("不正なJSONは ok:false とエラーメッセージを返す", () => {
  const r = formatJson("{a:1}");
  assert.equal(r.ok, false);
  assert.equal(r.result, null);
  assert.equal(typeof r.error, "string");
  assert.ok(r.error.length > 0);
});

test("空文字は不正なJSON扱い", () => {
  assert.equal(formatJson("").ok, false);
});

test("isValidJson は妥当性だけを返す", () => {
  assert.equal(isValidJson('{"a":1}'), true);
  assert.equal(isValidJson("{a:1}"), false);
});

test("整形→圧縮で元の最小形に戻る(冪等)", () => {
  const formatted = formatJson('{"x":[1,{"y":2}]}').result;
  assert.equal(minifyJson(formatted).result, '{"x":[1,{"y":2}]}');
});

test("文字列以外はエラー", () => {
  assert.throws(() => formatJson(123), TypeError);
});
