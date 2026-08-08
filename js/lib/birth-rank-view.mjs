// 出生数ランキング — 表示のためのロジック（純粋関数）
//
// birth-rank.mjs が「数字を出す」層、こちらが「その数字を人に読ませる形にする」層。
// DOM には一切触らない = 単体テストできる。画面側は戻り値を挿すだけにする。
//
// 方針（仕様書 docs/specs/birth-rank.md より）:
//  - 比較は % ではなく自然頻度で出す（「28.8%」より「100人に対して29人」の方が伝わる）。
//  - 概算の項目には必ず「約」を付ける。断定してよいのは実測値だけ。

import {
  summarize,
  availableYears,
  birthsOf,
  birthsPerDay,
  rankOf,
  notableOf,
  YEAR_MIN,
  YEAR_MAX,
  LATEST_YEAR,
} from "./birth-rank.mjs";

export { YEAR_MIN, YEAR_MAX, LATEST_YEAR };

/** 3桁区切り。2091983 → "2,091,983" */
export function formatCount(n) {
  if (!Number.isFinite(n)) throw new TypeError("数値を指定してください");
  return Math.round(n).toLocaleString("en-US");
}

/** ざっくり掴ませるための万単位。2091983 → "約209万人" */
export function toManPhrase(n) {
  if (!Number.isFinite(n)) throw new TypeError("数値を指定してください");
  return `約${formatCount(Math.round(n / 10000))}万人`;
}

/** 今の何倍か。小数第1位まで（2.88 → "2.9倍"）。 */
export function ratioPhrase(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) throw new TypeError("正の数を指定してください");
  return `${(Math.round(ratio * 10) / 10).toFixed(1)}倍`;
}

/**
 * 棒グラフ用の系列。対象年を中心に前後 span 年ぶんを返す。
 *
 * 端（1950・2024付近）でグラフが半分になると比較にならないので、
 * **窓の幅は保ったまま範囲内へずらす**（対象年が中心から外れることは許容する）。
 * height は窓内の最大値を 100 とした相対値 = 高さの比較が窓の中で完結する。
 */
export function barSeries(year, span = 7) {
  if (!Number.isInteger(span) || span < 1) throw new TypeError("span は 1 以上の整数です");
  const width = span * 2 + 1;
  const all = availableYears();
  if (!all.includes(year)) throw new RangeError(`対応しているのは ${YEAR_MIN}〜${YEAR_MAX} 年です`);

  let from = year - span;
  let to = year + span;
  if (from < YEAR_MIN) {
    from = YEAR_MIN;
    to = Math.min(YEAR_MAX, from + width - 1);
  }
  if (to > YEAR_MAX) {
    to = YEAR_MAX;
    from = Math.max(YEAR_MIN, to - width + 1);
  }

  const years = all.filter((y) => y >= from && y <= to);
  const max = Math.max(...years.map(birthsOf));
  return years.map((y) => ({
    year: y,
    births: birthsOf(y),
    height: Math.round((birthsOf(y) / max) * 100),
    current: y === year,
  }));
}

/** 順位の一文。「戦後75年で 多い方から 3番目」 */
export function rankSentence(year) {
  const { direction, position, total } = summarize(year).phrase;
  return `戦後${total}年で、${direction}方から${position}番目`;
}

/**
 * 結果のコピー用の行（copy-ui.mjs の copyRows にそのまま渡せる形）。
 * 最後に一番強い数字（今との比較）を置く = Peak-End。
 */
export function resultRows(dateStrOrYear) {
  const s = summarize(dateStrOrYear);
  const rows = [
    ["出生数", `${formatCount(s.births)}人`],
    ["1日あたり", `${formatCount(s.perDay)}人`],
    ["順位", `${s.phrase.direction}方から${s.phrase.position}番目 / ${s.phrase.total}年`],
  ];
  if (s.schoolYear) {
    rows.push(["同学年", `${toManPhrase(s.schoolYear.births)}（概算）`]);
  }
  rows.push([`${s.latest.latestYear}年比`, `100人に対して${s.latest.per100}人`]);
  return rows;
}

/** X 共有用の本文。URL 込みで 140 字に収める。 */
export function shareText(dateStrOrYear, url = "https://mini-tools.net/birth-rank.html") {
  const s = summarize(dateStrOrYear);
  const body =
    `${s.year}年に日本で生まれた赤ちゃんは${formatCount(s.births)}人。` +
    `${rankSentence(s.year)}。` +
    `${s.latest.latestYear}年の100人に対して${s.latest.per100}人でした。`;
  return `${body}\n${url}`;
}

/**
 * 早見表（1950〜2024の全年）の行。
 * 静的HTMLとして書き出すために使う = クローラにも中身が見える（birth-year の教訓）。
 */
export function tableRows() {
  return availableYears().map((y) => {
    const notable = notableOf(y);
    return {
      year: y,
      births: birthsOf(y),
      perDay: birthsPerDay(y),
      rank: rankOf(y).rank,
      notable: notable ? notable.label : "",
    };
  });
}
