// 時差計算・海外時刻→JST変換 — 純ロジック

export const CITIES = [
  { label: "東京・大阪（JST）",       tz: "Asia/Tokyo" },
  { label: "ソウル（KST）",           tz: "Asia/Seoul" },
  { label: "上海・北京（CST）",       tz: "Asia/Shanghai" },
  { label: "シンガポール（SGT）",     tz: "Asia/Singapore" },
  { label: "バンコク（ICT）",         tz: "Asia/Bangkok" },
  { label: "ドバイ（GST）",           tz: "Asia/Dubai" },
  { label: "モスクワ（MSK）",         tz: "Europe/Moscow" },
  { label: "ロンドン（GMT/BST）",     tz: "Europe/London" },
  { label: "パリ・ベルリン（CET）",   tz: "Europe/Paris" },
  { label: "ニューヨーク（ET）",      tz: "America/New_York" },
  { label: "シカゴ（CT）",            tz: "America/Chicago" },
  { label: "ロサンゼルス（PT）",      tz: "America/Los_Angeles" },
  { label: "ホノルル（HST）",         tz: "Pacific/Honolulu" },
  { label: "シドニー（AEST/AEDT）",   tz: "Australia/Sydney" },
];

const JST_TZ = "Asia/Tokyo";

function formatInTz(date, tz) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  // hour12:false may return "24" for midnight in some engines → normalize
  const hour = p.hour === "24" ? "00" : p.hour;
  return `${p.year}-${p.month}-${p.day} ${hour}:${p.minute}:${p.second}`;
}

// "YYYY-MM-DD HH:mm" or "YYYY-MM-DD HH:mm:ss" を指定 tz の現地時刻として UTC に変換。
// 2反復の Newton 法: 収束式 utcMs = L_ms + (utcMs - dMs) で DST 境界も正確に扱う。
function parseLocalToUtc(dateStr, tz) {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new TypeError("形式は YYYY-MM-DD HH:mm で指定してください");
  const [, Y, M, D, h, min, s = "00"] = m;
  const L_ms = Date.UTC(+Y, +M - 1, +D, +h, +min, +s);
  let utcMs = L_ms;
  for (let i = 0; i < 2; i++) {
    const displayed = formatInTz(new Date(utcMs), tz);
    const dMs = Date.UTC(
      +displayed.slice(0, 4), +displayed.slice(5, 7) - 1, +displayed.slice(8, 10),
      +displayed.slice(11, 13), +displayed.slice(14, 16), +displayed.slice(17, 19)
    );
    utcMs = L_ms + (utcMs - dMs);
  }
  return new Date(utcMs);
}

export function toJst(dateStr, fromTz) {
  if (!CITIES.some((c) => c.tz === fromTz)) throw new RangeError(`不明なタイムゾーン: ${fromTz}`);
  const date = parseLocalToUtc(dateStr, fromTz);
  return {
    jst:   formatInTz(date, JST_TZ),
    local: formatInTz(date, fromTz),
  };
}

export function fromJst(dateStr, toTz) {
  if (!CITIES.some((c) => c.tz === toTz)) throw new RangeError(`不明なタイムゾーン: ${toTz}`);
  const date = parseLocalToUtc(dateStr, JST_TZ);
  return {
    jst:    formatInTz(date, JST_TZ),
    target: formatInTz(date, toTz),
  };
}
