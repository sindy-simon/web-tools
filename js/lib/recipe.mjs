// 海外レシピ単位変換 — 純ロジック

const VOL_TO_ML = {
  tsp:  4.92892,
  tbsp: 14.78677,
  floz: 29.57353,
  cup:  236.58824,
  pint: 473.17648,
};

const WEIGHT_TO_G = {
  oz: 28.34952,
  lb: 453.59237,
};

export const VOLUME_UNITS = Object.keys(VOL_TO_ML);
export const WEIGHT_UNITS = Object.keys(WEIGHT_TO_G);

export function convertVolume(value, fromUnit) {
  if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError("value は数値を指定してください");
  if (value < 0) throw new RangeError("負の体積は指定できません");
  const factor = VOL_TO_ML[fromUnit];
  if (!factor) throw new TypeError(`不明な体積単位: ${fromUnit}`);
  return Math.round(value * factor * 10) / 10;
}

export function convertWeight(value, fromUnit) {
  if (typeof value !== "number" || Number.isNaN(value)) throw new TypeError("value は数値を指定してください");
  if (value < 0) throw new RangeError("負の重量は指定できません");
  const factor = WEIGHT_TO_G[fromUnit];
  if (!factor) throw new TypeError(`不明な重量単位: ${fromUnit}`);
  return Math.round(value * factor * 10) / 10;
}

export function fahrenheitToCelsius(f) {
  if (typeof f !== "number" || Number.isNaN(f)) throw new TypeError("value は数値を指定してください");
  return Math.round((f - 32) * 5 / 9 * 10) / 10;
}

export function celsiusToFahrenheit(c) {
  if (typeof c !== "number" || Number.isNaN(c)) throw new TypeError("value は数値を指定してください");
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}
