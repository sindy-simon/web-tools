// テキストケース変換 — 純ロジック

function toWords(str) {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-\.]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean);
}

export function convertCase(str) {
  if (typeof str !== 'string') throw new TypeError('入力は文字列で指定してください');
  const words = toWords(str.trim());
  if (words.length === 0) throw new TypeError('変換できる文字がありません');

  const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1);

  return {
    camel:    words.map((w, i) => (i === 0 ? w : capitalize(w))).join(''),
    pascal:   words.map(capitalize).join(''),
    snake:    words.join('_'),
    constant: words.join('_').toUpperCase(),
    kebab:    words.join('-'),
    dot:      words.join('.'),
  };
}
