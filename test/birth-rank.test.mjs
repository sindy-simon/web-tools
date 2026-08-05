import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableYears,
  birthsOf,
  birthsPerDay,
  compareToLatest,
  estimateSchoolYearBirths,
  isEarlyBirth,
  notableOf,
  rankOf,
  rankPhrase,
  schoolYearStart,
  summarize,
  LATEST_YEAR,
  YEAR_MAX,
  YEAR_MIN,
} from "../js/lib/birth-rank.mjs";

// --- availableYears ---
test("対応年は 1950〜2024 が連続している", () => {
  const ys = availableYears();
  assert.equal(ys[0], YEAR_MIN);
  assert.equal(ys[ys.length - 1], YEAR_MAX);
  assert.equal(ys.length, YEAR_MAX - YEAR_MIN + 1);
});

// --- birthsOf ---
test("1973年（第2次ベビーブームのピーク）の出生数", () => {
  assert.equal(birthsOf(1973), 2091983);
});

test("1966年（丙午）は前後の年より明確に少ない", () => {
  assert.ok(birthsOf(1966) < birthsOf(1965));
  assert.ok(birthsOf(1966) < birthsOf(1967));
});

test("範囲外の年は RangeError", () => {
  assert.throws(() => birthsOf(1949), RangeError);
  assert.throws(() => birthsOf(2025), RangeError);
});

test("整数でない年は TypeError", () => {
  assert.throws(() => birthsOf("1973"), TypeError);
  assert.throws(() => birthsOf(1973.5), TypeError);
});

// --- rankOf ---
test("1949年以降で最多の年が1位になる", () => {
  const ys = availableYears();
  const top = ys.reduce((a, b) => (birthsOf(b) > birthsOf(a) ? b : a));
  assert.equal(rankOf(top).rank, 1);
  assert.equal(rankOf(top).fromBottom, ys.length);
});

test("最少の年は下から1番目", () => {
  const ys = availableYears();
  const bottom = ys.reduce((a, b) => (birthsOf(b) < birthsOf(a) ? b : a));
  assert.equal(rankOf(bottom).fromBottom, 1);
  assert.equal(rankOf(bottom).rank, ys.length);
});

test("rank と fromBottom の和は 総数+1（同数が無い場合）", () => {
  const r = rankOf(1973);
  assert.equal(r.rank + r.fromBottom, r.total + 1);
});

test("出生数が多い年ほど rank の数値が小さい", () => {
  assert.ok(birthsOf(1973) > birthsOf(2000));
  assert.ok(rankOf(1973).rank < rankOf(2000).rank);
});

// --- rankPhrase ---
test("上位の年は『多い』側で表現される", () => {
  const p = rankPhrase(1973);
  assert.equal(p.direction, "多い");
  assert.ok(p.position <= p.total / 2);
});

test("近年の少子化の年は『少ない』側で表現される", () => {
  const p = rankPhrase(2023);
  assert.equal(p.direction, "少ない");
});

// --- schoolYearStart / isEarlyBirth ---
test("4/2 生まれはその年度の最初", () => {
  assert.equal(schoolYearStart("2000-04-02"), 2000);
  assert.equal(isEarlyBirth("2000-04-02"), false);
});

test("4/1 生まれは前年度（早生まれ）", () => {
  assert.equal(schoolYearStart("2000-04-01"), 1999);
  assert.equal(isEarlyBirth("2000-04-01"), true);
});

test("1/1 生まれは前年度（早生まれ）", () => {
  assert.equal(schoolYearStart("2000-01-01"), 1999);
  assert.equal(isEarlyBirth("2000-01-01"), true);
});

test("12/31 生まれはその年度", () => {
  assert.equal(schoolYearStart("2000-12-31"), 2000);
  assert.equal(isEarlyBirth("2000-12-31"), false);
});

test("不正な日付は TypeError", () => {
  assert.throws(() => schoolYearStart("2000-02-30"), TypeError);
  assert.throws(() => schoolYearStart("2000/04/01"), TypeError);
});

// --- estimateSchoolYearBirths ---
test("同学年の概算は 2年分の出生数の間に収まる", () => {
  const r = estimateSchoolYearBirths("1973-06-01");
  const lo = Math.min(birthsOf(1973), birthsOf(1974));
  const hi = Math.max(birthsOf(1973), birthsOf(1974));
  assert.ok(r.births >= lo && r.births <= hi, `${r.births} が ${lo}〜${hi} の範囲外`);
});

test("同学年は概算であることを明示する", () => {
  assert.equal(estimateSchoolYearBirths("1973-06-01").approximate, true);
});

test("早生まれは前年度の学年として集計される", () => {
  const early = estimateSchoolYearBirths("1974-03-01"); // 1973年度
  const normal = estimateSchoolYearBirths("1973-06-01"); // 1973年度
  assert.equal(early.startYear, normal.startYear);
  assert.equal(early.births, normal.births);
});

test("学年は開始年と終了年が連続する", () => {
  const r = estimateSchoolYearBirths("2000-06-01");
  assert.equal(r.startYear, 2000);
  assert.equal(r.endYear, 2001);
});

test("按分の重みは 4/2〜3/31 の日数比に一致する（1973年度）", () => {
  // 1973 は平年(365日)。4/1 は年初から 91 日目 → 前半 = 365-91 = 274 日
  // 1974 も平年。1/1〜4/1 は 91 日
  const expected = Math.round(birthsOf(1973) * (274 / 365) + birthsOf(1974) * (91 / 365));
  assert.equal(estimateSchoolYearBirths("1973-06-01").births, expected);
});

test("最終年度を超える日付は RangeError", () => {
  assert.throws(() => estimateSchoolYearBirths(`${YEAR_MAX}-06-01`), RangeError);
});

// --- compareToLatest ---
test("最新年どうしの比較は等倍になる", () => {
  const c = compareToLatest(LATEST_YEAR);
  assert.equal(c.ratio, 1);
  assert.equal(c.per100, 100);
  assert.equal(c.diff, 0);
});

test("ベビーブーム期は最新年より多い（per100 > 100）", () => {
  const c = compareToLatest(1973);
  assert.ok(c.ratio > 2, `ratio=${c.ratio}`);
  assert.ok(c.per100 > 200);
  assert.ok(c.diff > 0);
});

// --- birthsPerDay ---
test("1日あたり出生数 × 年間日数 ≒ 年間出生数", () => {
  const perDay = birthsPerDay(1973);
  assert.ok(Math.abs(perDay * 365 - birthsOf(1973)) < 365);
});

test("うるう年は366日で割る（2000年）", () => {
  assert.equal(birthsPerDay(2000), Math.round(birthsOf(2000) / 366));
});

// --- notableOf ---
test("1966年には丙午の注記がある", () => {
  assert.ok(notableOf(1966).label.includes("丙午"));
});

test("注記のない年は null", () => {
  assert.equal(notableOf(1975), null);
});

// --- summarize ---
test("日付を渡すと同学年と早生まれ判定まで含む", () => {
  const s = summarize("1973-06-01");
  assert.equal(s.year, 1973);
  assert.equal(s.births, 2091983);
  assert.equal(s.isEarlyBirth, false);
  assert.ok(s.schoolYear.births > 0);
  assert.equal(s.phrase.direction, "多い");
});

test("年だけ渡すと同学年は null になる", () => {
  const s = summarize(1973);
  assert.equal(s.schoolYear, null);
  assert.equal(s.isEarlyBirth, null);
  assert.equal(s.births, 2091983);
});

test("年を文字列で渡しても数値と同じ結果になる", () => {
  assert.deepEqual(summarize("1973"), summarize(1973));
});
