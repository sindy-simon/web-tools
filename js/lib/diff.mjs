// テキスト差分(行単位 diff)のロジック(ブラウザ・Node 共用の純粋関数)
// LCS(最長共通部分列)で2テキストの行を比較する決定論処理。AI出力 vs 原文の比較などに。

function assertString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} には文字列を渡してください`);
  }
}

/**
 * 2つのテキストを行単位で比較し、差分の並びを返す。
 * @returns {Array<{type:"equal"|"add"|"remove", line:string}>}
 */
export function diffLines(aText, bText) {
  assertString(aText, "aText");
  assertString(bText, "bText");
  const a = aText.split("\n");
  const b = bText.split("\n");
  const n = a.length;
  const m = b.length;

  // dp[i][j] = a[i..], b[j..] の LCS 長
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: "equal", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "remove", line: a[i] });
      i++;
    } else {
      out.push({ type: "add", line: b[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "remove", line: a[i++] });
  while (j < m) out.push({ type: "add", line: b[j++] });
  return out;
}

/** 差分の件数を集計する。 */
export function diffStats(parts) {
  return parts.reduce(
    (acc, p) => {
      acc[p.type]++;
      return acc;
    },
    { equal: 0, add: 0, remove: 0 }
  );
}
