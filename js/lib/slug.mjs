// ローマ字スラッグ生成のロジック(ブラウザ・Node 共用の純粋関数)
// かな(ひらがな・カタカナ)をヘボン式ローマ字に変換し、URL用スラッグに整える。
// 漢字は読みが一意に定まらないため対象外(かなに直してから入力する想定)。

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

// 拗音(2文字)を先に、その後に単音。
const ROMAJI = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo",
};

// カタカナをひらがなに寄せる(ROMAJI 表を1つで済ませるため)。
function kataToHira(text) {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x30a1 && cp <= 0x30f6) out += String.fromCodePoint(cp - 0x60);
    else out += ch;
  }
  return out;
}

/** かな(ひらがな・カタカナ)をヘボン式ローマ字に変換する。かな以外はそのまま通す。 */
export function kanaToRomaji(text) {
  assertString(text);
  const s = kataToHira(text);
  let out = "";
  let sokuon = false; // 直前が「っ」
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "ー" || ch === "ｰ") {
      i++; // 長音は省略
      continue;
    }
    if (ch === "っ") {
      sokuon = true;
      i++;
      continue;
    }
    let rom = null;
    let len = 1;
    const two = s.slice(i, i + 2);
    if (ROMAJI[two] !== undefined) {
      rom = ROMAJI[two];
      len = 2;
    } else if (ROMAJI[ch] !== undefined) {
      rom = ROMAJI[ch];
      len = 1;
    }
    if (rom === null) {
      out += ch; // かな以外はそのまま
      i++;
      sokuon = false;
      continue;
    }
    if (sokuon) {
      out += rom.startsWith("ch") ? "t" : rom[0]; // 促音は子音を重ねる(っち→tchi)
      sokuon = false;
    }
    out += rom;
    i += len;
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** かな・英数字を URL 用スラッグに変換する(小文字・記号は区切り文字に)。 */
export function slugify(text, separator = "-") {
  assertString(text);
  const e = escapeRe(separator);
  let s = kanaToRomaji(text).toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, separator);
  s = s.replace(new RegExp(e + "{2,}", "g"), separator);
  s = s.replace(new RegExp("^" + e + "+|" + e + "+$", "g"), "");
  return s;
}
