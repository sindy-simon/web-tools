// 海外サイズ→日本サイズ変換の純ロジック(画面・テストで共有)。
// 換算テーブルはすべて「目安」値。サイズはブランド・メーカーで差があるため、
// ここでは標準的な対照関係だけを決定論的に引く(安全保証はしない=画面側で免責)。
//
// 設計:
//  - 靴: JP(足長cm) / US / UK / EU の対応表をメンズ・レディース別に持つ。
//  - 服: 国際(XS〜XXL) / JP / US / EU / UK の対応表をメンズ・レディース別に持つ。
//  - どの系統の値からでも 1 行を引けるルックアップ関数を提供する。

// ── 靴: 各行 { jp(cm), us, uk, eu } ───────────────────────────────
// メンズ(一般的な対照表・目安)
export const SHOE_TABLE_MEN = [
  { jp: 24.5, us: 6.5, uk: 6, eu: 39.5 },
  { jp: 25.0, us: 7, uk: 6.5, eu: 40 },
  { jp: 25.5, us: 7.5, uk: 7, eu: 41 },
  { jp: 26.0, us: 8, uk: 7.5, eu: 41.5 },
  { jp: 26.5, us: 8.5, uk: 8, eu: 42 },
  { jp: 27.0, us: 9, uk: 8.5, eu: 42.5 },
  { jp: 27.5, us: 9.5, uk: 9, eu: 43 },
  { jp: 28.0, us: 10, uk: 9.5, eu: 44 },
  { jp: 28.5, us: 10.5, uk: 10, eu: 44.5 },
  { jp: 29.0, us: 11, uk: 10.5, eu: 45 },
  { jp: 30.0, us: 12, uk: 11.5, eu: 46 },
];

// レディース(一般的な対照表・目安)
export const SHOE_TABLE_WOMEN = [
  { jp: 22.0, us: 5, uk: 2.5, eu: 35 },
  { jp: 22.5, us: 5.5, uk: 3, eu: 35.5 },
  { jp: 23.0, us: 6, uk: 3.5, eu: 36 },
  { jp: 23.5, us: 6.5, uk: 4, eu: 37 },
  { jp: 24.0, us: 7, uk: 4.5, eu: 37.5 },
  { jp: 24.5, us: 7.5, uk: 5, eu: 38 },
  { jp: 25.0, us: 8, uk: 5.5, eu: 38.5 },
  { jp: 25.5, us: 8.5, uk: 6, eu: 39 },
  { jp: 26.0, us: 9, uk: 6.5, eu: 40 },
];

// ── 服(トップス): 各行 { intl, jp, us, eu, uk } ──────────────────
// intl は XS〜XXL の国際表記。jp は日本での一般的な表記(号/S・M・L)。
// us/eu/uk は数値表記の目安(範囲は代表値の文字列)。
export const CLOTHING_TABLE_MEN = [
  { intl: "XS", jp: "S", us: "32-34", eu: "42-44", uk: "32-34" },
  { intl: "S", jp: "S", us: "34-36", eu: "44-46", uk: "34-36" },
  { intl: "M", jp: "M", us: "38", eu: "48", uk: "38" },
  { intl: "L", jp: "L", us: "40", eu: "50", uk: "40" },
  { intl: "XL", jp: "LL", us: "42", eu: "52", uk: "42" },
  { intl: "XXL", jp: "3L", us: "44", eu: "54", uk: "44" },
];

export const CLOTHING_TABLE_WOMEN = [
  { intl: "XS", jp: "5号", us: "0-2", eu: "32-34", uk: "4-6" },
  { intl: "S", jp: "7号", us: "4", eu: "36", uk: "8" },
  { intl: "M", jp: "9号", us: "6", eu: "38", uk: "10" },
  { intl: "L", jp: "11号", us: "8-10", eu: "40", uk: "12" },
  { intl: "XL", jp: "13号", us: "12", eu: "42", uk: "14" },
  { intl: "XXL", jp: "15号", us: "14", eu: "44", uk: "16" },
];

const SHOE_TABLES = { men: SHOE_TABLE_MEN, women: SHOE_TABLE_WOMEN };
const SHOE_SYSTEMS = ["jp", "us", "uk", "eu"];

const CLOTHING_TABLES = { men: CLOTHING_TABLE_MEN, women: CLOTHING_TABLE_WOMEN };
const CLOTHING_SYSTEMS = ["intl", "jp", "us", "eu", "uk"];

/**
 * 靴サイズを引く。指定系統の値に一致する行を返す。
 * 完全一致が無ければ最も近い行を返し exact:false を付ける。
 * @param {{category:'men'|'women', system:'jp'|'us'|'uk'|'eu', value:number}} q
 * @returns {{jp:number, us:number, uk:number, eu:number, exact:boolean}}
 */
export function lookupShoe({ category, system, value } = {}) {
  const table = SHOE_TABLES[category];
  if (!table) throw new RangeError(`未知のカテゴリ: ${category}`);
  if (!SHOE_SYSTEMS.includes(system)) throw new RangeError(`未知の系統: ${system}`);
  const v = Number(value);
  if (!Number.isFinite(v)) throw new TypeError("数値を入力してください");

  // 完全一致
  const exactRow = table.find((row) => row[system] === v);
  if (exactRow) return { ...exactRow, exact: true };

  // 範囲外(最小未満・最大超過)はエラー
  const values = table.map((row) => row[system]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (v < min || v > max) {
    throw new RangeError(`${system.toUpperCase()} ${v} は対応範囲(${min}〜${max})外です`);
  }

  // 範囲内なら最も近い行
  let nearest = table[0];
  let best = Infinity;
  for (const row of table) {
    const d = Math.abs(row[system] - v);
    if (d < best) {
      best = d;
      nearest = row;
    }
  }
  return { ...nearest, exact: false };
}

/**
 * 服(トップス)サイズを引く。指定系統の値に一致する行を返す。
 * @param {{category:'men'|'women', system:'intl'|'jp'|'us'|'eu'|'uk', value:string}} q
 * @returns {{intl:string, jp:string, us:string, eu:string, uk:string}}
 */
export function lookupClothing({ category, system, value } = {}) {
  const table = CLOTHING_TABLES[category];
  if (!table) throw new RangeError(`未知のカテゴリ: ${category}`);
  if (!CLOTHING_SYSTEMS.includes(system)) throw new RangeError(`未知の系統: ${system}`);
  const v = String(value).trim();
  if (!v) throw new TypeError("サイズを入力してください");

  // intl は大文字化して比較(xs→XS)
  const key = system === "intl" ? v.toUpperCase() : v;
  const row = table.find((r) => String(r[system]) === key);
  if (!row) throw new RangeError(`${system} の ${value} に一致するサイズがありません`);
  return { ...row };
}
