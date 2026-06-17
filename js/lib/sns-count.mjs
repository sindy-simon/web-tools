// SNS 文字数チェックのロジック(ブラウザ・Node 共用の純粋関数)
// 肝は「日本語特化のカウント」: X(旧Twitter)は全角=2・半角=1・URL=23 の重み付け。
// 他SNSはコードポイント数で数える。上限値は変わりやすいので PLATFORMS のデータ表を更新する。
// （上限は 2026-06 時点の一般的な公開値。最新は各SNSの仕様を要確認）

// X の重み 2(全角扱い)になるコードポイント範囲。半角カナ(U+FF61〜)は範囲外＝重み1。
const WIDE_RANGES = [
  [0x1100, 0x115f], // Hangul Jamo
  [0x2e80, 0xa4cf], // CJK 各種(漢字・かな・記号など)
  [0xac00, 0xd7a3], // Hangul 音節
  [0xf900, 0xfaff], // CJK 互換漢字
  [0xfe30, 0xfe4f], // CJK 互換形
  [0xff00, 0xff60], // 全角 ASCII・記号
  [0xffe0, 0xffe6], // 全角通貨記号など
  [0x2600, 0x27bf], // 記号・絵文字(一部)
  [0x2b00, 0x2bff], // 各種記号
  [0x1f000, 0x1ffff], // 絵文字
];

const URL_RE = /https?:\/\/[^\s]+/g;
const X_URL_WEIGHT = 23; // X は URL を一律 23 文字で計算(t.co 短縮)

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

function isWide(cp) {
  return WIDE_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
}

/** コードポイント数で数える(全角・半角を区別しない一般的な文字数)。 */
export function charLength(text) {
  assertString(text);
  return [...text].length;
}

/** X(旧Twitter)方式の重み付き文字数。全角=2・半角=1・URL=23。 */
export function xWeightedLength(text) {
  assertString(text);
  const urls = text.match(URL_RE) || [];
  const rest = text.replace(URL_RE, "");
  let weight = urls.length * X_URL_WEIGHT;
  for (const ch of rest) {
    weight += isWide(ch.codePointAt(0)) ? 2 : 1;
  }
  return weight;
}

// 上限データ表(type: "x"=重み付き / "char"=コードポイント数)
export const PLATFORMS = [
  { id: "x", name: "X(旧Twitter)", limit: 280, type: "x", note: "全角2・半角1・URL23" },
  { id: "threads", name: "Threads", limit: 500, type: "char" },
  { id: "bluesky", name: "Bluesky", limit: 300, type: "char" },
  { id: "instagram", name: "Instagram(キャプション)", limit: 2200, type: "char" },
  { id: "instagram_bio", name: "Instagram(プロフィール)", limit: 150, type: "char" },
  { id: "tiktok", name: "TikTok(キャプション)", limit: 2200, type: "char" },
  { id: "linkedin", name: "LinkedIn(投稿)", limit: 3000, type: "char" },
  { id: "facebook", name: "Facebook(投稿)", limit: 63206, type: "char" },
  { id: "youtube_title", name: "YouTube(タイトル)", limit: 100, type: "char" },
  { id: "youtube_desc", name: "YouTube(説明)", limit: 5000, type: "char" },
];

/** 全プラットフォームについて 使用数・残り・超過 を計算して返す。 */
export function analyze(text) {
  assertString(text);
  return PLATFORMS.map((p) => {
    const used = p.type === "x" ? xWeightedLength(text) : charLength(text);
    return { ...p, used, remaining: p.limit - used, over: used > p.limit };
  });
}
