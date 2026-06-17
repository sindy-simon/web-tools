// 西暦⇔和暦変換のロジック(ブラウザ・Node 共用の純粋関数)
// 対応範囲: 明治(1868-10-23)以降。それ以前は null / エラーを返す。

const ERAS = [
  { name: "令和", start: [2019, 5, 1], end: null },
  { name: "平成", start: [1989, 1, 8], end: [2019, 4, 30] },
  { name: "昭和", start: [1926, 12, 25], end: [1989, 1, 7] },
  { name: "大正", start: [1912, 7, 30], end: [1926, 12, 24] },
  { name: "明治", start: [1868, 10, 23], end: [1912, 7, 29] },
];

const key = ([y, m, d]) => y * 10000 + m * 100 + d;

const INITIALS = { 明治: "M", 大正: "T", 昭和: "S", 平成: "H", 令和: "R" };

export const ERA_NAMES = ERAS.map((e) => e.name);

/**
 * 和暦の各種表記(書類記入用)を返す。
 * 例: 令和 8 → { standard: "令和8年", padded: "令和08年", initial: "R8" }
 * 1 年は standard のみ「元年」表記になる。
 */
export function warekiFormats(eraName, eraYear) {
  const initial = INITIALS[eraName];
  if (!initial) {
    throw new RangeError(`未対応の元号です: ${eraName}`);
  }
  if (!Number.isInteger(eraYear) || eraYear < 1) {
    throw new RangeError("年には 1 以上の整数を渡してください");
  }
  return {
    standard: `${eraName}${eraYear === 1 ? "元" : eraYear}年`,
    padded: `${eraName}${String(eraYear).padStart(2, "0")}年`,
    initial: `${initial}${eraYear}`,
  };
}

/**
 * 西暦の日付を和暦に変換する。
 * 月日を省略した場合は 7/1 とみなす(改元年は月日まで指定しないと確定しないため、
 * UI 側では月日入力を推奨)。明治より前は null。
 */
export function seirekiToWareki(year, month = 7, day = 1) {
  if (!Number.isInteger(year)) {
    throw new TypeError("年には整数を渡してください");
  }
  const k = key([year, month, day]);
  for (const era of ERAS) {
    if (k >= key(era.start)) {
      const n = year - era.start[0] + 1;
      return { era: era.name, year: n, label: `${era.name}${n === 1 ? "元" : n}年` };
    }
  }
  return null;
}

/**
 * 和暦(元号 + 年)を西暦年に変換する。
 * 元号の範囲外(例: 昭和65年)はエラー。
 */
export function warekiToSeireki(eraName, eraYear) {
  const era = ERAS.find((e) => e.name === eraName);
  if (!era) {
    throw new RangeError(`未対応の元号です: ${eraName}`);
  }
  if (!Number.isInteger(eraYear) || eraYear < 1) {
    throw new RangeError("年には 1 以上の整数を渡してください");
  }
  const year = era.start[0] + eraYear - 1;
  if (era.end !== null) {
    const maxYear = era.end[0] - era.start[0] + 1;
    if (eraYear > maxYear) {
      throw new RangeError(`${era.name}は${maxYear}年までです`);
    }
  }
  return year;
}
