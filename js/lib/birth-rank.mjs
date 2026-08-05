// 出生数ランキング — 純ロジック
//
// 「あなたが生まれた年、日本では何人の赤ちゃんが生まれたか」と
// 「それは戦後で何番目に多い年か」を出す。
//
// データは birth-year-data.mjs の実測値（総務省推計人口 / 厚労省人口動態統計）を再利用する。
// 新しいデータは持ち込まない = 出典と精度の担保が既存ページと同じになる。
//
// ⚠️ このモジュールが「やらない」こと:
//    「あなたより年上は何人」のような **現在生きている人の年齢別人口**は出せない。
//    出生数を足し上げても現在人口にはならない（その後の死亡・国際移動が反映されない）ため。
//    それをやるには年齢各歳別人口という別の統計が要る。

import { DATA, NOTABLE, YEAR_MIN, YEAR_MAX, LATEST_YEAR } from "./birth-year-data.mjs";

export { YEAR_MIN, YEAR_MAX, LATEST_YEAR };

/** 対象年（出生数を持つ年）を昇順で返す。 */
export function availableYears() {
  return Object.keys(DATA)
    .map(Number)
    .filter((y) => Number.isFinite(DATA[y]?.births))
    .sort((a, b) => a - b);
}

function assertYear(year) {
  if (!Number.isInteger(year)) throw new TypeError("年は整数で指定してください");
  if (year < YEAR_MIN || year > YEAR_MAX) {
    throw new RangeError(`対応しているのは ${YEAR_MIN}〜${YEAR_MAX} 年です`);
  }
}

function parseDate(str) {
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new TypeError("日付は YYYY-MM-DD 形式で指定してください");
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const dt = new Date(y, mo - 1, d);
  if (isNaN(dt.getTime()) || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    throw new TypeError("無効な日付です");
  }
  return { y, mo, d };
}

/** その年の出生数（人）。 */
export function birthsOf(year) {
  assertYear(year);
  return DATA[year].births;
}

/**
 * 出生数の多い順の順位。
 * 同数の年があれば同順位（競技順位: 1,2,2,4…）にする。
 */
export function rankOf(year) {
  assertYear(year);
  const years = availableYears();
  const births = DATA[year].births;
  const more = years.filter((y) => DATA[y].births > births).length;
  const fewer = years.filter((y) => DATA[y].births < births).length;
  return {
    rank: more + 1,          // 多い方から数えて何番目か
    fromBottom: fewer + 1,   // 少ない方から数えて何番目か
    total: years.length,
  };
}

/** うるう年を考慮した年間日数。 */
function daysInYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
}

/** その年の 1/1 から (mo/d) までの経過日数（1/1 を 1 日目とする）。 */
function dayOfYear(y, mo, d) {
  const start = Date.UTC(y, 0, 1);
  return Math.round((Date.UTC(y, mo - 1, d) - start) / 86400000) + 1;
}

/**
 * 日本の学年（4/2 〜 翌年 4/1 生まれ）の開始年を返す。
 * 例: 2000-04-01 生まれ → 1999年度（1999-04-02 〜 2000-04-01）
 */
export function schoolYearStart(dateStr) {
  const { y, mo, d } = parseDate(dateStr);
  const beforeApr2 = mo < 4 || (mo === 4 && d <= 1);
  return beforeApr2 ? y - 1 : y;
}

/** 4/1以前生まれ（いわゆる早生まれ）か。 */
export function isEarlyBirth(dateStr) {
  const { mo, d } = parseDate(dateStr);
  return mo < 4 || (mo === 4 && d <= 1);
}

/**
 * 同学年の人数の**概算**。
 *
 * 学年は暦年をまたぐ（4/2〜翌年4/1）ので、2年分の出生数を日数で按分して足す。
 * ⚠️ 出生数が1年を通して一様である、という近似を置いている（実際には季節変動がある）。
 *    だから戻り値に approximate: true を付けている。表示側で「概算」と明記すること。
 */
export function estimateSchoolYearBirths(dateStr) {
  const startYear = schoolYearStart(dateStr);
  const endYear = startYear + 1;
  if (startYear < YEAR_MIN || endYear > YEAR_MAX) {
    throw new RangeError(
      `同学年を計算できるのは ${YEAR_MIN}年度〜${YEAR_MAX - 1}年度（生年で ${YEAR_MIN}〜${YEAR_MAX}年）です`
    );
  }
  const dA = daysInYear(startYear);
  const dB = daysInYear(endYear);
  // 前半: startYear の 4/2〜12/31 ／ 後半: endYear の 1/1〜4/1
  const headDays = dA - dayOfYear(startYear, 4, 1);
  const tailDays = dayOfYear(endYear, 4, 1);
  const births =
    DATA[startYear].births * (headDays / dA) + DATA[endYear].births * (tailDays / dB);
  return {
    startYear,
    endYear,
    births: Math.round(births),
    approximate: true,
  };
}

/** 最新年（比較基準の「今」）と比べる。 */
export function compareToLatest(year) {
  assertYear(year);
  const births = DATA[year].births;
  const latestBirths = DATA[LATEST_YEAR].births;
  return {
    latestYear: LATEST_YEAR,
    latestBirths,
    ratio: births / latestBirths,
    /** 今の100人に対して、あなたの年は何人生まれたか（自然頻度での言い換え） */
    per100: Math.round((births / latestBirths) * 100),
    diff: births - latestBirths,
  };
}

/** その年、1日あたり何人生まれたか。 */
export function birthsPerDay(year) {
  assertYear(year);
  return Math.round(DATA[year].births / daysInYear(year));
}

/** 丙午・ベビーブームなど、その年の注記（無ければ null）。 */
export function notableOf(year) {
  assertYear(year);
  return NOTABLE[year] ?? null;
}

/** 上位・下位を「戦後◯年で△番目」の形にするための短い表現を選ぶ。 */
export function rankPhrase(year) {
  const { rank, fromBottom, total } = rankOf(year);
  return rank <= fromBottom
    ? { direction: "多い", position: rank, total }
    : { direction: "少ない", position: fromBottom, total };
}

/** 画面表示用に一式まとめて返す。 */
export function summarize(dateStrOrYear) {
  const isDate = typeof dateStrOrYear === "string" && dateStrOrYear.includes("-");
  const year = isDate ? parseDate(dateStrOrYear).y : Number(dateStrOrYear);
  assertYear(year);
  return {
    year,
    births: birthsOf(year),
    perDay: birthsPerDay(year),
    rank: rankOf(year),
    phrase: rankPhrase(year),
    latest: compareToLatest(year),
    notable: notableOf(year),
    schoolYear: isDate ? estimateSchoolYearBirths(dateStrOrYear) : null,
    isEarlyBirth: isDate ? isEarlyBirth(dateStrOrYear) : null,
  };
}
