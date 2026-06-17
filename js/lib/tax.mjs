// 消費税計算のロジック(ブラウザ・Node 共用の純粋関数)
// 端数処理は事業者により異なるため floor / round / ceil を選択可能にする(既定: floor)。

const ROUNDERS = {
  floor: Math.floor,
  round: Math.round,
  ceil: Math.ceil,
};

function rounder(rounding) {
  const fn = ROUNDERS[rounding];
  if (!fn) {
    throw new RangeError(`未対応の端数処理です: ${rounding}`);
  }
  return fn;
}

function assertAmount(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label}には 0 以上の数値を渡してください`);
  }
}

/** 税抜価格から税込価格を求める。 */
export function addTax(price, ratePercent, rounding = "floor") {
  assertAmount(price, "税抜価格");
  assertAmount(ratePercent, "税率");
  const fn = rounder(rounding);
  const tax = fn((price * ratePercent) / 100);
  return { price, tax, total: price + tax };
}

/** 税込価格から税抜価格と税額を逆算する。 */
export function removeTax(total, ratePercent, rounding = "floor") {
  assertAmount(total, "税込価格");
  assertAmount(ratePercent, "税率");
  const fn = rounder(rounding);
  // total / 1.1 のような浮動小数点誤差(1100/1.1 = 999.99…)を避けるため分子分母を 100 倍する
  const price = fn((total * 100) / (100 + ratePercent));
  return { price, tax: total - price, total };
}
