// テキスト整形 — 純ロジック

// 改行コードを正規化（まず LF に統一してから変換）
function unifyNewlines(str) {
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function convertNewlines(str, to) {
  if (to !== 'lf' && to !== 'crlf') throw new TypeError('to は "lf" または "crlf" を指定してください');
  const lf = unifyNewlines(str);
  return to === 'crlf' ? lf.replace(/\n/g, '\r\n') : lf;
}

// 空白正規化（全角スペース→半角・連続スペース→1つ・行頭行末トリム）
export function normalizeSpaces(str) {
  return unifyNewlines(str)
    .replace(/　/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/^[ \t]+|[ \t]+$/gm, '');
}

// 連続空行を最大 maxBlank 行に圧縮（0 なら全除去）
export function compressBlankLines(str, maxBlank = 1) {
  const lf = unifyNewlines(str);
  const pattern = new RegExp(`\\n{${maxBlank + 2},}`, 'g');
  return lf.replace(pattern, '\n'.repeat(maxBlank + 1));
}

// 全処理をまとめて適用
export function formatAll(str, options = {}) {
  const {
    newlines = 'lf',
    spaces = true,
    maxBlank = 1,
    trim = true,
  } = options;

  let s = str;
  s = convertNewlines(s, newlines);
  if (spaces) s = normalizeSpaces(s);
  s = compressBlankLines(s, maxBlank);
  if (trim) s = s.trim();
  return s;
}

// 改行コード情報
export function detectNewlines(str) {
  const crlf = (str.match(/\r\n/g) || []).length;
  const cr   = (str.replace(/\r\n/g, '').match(/\r/g) || []).length;
  const lf   = (str.replace(/\r\n/g, '').match(/\n/g) || []).length;
  const dominant = crlf >= lf && crlf >= cr ? 'CRLF' : lf >= cr ? 'LF' : 'CR';
  return { crlf, lf, cr, dominant };
}
