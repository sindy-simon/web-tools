// 結果のワンクリックコピー UI(各ツールページ共用)
// import するとコピーボタンのクリックハンドラが自動で有効になる。

/** [ラベル, コピーする値] の配列からコピー行の HTML を生成する。 */
export function copyRows(rows) {
  return rows
    .map(
      ([label, value]) =>
        `<div class="copy-row"><span class="copy-label">${label}</span>` +
        `<code>${value}</code>` +
        `<button type="button" class="copy-btn" data-copy="${value}">コピー</button></div>`
    )
    .join("");
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-btn");
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.copy);
    const old = btn.textContent;
    btn.textContent = "✓ コピー済み";
    setTimeout(() => {
      btn.textContent = old;
    }, 1200);
  } catch {
    btn.textContent = "コピー失敗";
  }
});
