import { test } from "node:test";
import assert from "node:assert/strict";
import { toJst, fromJst, CITIES } from "../js/lib/timezone.mjs";

test("LA時間 → JST（冬）: 2024-01-01 00:00 PT = 2024-01-01 17:00 JST", () => {
  const r = toJst("2024-01-01 00:00:00", "America/Los_Angeles");
  assert.equal(r.jst.slice(0, 16), "2024-01-01 17:00");
});

test("JST → LA時間（冬）: 2024-01-01 17:00 JST = 2024-01-01 00:00 PT", () => {
  const r = fromJst("2024-01-01 17:00:00", "America/Los_Angeles");
  assert.equal(r.target.slice(0, 16), "2024-01-01 00:00");
});

test("ニューヨーク時間 → JST（冬）: 2024-01-01 00:00 ET = 2024-01-01 14:00 JST", () => {
  const r = toJst("2024-01-01 00:00:00", "America/New_York");
  assert.equal(r.jst.slice(0, 16), "2024-01-01 14:00");
});

test("ロンドン時間 → JST（夏/BST）: 2024-07-01 00:00 BST = 2024-07-01 08:00 JST", () => {
  // BST = UTC+1, JST = UTC+9, 差 8時間
  const r = toJst("2024-07-01 00:00:00", "Europe/London");
  assert.equal(r.jst.slice(0, 16), "2024-07-01 08:00");
});

test("シドニー時間 → JST（夏/AEDT）: 2024-01-01 00:00 AEDT = 2023-12-31 22:00 JST", () => {
  // AEDT = UTC+11, JST = UTC+9, 差 -2時間
  const r = toJst("2024-01-01 00:00:00", "Australia/Sydney");
  assert.equal(r.jst.slice(0, 16), "2023-12-31 22:00");
});

test("CITIES の全 tz が有効（Intl でエラーなし）", () => {
  for (const c of CITIES) {
    assert.doesNotThrow(() => {
      new Intl.DateTimeFormat("ja-JP", { timeZone: c.tz });
    }, `tz=${c.tz} は無効`);
  }
});

test("不明 tz は RangeError", () => {
  assert.throws(() => toJst("2024-01-01 00:00:00", "Asia/Nowhere"), RangeError);
});

test("不正な日付文字列は TypeError", () => {
  assert.throws(() => toJst("not-a-date", "Asia/Tokyo"), TypeError);
});
