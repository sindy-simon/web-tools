// 年齢・日数計算。日付差はタイムゾーンの影響を避けるため UTC の暦日で計算する。

import { dateStringToWareki, warekiToSeireki } from "./wareki.mjs";

const DAY_MS = 86_400_000;

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parseDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) throw new TypeError("日付は YYYY-MM-DD 形式で指定してください");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new TypeError("存在する日付を指定してください");
  }
  return { year, month, day };
}

function formatDate({ year, month, day }) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function compareDate(a, b) {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

function utcTime(date) {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function anniversaryInYear(birthDate, year) {
  // 2月29日生まれは、うるう年でない年には2月28日を節目として表示する。
  const day = birthDate.month === 2 && birthDate.day === 29 && !isLeapYear(year)
    ? 28
    : birthDate.day;
  return { year, month: birthDate.month, day };
}

// 西暦 YYYY-MM-DD → 和暦オブジェクト
export function toWareki(dateString) {
  return dateStringToWareki(dateString);
}

// 元号名 + 和暦年 → 西暦年
export function warekiYearToSeireki(eraName, warekiYear) {
  return warekiToSeireki(eraName, warekiYear);
}

// 満年齢計算。asOfString 省略時は利用端末の今日の日付を使う。
export function calcAge(birthdayString, asOfString = null) {
  const birthDate = parseDate(birthdayString);
  const now = new Date();
  const referenceDate = asOfString
    ? parseDate(asOfString)
    : { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

  if (compareDate(birthDate, referenceDate) > 0) {
    throw new RangeError("生年月日が基準日より後になっています");
  }

  const anniversaryThisYear = anniversaryInYear(birthDate, referenceDate.year);
  const hasReachedAnniversary = compareDate(referenceDate, anniversaryThisYear) >= 0;
  const age = referenceDate.year - birthDate.year - (hasReachedAnniversary ? 0 : 1);

  let nextBirthday = anniversaryThisYear;
  if (compareDate(referenceDate, nextBirthday) >= 0) {
    nextBirthday = anniversaryInYear(birthDate, referenceDate.year + 1);
  }

  return {
    age,
    nextBirthday: formatDate(nextBirthday),
    daysToNext: Math.round((utcTime(nextBirthday) - utcTime(referenceDate)) / DAY_MS),
    wareki: toWareki(birthdayString),
  };
}

// 2日付間の日数計算。開始日と終了日が同じなら0日。
export function calcDaysBetween(fromString, toString) {
  const from = parseDate(fromString);
  const to = parseDate(toString);
  const days = Math.round((utcTime(to) - utcTime(from)) / DAY_MS);
  const absoluteDays = Math.abs(days);
  return {
    days,
    weeks: Math.floor(absoluteDays / 7),
    remainingDays: absoluteDays % 7,
    reversed: days < 0,
  };
}
