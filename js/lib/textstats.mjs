// 文字数カウントのロジック(ブラウザ・Node 共用の純粋関数)

/**
 * テキストの統計情報を返す。
 * - total: 文字数(Unicode コードポイント単位。絵文字も 1 文字扱い)
 * - noWhitespace: 空白・改行を除いた文字数
 * - lines: 行数(末尾の改行は行数に含めない。"a\n" は 1 行。空文字列は 0 行)
 * - utf8Bytes: UTF-8 でのバイト数
 * - manuscriptPages: 400 字詰め原稿用紙の換算枚数(切り上げ)
 */
export function textStats(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
  const chars = [...text];
  const total = chars.length;
  const noWhitespace = chars.filter((c) => !/\s/u.test(c)).length;
  // 末尾の改行は新しい行を作らない(エディタの行数表示に合わせる)。
  const lines = text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
  const utf8Bytes = new TextEncoder().encode(text).length;
  const manuscriptPages = Math.ceil(total / 400);
  return { total, noWhitespace, lines, utf8Bytes, manuscriptPages };
}
