import { test } from "node:test";
import assert from "node:assert/strict";
import {
  barSeries,
  formatCount,
  rankSentence,
  ratioPhrase,
  resultRows,
  shareText,
  tableRows,
  toManPhrase,
  LATEST_YEAR,
  YEAR_MAX,
  YEAR_MIN,
} from "../js/lib/birth-rank-view.mjs";

// --- formatCount ---
test("3桁区切りにする", () => {
  assert.equal(formatCount(2091983), "2,091,983");
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(0), "0");
});

test("小数は四捨五入して整数で出す", () => {
  assert.equal(formatCount(1234.6), "1,235");
});

test("数値でなければ TypeError", () => {
  assert.throws(() => formatCount("2091983"), TypeError);
  assert.throws(() => formatCount(NaN), TypeError);
});

// --- toManPhrase ---
test("万単位はすべて概算表記にする", () => {
  assert.equal(toManPhrase(2091983), "約209万人");
  assert.equal(toManPhrase(727277), "約73万人"); // 72.7 → 73 に丸まる
});

// --- ratioPhrase ---
test("倍率は小数第1位まで", () => {
  assert.equal(ratioPhrase(2.88), "2.9倍");
  assert.equal(ratioPhrase(1), "1.0倍");
  assert.equal(ratioPhrase(0.74), "0.7倍");
});

test("0 以下の倍率は TypeError", () => {
  assert.throws(() => ratioPhrase(0), TypeError);
  assert.throws(() => ratioPhrase(-1), TypeError);
});

// --- barSeries ---
test("既定では対象年の前後7年 = 15年ぶんを返す", () => {
  const s = barSeries(1973);
  assert.equal(s.length, 15);
  assert.equal(s[0].year, 1966);
  assert.equal(s[14].year, 1980);
});

test("対象年だけに current が立つ", () => {
  const s = barSeries(1973);
  assert.deepEqual(
    s.filter((b) => b.current).map((b) => b.year),
    [1973]
  );
});

test("高さは窓内の最大値を100とした相対値", () => {
  const s = barSeries(1973);
  assert.equal(Math.max(...s.map((b) => b.height)), 100);
  assert.ok(s.every((b) => b.height > 0 && b.height <= 100));
  // 窓内で最も多い年（1973）が 100 になる
  assert.equal(s.find((b) => b.year === 1973).height, 100);
});

test("下端の年でも窓の幅を保ってずらす（グラフが痩せない）", () => {
  const s = barSeries(YEAR_MIN);
  assert.equal(s.length, 15);
  assert.equal(s[0].year, YEAR_MIN);
  assert.equal(s[14].year, YEAR_MIN + 14);
  assert.equal(s.find((b) => b.current).year, YEAR_MIN);
});

test("上端の年でも窓の幅を保ってずらす", () => {
  const s = barSeries(YEAR_MAX);
  assert.equal(s.length, 15);
  assert.equal(s[14].year, YEAR_MAX);
  assert.equal(s[0].year, YEAR_MAX - 14);
});

test("span を変えられる", () => {
  assert.equal(barSeries(1973, 3).length, 7);
  assert.throws(() => barSeries(1973, 0), TypeError);
  assert.throws(() => barSeries(1973, 1.5), TypeError);
});

test("範囲外の年は RangeError", () => {
  assert.throws(() => barSeries(1949), RangeError);
  assert.throws(() => barSeries(2025), RangeError);
});

// --- rankSentence ---
test("順位は短い方の言い回しを選ぶ", () => {
  assert.equal(rankSentence(1973), "戦後75年で、多い方から3番目");
  // 直近の年は「少ない方から」の方が短く言える
  assert.match(rankSentence(2024), /少ない方から/);
});

// --- resultRows ---
test("日付を渡すと同学年の行が入る", () => {
  const rows = resultRows("1973-06-01");
  const labels = rows.map((r) => r[0]);
  assert.deepEqual(labels, ["出生数", "1日あたり", "順位", "同学年", `${LATEST_YEAR}年比`]);
  assert.equal(rows[0][1], "2,091,983人");
});

test("年だけなら同学年は出さない（学年は日付がないと決まらない）", () => {
  const labels = resultRows(1973).map((r) => r[0]);
  assert.ok(!labels.includes("同学年"));
});

test("最後の行は今との比較（Peak-End）", () => {
  const rows = resultRows("1973-06-01");
  const last = rows[rows.length - 1];
  assert.equal(last[0], `${LATEST_YEAR}年比`);
  assert.equal(last[1], "100人に対して288人");
});

test("同学年は概算と明記する", () => {
  const row = resultRows("1973-06-01").find((r) => r[0] === "同学年");
  assert.match(row[1], /^約[\d,]+万人（概算）$/);
});

// --- shareText ---
test("共有文には年・人数・URL が入る", () => {
  const t = shareText(1973, "https://example.com/x.html");
  assert.match(t, /1973年/);
  assert.match(t, /2,091,983人/);
  assert.match(t, /https:\/\/example\.com\/x\.html$/);
});

test("共有文は URL 込みで 140 字に収まる", () => {
  for (const y of [YEAR_MIN, 1966, 1973, 2005, YEAR_MAX]) {
    assert.ok(shareText(y).length <= 140, `${y}: ${shareText(y).length}字`);
  }
});

// --- tableRows ---
test("早見表は全75年ぶんを昇順で返す", () => {
  const rows = tableRows();
  assert.equal(rows.length, YEAR_MAX - YEAR_MIN + 1);
  assert.equal(rows[0].year, YEAR_MIN);
  assert.equal(rows[rows.length - 1].year, YEAR_MAX);
});

test("早見表には順位と注記が入る", () => {
  const rows = tableRows();
  const y1966 = rows.find((r) => r.year === 1966);
  assert.equal(y1966.notable, "丙午年（ひのえうま）");
  // 戦後最多の年（1950年）が 1 位
  assert.equal(rows.find((r) => r.year === 1950).rank, 1);
  // 注記のない年は空文字（テンプレートにそのまま挿せる）
  assert.equal(rows.find((r) => r.year === 1951).notable, "");
});
