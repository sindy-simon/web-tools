// JSON 整形・検証のロジック(ブラウザ・Node 共用の純粋関数)
// ブラウザ標準の JSON.parse / JSON.stringify を使う決定論処理。AIに頼らず正しさを確かめる用途。

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

// indent: 数値(スペース数)または "\t"。"none" は圧縮(区切りなし)。
function indentValue(indent) {
  if (indent === "tab") return "\t";
  if (indent === "none") return undefined;
  const n = Number(indent);
  return Number.isFinite(n) ? n : 2;
}

/**
 * JSON を整形/圧縮する。
 * @returns {{ ok: boolean, result: string|null, error: string|null }}
 */
export function formatJson(text, indent = 2) {
  assertString(text);
  try {
    const parsed = JSON.parse(text);
    const result = JSON.stringify(parsed, null, indentValue(indent));
    return { ok: true, result, error: null };
  } catch (e) {
    return { ok: false, result: null, error: e.message };
  }
}

/** JSON を1行に圧縮する。 */
export function minifyJson(text) {
  return formatJson(text, "none");
}

/** 妥当な JSON かどうかだけを判定する。 */
export function isValidJson(text) {
  return formatJson(text).ok;
}
