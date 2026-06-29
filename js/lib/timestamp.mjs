// Unixタイムスタンプ変換 — 純ロジック

const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

// 秒(10桁)かミリ秒(13桁)を自動判別して ms に正規化
function normalizeToMs(value) {
  if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError("value は数値を指定してください");
  if (!Number.isFinite(value)) throw new RangeError("有限の数値を指定してください");
  // 13桁以上ならミリ秒とみなす（2001年以降は秒で10桁以下）
  return Math.abs(value) >= 1e12 ? value : value * 1000;
}

function zeroPad(n, digits = 2) {
  return String(n).padStart(digits, "0");
}

function msToJstParts(ms) {
  // JST = UTC + 9h をローカル環境非依存で計算
  const d = new Date(ms + JST_OFFSET_MS);
  return {
    year:  d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day:   d.getUTCDate(),
    hour:  d.getUTCHours(),
    min:   d.getUTCMinutes(),
    sec:   d.getUTCSeconds(),
  };
}

export function unixToJst(seconds) {
  const ms = normalizeToMs(seconds);
  const p = msToJstParts(ms);
  const date = `${p.year}-${zeroPad(p.month)}-${zeroPad(p.day)}`;
  const time = `${zeroPad(p.hour)}:${zeroPad(p.min)}:${zeroPad(p.sec)}`;
  const iso  = `${date}T${time}+09:00`;
  return { date, time, iso, readable: `${date} ${time} JST`, unix: Math.trunc(ms / 1000), ms };
}

export function jstToUnix(dateStr) {
  // "YYYY-MM-DD HH:mm:ss" または "YYYY-MM-DDTHH:mm:ss" を JST として解釈
  if (typeof dateStr !== "string" || dateStr.trim() === "") throw new TypeError("日付文字列を指定してください");
  const normalized = dateStr.trim().replace("T", " ");
  const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) throw new TypeError("形式は YYYY-MM-DD HH:mm:ss で指定してください");
  const [, Y, M, D, h, min, s] = m.map(Number);
  const utcMs = Date.UTC(Y, M - 1, D, h - 9, min, s);
  if (Number.isNaN(utcMs)) throw new RangeError("不正な日付値です");
  return { unix: Math.trunc(utcMs / 1000), ms: utcMs };
}

export function nowUnix() {
  const ms = Date.now();
  return { unix: Math.trunc(ms / 1000), ms };
}
