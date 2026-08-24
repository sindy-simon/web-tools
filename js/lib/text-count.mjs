// 画面上の1文字に近い単位（Unicode書記素クラスター）を数える共通処理。

export function assertText(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

export function graphemeSegments(text) {
  assertText(text);
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
    return [...segmenter.segment(text)].map(({ segment }) => segment);
  }
  // Intl.Segmenter 非対応環境では、Unicodeコードポイント単位へフォールバックする。
  return [...text];
}

export function graphemeLength(text) {
  return graphemeSegments(text).length;
}

