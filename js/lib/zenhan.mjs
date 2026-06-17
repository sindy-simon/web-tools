// 全角⇔半角変換のロジック(ブラウザ・Node 共用の純粋関数)
// 対応: 英数字・記号・スペース、およびカタカナ(半角カナ⇔全角カナ、濁点・半濁点の結合)。
// ひらがな・漢字など対象外の文字はそのまま通す。

// 半角カナ(単体) → 全角カナ
const HALF_TO_FULL = {
  "｡": "。", "｢": "「", "｣": "」", "､": "、", "･": "・", "ｰ": "ー",
  "ｦ": "ヲ", "ｧ": "ァ", "ｨ": "ィ", "ｩ": "ゥ", "ｪ": "ェ", "ｫ": "ォ",
  "ｬ": "ャ", "ｭ": "ュ", "ｮ": "ョ", "ｯ": "ッ",
  "ｱ": "ア", "ｲ": "イ", "ｳ": "ウ", "ｴ": "エ", "ｵ": "オ",
  "ｶ": "カ", "ｷ": "キ", "ｸ": "ク", "ｹ": "ケ", "ｺ": "コ",
  "ｻ": "サ", "ｼ": "シ", "ｽ": "ス", "ｾ": "セ", "ｿ": "ソ",
  "ﾀ": "タ", "ﾁ": "チ", "ﾂ": "ツ", "ﾃ": "テ", "ﾄ": "ト",
  "ﾅ": "ナ", "ﾆ": "ニ", "ﾇ": "ヌ", "ﾈ": "ネ", "ﾉ": "ノ",
  "ﾊ": "ハ", "ﾋ": "ヒ", "ﾌ": "フ", "ﾍ": "ヘ", "ﾎ": "ホ",
  "ﾏ": "マ", "ﾐ": "ミ", "ﾑ": "ム", "ﾒ": "メ", "ﾓ": "モ",
  "ﾔ": "ヤ", "ﾕ": "ユ", "ﾖ": "ヨ",
  "ﾗ": "ラ", "ﾘ": "リ", "ﾙ": "ル", "ﾚ": "レ", "ﾛ": "ロ",
  "ﾜ": "ワ", "ﾝ": "ン",
  "ﾞ": "゛", "ﾟ": "゜",
};

// 半角カナ(基底) + ﾞ → 濁点付き全角カナ
const HALF_DAKUTEN = {
  "ｶ": "ガ", "ｷ": "ギ", "ｸ": "グ", "ｹ": "ゲ", "ｺ": "ゴ",
  "ｻ": "ザ", "ｼ": "ジ", "ｽ": "ズ", "ｾ": "ゼ", "ｿ": "ゾ",
  "ﾀ": "ダ", "ﾁ": "ヂ", "ﾂ": "ヅ", "ﾃ": "デ", "ﾄ": "ド",
  "ﾊ": "バ", "ﾋ": "ビ", "ﾌ": "ブ", "ﾍ": "ベ", "ﾎ": "ボ",
  "ｳ": "ヴ",
};

// 半角カナ(基底) + ﾟ → 半濁点付き全角カナ
const HALF_HANDAKUTEN = {
  "ﾊ": "パ", "ﾋ": "ピ", "ﾌ": "プ", "ﾍ": "ペ", "ﾎ": "ポ",
};

// 逆引き(全角 → 半角)。濁点・半濁点は半角2文字になる(ガ → ｶﾞ)。
const FULL_TO_HALF = {};
for (const [h, f] of Object.entries(HALF_TO_FULL)) FULL_TO_HALF[f] = h;
for (const [h, f] of Object.entries(HALF_DAKUTEN)) FULL_TO_HALF[f] = h + "ﾞ";
for (const [h, f] of Object.entries(HALF_HANDAKUTEN)) FULL_TO_HALF[f] = h + "ﾟ";

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

/** 半角に変換する(全角英数字・記号・スペース・カタカナ → 半角)。 */
export function toHalfWidth(text) {
  assertString(text);
  let out = "";
  for (const ch of text) {
    if (FULL_TO_HALF[ch] !== undefined) {
      out += FULL_TO_HALF[ch];
      continue;
    }
    const c = ch.charCodeAt(0);
    if (c >= 0xff01 && c <= 0xff5e) {
      out += String.fromCharCode(c - 0xfee0); // 全角ASCII → 半角
    } else if (c === 0x3000) {
      out += " "; // 全角スペース → 半角スペース
    } else {
      out += ch;
    }
  }
  return out;
}

/** 全角に変換する(半角英数字・記号・スペース・カタカナ → 全角)。 */
export function toFullWidth(text) {
  assertString(text);
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (next === "ﾞ" && HALF_DAKUTEN[ch]) {
      out += HALF_DAKUTEN[ch];
      i++;
      continue;
    }
    if (next === "ﾟ" && HALF_HANDAKUTEN[ch]) {
      out += HALF_HANDAKUTEN[ch];
      i++;
      continue;
    }
    if (HALF_TO_FULL[ch] !== undefined) {
      out += HALF_TO_FULL[ch];
      continue;
    }
    const c = ch.charCodeAt(0);
    if (c >= 0x21 && c <= 0x7e) {
      out += String.fromCharCode(c + 0xfee0); // 半角ASCII → 全角
    } else if (c === 0x20) {
      out += "　"; // 半角スペース → 全角スペース
    } else {
      out += ch;
    }
  }
  return out;
}
