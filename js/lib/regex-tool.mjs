// 正規表現テスターのロジック(ブラウザ・Node 共用の純粋関数)
// ブラウザ標準の RegExp を使う決定論処理。AIが出した正規表現を実データで検証する用途。

function assertString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} には文字列を渡してください`);
  }
}

/** RegExp を安全に生成する。不正なパターンはエラー文字列を返す。 */
export function buildRegex(pattern, flags = "") {
  assertString(pattern, "pattern");
  assertString(flags, "flags");
  try {
    return { ok: true, regex: new RegExp(pattern, flags), error: null };
  } catch (e) {
    return { ok: false, regex: null, error: e.message };
  }
}

// マッチ全件を列挙するため g を内部的に補う。
function withGlobal(flags) {
  return flags.includes("g") ? flags : flags + "g";
}

/**
 * パターンをテキストに当ててマッチ全件を返す。
 * @returns {{ ok, error, matches: Array<{value,index,groups,named}> }}
 */
export function findMatches(pattern, flags = "", text = "") {
  assertString(text, "text");
  const built = buildRegex(pattern, withGlobal(flags));
  if (!built.ok) return { ok: false, error: built.error, matches: [] };
  const re = built.regex;
  const matches = [];
  let m;
  let guard = 0;
  while ((m = re.exec(text)) !== null) {
    matches.push({
      value: m[0],
      index: m.index,
      groups: m.slice(1),
      named: m.groups ? { ...m.groups } : null,
    });
    if (m.index === re.lastIndex) re.lastIndex++; // 空マッチでの無限ループ回避
    if (++guard > 100000) break;
  }
  return { ok: true, error: null, matches };
}

/** パターンにマッチした箇所を replacement で置換する。 */
export function replaceAll(pattern, flags = "", text = "", replacement = "") {
  assertString(text, "text");
  assertString(replacement, "replacement");
  const built = buildRegex(pattern, withGlobal(flags));
  if (!built.ok) return { ok: false, error: built.error, result: null };
  return { ok: true, error: null, result: text.replace(built.regex, replacement) };
}
