// 日本語プロンプト検証用ロジック(ブラウザ・Node 共用の純粋関数)
// 方針: 「賢い書き換え」はしない(それはLLMの仕事)。決定論的にできることだけ:
//  ・トークン数の独自概算(モデル非依存のヒューリスティック。料金・上限判定には使わない)
//  ・機械的な正規化(全角英数記号→半角・空白/改行の圧縮。コード・データ・Markdown・書式の意味や動作を変える場合がある)

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

function isKana(cp) {
  return (
    (cp >= 0x3040 && cp <= 0x30ff) || // ひらがな・カタカナ
    (cp >= 0xff66 && cp <= 0xff9d) || // 半角カナ
    cp === 0xff70 // 半角長音
  );
}

function isKanji(cp) {
  return (
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xf900 && cp <= 0xfaff)
  );
}

/**
 * トークン数の概算(目安)。
 * 英数(ASCII)は約4文字=1トークン、漢字は約1トークン、かなは約0.67トークン、その他全角は約1トークン。
 */
export function estimateTokens(text) {
  assertString(text);
  let ascii = 0;
  let kana = 0;
  let kanji = 0;
  let other = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7f) ascii++;
    else if (isKana(cp)) kana++;
    else if (isKanji(cp)) kanji++;
    else other++;
  }
  const tokens = ascii / 4 + kana * 0.67 + kanji * 1 + other * 1;
  return Math.round(tokens);
}

/** 機械的な正規化を行う。入力の意味や動作を保持する保証はない。 */
export function normalizeForPrompt(text) {
  assertString(text);
  let s = text.replace(/[！-～]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  ); // 全角ASCII → 半角
  s = s.replace(/　/g, " "); // 全角スペース → 半角
  s = s.replace(/[ \t]{2,}/g, " "); // 連続スペースを1つに
  s = s.replace(/[ \t]+(\n)/g, "$1"); // 行末スペース除去
  s = s.replace(/\n{3,}/g, "\n\n"); // 3行以上の空行を2行に
  return s.trim();
}

/**
 * 正規化前後のトークン/文字数と削減量を返す。
 * @returns {{ optimized, before:{chars,tokens}, after:{chars,tokens}, savedTokens, savedChars }}
 */
export function optimizePrompt(text) {
  assertString(text);
  const optimized = normalizeForPrompt(text);
  const before = { chars: [...text].length, tokens: estimateTokens(text) };
  const after = {
    chars: [...optimized].length,
    tokens: estimateTokens(optimized),
  };
  return {
    optimized,
    before,
    after,
    savedTokens: before.tokens - after.tokens,
    savedChars: before.chars - after.chars,
  };
}
