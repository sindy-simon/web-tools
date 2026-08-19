import { maskPII } from "../lib/pii.mjs";

const input = document.getElementById("input");
const output = document.getElementById("output");
const summary = document.getElementById("summary");
const copyBtn = document.getElementById("copyBtn");

function update() {
  const { masked, found } = maskPII(input.value);
  output.value = masked;
  summary.replaceChildren();

  if (input.value.trim() === "") {
    summary.hidden = true;
    return;
  }

  const label = document.createTextNode("検出された候補: ");
  const count = document.createElement("strong");
  count.textContent = `${found.length}件`;
  summary.append(label, count);

  if (found.length === 0) {
    summary.append(document.createTextNode("（対応パターンに一致なし。安全を意味しません）"));
  } else {
    const list = document.createElement("ul");
    list.className = "pii-list";
    for (const item of found) {
      const row = document.createElement("li");
      const code = document.createElement("code");
      row.append(document.createTextNode(`${item.label}: `), code);
      code.textContent = item.value;
      list.append(row);
    }
    summary.append(list);
  }
  summary.hidden = false;
}

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "✓ コピー済み";
    setTimeout(() => { copyBtn.textContent = "コピー"; }, 1200);
  } catch {
    copyBtn.textContent = "コピー失敗";
  }
});

input.addEventListener("input", update);
update();
