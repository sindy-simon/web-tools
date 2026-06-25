import { test } from "node:test";
import assert from "node:assert/strict";
import { toWareki, warekiYearToSeireki, calcAge, calcDaysBetween } from "../js/lib/age.mjs";

// --- toWareki ---
test("令和元年: 2019-05-01 は令和1年", () => {
  const r = toWareki("2019-05-01");
  assert.equal(r.era, "令和");
  assert.equal(r.year, 1);
});

test("平成元年: 1989-01-08 は平成1年", () => {
  const r = toWareki("1989-01-08");
  assert.equal(r.era, "平成");
  assert.equal(r.year, 1);
});

test("昭和64年: 1989-01-07 は昭和64年", () => {
  const r = toWareki("1989-01-07");
  assert.equal(r.era, "昭和");
  assert.equal(r.year, 64);
});

test("令和6年: 2024-04-15", () => {
  const r = toWareki("2024-04-15");
  assert.equal(r.era, "令和");
  assert.equal(r.year, 6);
  assert.equal(r.label, "令和6年4月15日");
});

test("明治以前は RangeError", () => {
  assert.throws(() => toWareki("1860-01-01"), RangeError);
});

// --- warekiYearToSeireki ---
test("令和6年 → 2024年", () => {
  assert.equal(warekiYearToSeireki("令和", 6), 2024);
});

test("平成31年 → 2019年", () => {
  assert.equal(warekiYearToSeireki("平成", 31), 2019);
});

test("昭和64年 → 1989年", () => {
  assert.equal(warekiYearToSeireki("昭和", 64), 1989);
});

test("不明な元号は RangeError", () => {
  assert.throws(() => warekiYearToSeireki("大化", 1), RangeError);
});

// --- calcAge ---
test("基本: 2000-01-01 生まれ、2024-01-01 時点で24歳", () => {
  const r = calcAge("2000-01-01", "2024-01-01");
  assert.equal(r.age, 24);
});

test("誕生日当日で年齢が上がる", () => {
  const r = calcAge("1990-06-15", "2024-06-15");
  assert.equal(r.age, 34);
});

test("誕生日の前日はまだ33歳", () => {
  const r = calcAge("1990-06-15", "2024-06-14");
  assert.equal(r.age, 33);
});

test("未来の誕生日は RangeError", () => {
  assert.throws(() => calcAge("2099-01-01", "2024-01-01"), RangeError);
});

// --- calcDaysBetween ---
test("同日は0日", () => {
  assert.equal(calcDaysBetween("2024-01-01", "2024-01-01").days, 0);
});

test("1週間 = 7日", () => {
  const r = calcDaysBetween("2024-01-01", "2024-01-08");
  assert.equal(r.days, 7);
  assert.equal(r.weeks, 1);
  assert.equal(r.remainingDays, 0);
});

test("逆順のとき reversed=true・days=-1", () => {
  const r = calcDaysBetween("2024-01-02", "2024-01-01");
  assert.equal(r.days, -1);
  assert.equal(r.reversed, true);
});

test("不正な日付文字列は TypeError", () => {
  assert.throws(() => calcAge("not-a-date", "2024-01-01"), TypeError);
});
