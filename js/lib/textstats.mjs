// 文字数カウントのロジック（ブラウザ・Node.js 共用）

import {
  assertText,
  graphemeSegments,
} from "./text-count.mjs";

/**
 * テキストの統計情報を返す。
 * - total: 画面上の1文字に近い単位（書記素クラスター）の数
 * - codePoints: コンピューター内部の文字番号（Unicodeコードポイント）の数
 * - noWhitespace: 空白・改行を除いた書記素クラスターの数
 * - lines: 行数（末尾の改行は新しい行として数えない）
 * - utf8Bytes: UTF-8形式でのデータ量
 * - manuscriptPages: 400字詰め原稿用紙の換算枚数（切り上げ）
 */
export function textStats(text) {
  assertText(text);
  const graphemes = graphemeSegments(text);
  const total = graphemes.length;
  const codePoints = [...text].length;
  const noWhitespace = graphemes.filter((segment) => !/^\s+$/u.test(segment)).length;
  const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/u).length - (/\r\n$|[\r\n]$/u.test(text) ? 1 : 0);
  const utf8Bytes = new TextEncoder().encode(text).length;
  const manuscriptPages = Math.ceil(total / 400);
  return { total, codePoints, noWhitespace, lines, utf8Bytes, manuscriptPages };
}
