// birth-rank.html の「出生数 早見表」を静的HTMLとして生成する。
//
// なぜビルド時に埋め込むのか:
//   birth-year.html は統計データを JS で描画していたため、クローラには空の div にしか
//   見えていなかった（AdSense 監査で判明した最大の失点）。同じ轍を踏まないよう、
//   75年ぶんの表は **HTML に文字として存在する** 状態でコミットする。
//
// 使い方:  node tools/gen-birth-rank-table.mjs
//   birth-rank.html の BIRTH-RANK-TABLE:START / :END の間を書き換える（冪等）。
//   データ（js/lib/birth-year-data.mjs）を更新したら実行し直すこと。

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tableRows, formatCount, LATEST_YEAR, YEAR_MAX } from "../js/lib/birth-rank-view.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = join(ROOT, "birth-rank.html");
const START = "<!-- BIRTH-RANK-TABLE:START";
const END = "<!-- BIRTH-RANK-TABLE:END -->";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function buildTable() {
  const head =
    "<tr><th>年</th><th>出生数</th><th>1日あたり</th><th>多い順</th><th>注記</th></tr>";
  const body = tableRows()
    .map((r) => {
      const note = r.year === YEAR_MAX ? (r.notable ? `${r.notable}／概数` : "概数") : r.notable;
      const cls = r.year === LATEST_YEAR ? ' class="latest"' : "";
      return (
        `<tr${cls}><th>${r.year}年</th>` +
        `<td>${formatCount(r.births)}人</td>` +
        `<td>${formatCount(r.perDay)}人</td>` +
        `<td>${r.rank}位</td>` +
        `<td class="note-cell">${escapeHtml(note)}</td></tr>`
      );
    })
    .join("\n            ");
  return `<table class="years">\n            ${head}\n            ${body}\n          </table>`;
}

const html = readFileSync(TARGET, "utf8");
const startIdx = html.indexOf(START);
const endIdx = html.indexOf(END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  throw new Error(`${TARGET} に BIRTH-RANK-TABLE のマーカーが見つかりません`);
}
const startLineEnd = html.indexOf("\n", startIdx) + 1;

const next =
  html.slice(0, startLineEnd) + "          " + buildTable() + "\n          " + html.slice(endIdx);
writeFileSync(TARGET, next);
console.log(`早見表を生成しました: ${tableRows().length} 行 → ${TARGET}`);
