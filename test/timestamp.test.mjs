import { test } from "node:test";
import assert from "node:assert/strict";
import { unixToJst, jstToUnix, nowUnix } from "../js/lib/timestamp.mjs";

test("unix 0 → 1970-01-01 09:00:00 JST", () => {
  const r = unixToJst(0);
  assert.equal(r.date, "1970-01-01");
  assert.equal(r.time, "09:00:00");
  assert.equal(r.iso, "1970-01-01T09:00:00+09:00");
});

test("unix 1700000000 → 既知の JST 日時", () => {
  // 1700000000 UTC = 2023-11-14 22:13:20 UTC = 2023-11-15 07:13:20 JST
  const r = unixToJst(1700000000);
  assert.equal(r.date, "2023-11-15");
  assert.equal(r.time, "07:13:20");
});

test("ms 自動判別（13桁）", () => {
  const r = unixToJst(1700000000000);
  assert.equal(r.date, "2023-11-15");
});

test("JST 文字列 → unix", () => {
  // 2024-01-01 00:00:00 JST = 2023-12-31 15:00:00 UTC = 1704034800
  const r = jstToUnix("2024-01-01 00:00:00");
  assert.equal(r.unix, 1704034800);
});

test("ISO 形式（T区切り）も受け付け", () => {
  const r = jstToUnix("2024-01-01T00:00:00");
  assert.equal(r.unix, 1704034800);
});

test("unix → jstToUnix 往復", () => {
  const unix = 1700000000;
  const r = unixToJst(unix);
  const back = jstToUnix(r.date + " " + r.time);
  assert.equal(back.unix, unix);
});

test("不正文字列は TypeError", () => {
  assert.throws(() => jstToUnix("not-a-date"), TypeError);
});

test("空文字は TypeError", () => {
  assert.throws(() => jstToUnix(""), TypeError);
});

test("nowUnix は現在時刻を返す（誤差1秒以内）", () => {
  const before = Math.floor(Date.now() / 1000);
  const r = nowUnix();
  const after = Math.ceil(Date.now() / 1000);
  assert.ok(r.unix >= before && r.unix <= after);
});
