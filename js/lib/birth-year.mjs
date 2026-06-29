import { DATA, YEAR_MIN, YEAR_MAX, LATEST_YEAR, NOTABLE } from "./birth-year-data.mjs";

export { YEAR_MIN, YEAR_MAX, LATEST_YEAR, NOTABLE };

export function getYearData(year) {
  const y = Number(year);
  if (!Number.isInteger(y) || y < YEAR_MIN || y > YEAR_MAX) {
    throw new RangeError(`${year}年のデータはありません（対応範囲: ${YEAR_MIN}〜${YEAR_MAX}年）`);
  }
  return DATA[y];
}

export function getLatestData() {
  return DATA[LATEST_YEAR];
}

export function getAllYears() {
  return Object.keys(DATA).map(Number).sort((a, b) => a - b);
}

export function getChartSeries(metric) {
  return getAllYears().map((y) => ({ x: y, y: DATA[y][metric] }));
}

export function formatBirths(n) {
  if (n == null) return "—";
  return n.toLocaleString("ja-JP") + " 人";
}

export function formatPop(n) {
  if (n == null) return "—";
  return n.toLocaleString("ja-JP") + " 万人";
}

export function formatTfr(n) {
  if (n == null) return "—";
  return n.toFixed(2);
}

export function formatLife(n) {
  if (n == null) return "—";
  return n.toFixed(1) + " 歳";
}

export function formatUniv(n) {
  if (n == null) return "—";
  return n.toFixed(1) + " %";
}

export function formatSalary(n) {
  if (n == null) return "—（データなし）";
  return n.toLocaleString("ja-JP") + " 円";
}

export function formatTemp(n) {
  if (n == null) return "—";
  return n.toFixed(1) + " ℃";
}

export function formatPrecip(n) {
  if (n == null) return "—";
  return n.toLocaleString("ja-JP") + " mm";
}

// diff: 選択年と現在(2023)の差を表示
// positive = 選択年の方が大きい、negative = 選択年の方が小さい
export function formatDiff(val, latestVal, unit = "", invertPositive = false) {
  if (val == null || latestVal == null) return "";
  const diff = val - latestVal;
  if (diff === 0) return "今と同じ";
  const abs = Math.abs(diff).toFixed(unit === "%" ? 1 : diff % 1 === 0 ? 0 : 2);
  const bigger = diff > 0;
  if (invertPositive) {
    return bigger
      ? `今より ${abs}${unit} 高い`
      : `今より ${abs}${unit} 低い`;
  }
  return bigger
    ? `今より ${abs}${unit} 多い`
    : `今より ${abs}${unit} 少ない`;
}

export function formatDiffPop(val, latestVal) {
  if (val == null || latestVal == null) return "";
  const diff = val - latestVal;
  if (diff === 0) return "今と同じ";
  const abs = Math.abs(diff).toLocaleString("ja-JP");
  return diff > 0 ? `今より ${abs} 万人 多い` : `今より ${abs} 万人 少ない`;
}

export function formatDiffBirths(val, latestVal) {
  if (val == null || latestVal == null) return "";
  const diff = val - latestVal;
  if (diff === 0) return "今と同じ";
  const abs = Math.abs(diff).toLocaleString("ja-JP");
  return diff > 0 ? `今より ${abs} 人 多い` : `今より ${abs} 人 少ない`;
}

export function formatDiffSalary(val, latestVal) {
  if (val == null || latestVal == null) return "";
  const diff = val - latestVal;
  const abs = Math.abs(diff).toLocaleString("ja-JP");
  return diff > 0 ? `今より ${abs} 円 高い` : `今より ${abs} 円 低い`;
}
