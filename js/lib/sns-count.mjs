// SNS（ソーシャル・ネットワーキング・サービス）の投稿文字数を確認する処理。
// 仕様確認日: 2026-08-19

import {
  assertText,
  graphemeLength,
  graphemeSegments,
} from "./text-count.mjs";

const X_SINGLE_WEIGHT_RANGES = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

export const SPEC_CHECKED_DATE = "2026-08-19";

const X_URL_WEIGHT = 23;
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/giu;
const TRAILING_URL_PUNCTUATION = /[.,!?;:。、！？；：）\)\]】}〉》」』]+$/u;
const EMOJI_CLUSTER = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u;

function isSingleWeight(codePoint) {
  return X_SINGLE_WEIGHT_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);
}

function xTextWeight(text) {
  let weight = 0;
  for (const segment of graphemeSegments(text)) {
    if (EMOJI_CLUSTER.test(segment)) {
      weight += 2;
      continue;
    }
    for (const character of segment) {
      weight += isSingleWeight(character.codePointAt(0)) ? 1 : 2;
    }
  }
  return weight;
}

function findHttpUrls(text) {
  const urls = [];
  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const url = raw.replace(TRAILING_URL_PUNCTUATION, "");
    if (url === "") continue;
    try {
      new URL(url);
      urls.push({ start: match.index, end: match.index + url.length });
    } catch {
      // URLとして解釈できない文字列は通常の文章として数える。
    }
  }
  return urls;
}

/** Xの一般投稿に使われる重み付き文字数。 */
function fallbackXWeightedLength(text) {
  const normalized = text.normalize("NFC");
  const urls = findHttpUrls(normalized);
  let weight = 0;
  let cursor = 0;

  for (const url of urls) {
    weight += xTextWeight(normalized.slice(cursor, url.start));
    weight += X_URL_WEIGHT;
    cursor = url.end;
  }
  weight += xTextWeight(normalized.slice(cursor));
  return weight;
}

export function hasOfficialXParser() {
  return typeof globalThis.twttr?.txt?.parseTweet === "function";
}

/** X公式文書が案内するtwitter-textを優先し、未読込時だけ簡易計算へ戻る。 */
export function xWeightedLength(text) {
  assertText(text);
  if (hasOfficialXParser()) {
    return globalThis.twttr.txt.parseTweet(text).weightedLength;
  }
  return fallbackXWeightedLength(text);
}

export const PLATFORMS = [
  {
    id: "x",
    name: "Xの一般投稿",
    limit: 280,
    count: xWeightedLength,
    note: "日本語・絵文字は原則2、httpから始まるURLは23",
    source: "https://docs.x.com/fundamentals/counting-characters",
    sourceLabel: "X開発者向け文書「文字数の数え方」",
  },
  {
    id: "threads",
    name: "Threadsの1投稿",
    limit: 500,
    count: graphemeLength,
    note: "公式上限500。Unicodeの厳密な数え方は公開資料にないため目安",
    source: "https://help.instagram.com/1217144552251333/",
    sourceLabel: "Threadsヘルプ「新しいスレッドを開始する」",
  },
  {
    id: "bluesky",
    name: "Blueskyの投稿",
    limit: 300,
    count: graphemeLength,
    note: "Unicode書記素クラスター単位で300",
    source: "https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json",
    sourceLabel: "Bluesky公式Lexicon「投稿本文」",
  },
];

export const REFERENCES = [
  ...PLATFORMS.map(({ source, sourceLabel }) => ({ url: source, label: sourceLabel })),
  {
    url: "https://github.com/twitter/twitter-text",
    label: "X公式文書が案内するtwitter-text",
  },
];

export function analyze(text) {
  assertText(text);
  return PLATFORMS.map(({ count, ...platform }) => {
    const used = count(text);
    return {
      ...platform,
      used,
      remaining: platform.limit - used,
      over: used > platform.limit,
      ratio: platform.limit === 0 ? 0 : used / platform.limit,
      approximate: platform.id === "x" && !hasOfficialXParser(),
    };
  });
}
