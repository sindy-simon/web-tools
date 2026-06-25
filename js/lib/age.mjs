// 年齢・日数計算 — 純ロジック（和暦対応）

export const ERAS = [
  { name: '令和', start: [2019, 5,  1], baseYear: 2018 },
  { name: '平成', start: [1989, 1,  8], baseYear: 1988 },
  { name: '昭和', start: [1926, 12, 25], baseYear: 1925 },
  { name: '大正', start: [1912, 7,  30], baseYear: 1911 },
  { name: '明治', start: [1868, 1,  25], baseYear: 1867 },
];

function parseDate(str) {
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new TypeError('日付は YYYY-MM-DD 形式で指定してください');
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (isNaN(d.getTime()) || d.getMonth() !== +m[2] - 1) throw new TypeError('無効な日付です');
  return d;
}

function fmtDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 西暦 YYYY-MM-DD → 和暦オブジェクト
export function toWareki(dateStr) {
  const d = parseDate(dateStr);
  const [y, mo, day] = [d.getFullYear(), d.getMonth() + 1, d.getDate()];
  for (const era of ERAS) {
    const [ey, em, ed] = era.start;
    if (y > ey || (y === ey && mo > em) || (y === ey && mo === em && day >= ed)) {
      const wYear = y - era.baseYear;
      return {
        era: era.name,
        year: wYear,
        month: mo,
        day,
        label: `${era.name}${wYear}年${mo}月${day}日`,
      };
    }
  }
  throw new RangeError('対応範囲外の日付です（明治以前）');
}

// 元号名 + 和暦年 → 西暦年
export function warekiYearToSeireki(eraName, warekiYear) {
  const era = ERAS.find((e) => e.name === eraName);
  if (!era) throw new RangeError(`不明な元号: ${eraName}`);
  if (!Number.isInteger(warekiYear) || warekiYear < 1) throw new RangeError('和暦年は1以上の整数で指定してください');
  return era.baseYear + warekiYear;
}

// 満年齢計算。asOfStr 省略時は今日
export function calcAge(birthdayStr, asOfStr = null) {
  const bday = parseDate(birthdayStr);
  const ref = asOfStr ? parseDate(asOfStr) : new Date();
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const birth = new Date(bday.getFullYear(), bday.getMonth(), bday.getDate());

  if (birth > today) throw new RangeError('生年月日が未来の日付です');

  let age = today.getFullYear() - birth.getFullYear();
  const bdayThisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (today < bdayThisYear) age--;

  let nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday <= today) nextBday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  const daysToNext = Math.round((nextBday - today) / 86400000);

  return {
    age,
    nextBirthday: fmtDate(nextBday),
    daysToNext,
    wareki: toWareki(birthdayStr),
  };
}

// 2日付間の日数計算
export function calcDaysBetween(fromStr, toStr) {
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  const ms = to - from;
  const days = Math.round(ms / 86400000);
  const absDays = Math.abs(days);
  return {
    days,
    weeks: Math.floor(absDays / 7),
    remainingDays: absDays % 7,
    reversed: days < 0,
  };
}
