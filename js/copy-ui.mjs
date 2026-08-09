// 結果のワンクリックコピー UI(各ツールページ共用)
// import するとコピーボタンのクリックハンドラが自動で有効になる。

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** [ラベル, コピーする値] の配列からコピー行の HTML を生成する。 */
export function copyRows(rows) {
  return rows
    .map(
      ([label, value]) => {
        const safeLabel = escapeHtml(label);
        const safeValue = escapeHtml(value);
        return `<div class="copy-row"><span class="copy-label">${safeLabel}</span>` +
          `<code>${safeValue}</code>` +
          `<button type="button" class="copy-btn" data-copy="${safeValue}">コピー</button></div>`;
      }
    )
    .join("");
}

if (typeof document !== "undefined") {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".copy-btn");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const originalLabel = button.textContent;
      button.textContent = "コピー済み";
      setTimeout(() => {
        button.textContent = originalLabel;
      }, 1200);
    } catch {
      button.textContent = "コピー失敗";
    }
  });
}
