// 個人情報(PII)検出・伏字化のロジック(ブラウザ・Node 共用の純粋関数)
// 方針: 完全自動マスクは「保証」しない。決定論的なパターンで「検出」し、利用者が確認して伏字化する補助。
// AIに貼る前のチェック用途。検出は不完全なので最終確認は利用者の責任(UIに免責を明記)。

function assertString(text) {
  if (typeof text !== "string") {
    throw new TypeError("text には文字列を渡してください");
  }
}

// クレジットカードらしさの検証(Luhn チェック)で誤検出を減らす。
function luhn(s) {
  const digits = s.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// 検出器。優先度順(先に来たものが範囲を確保し、重複した検出はスキップ)。
const DETECTORS = [
  { type: "email", label: "メールアドレス", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { type: "creditcard", label: "カード番号", re: /\b\d(?:[ -]?\d){12,15}\b/g, validate: luhn },
  { type: "phone", label: "電話番号", re: /\b0\d{1,4}-\d{1,4}-\d{3,4}\b|\b0\d{9,10}\b/g },
  { type: "mynumber", label: "マイナンバー", re: /\b\d{12}\b/g },
  { type: "ip", label: "IPアドレス", re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  { type: "postal", label: "郵便番号", re: /〒?\d{3}-\d{4}/g },
];

function overlaps(taken, start, end) {
  return taken.some(([s, e]) => start < e && end > s);
}

/**
 * テキストから PII らしき箇所を検出する。
 * @returns {Array<{type,label,value,start,end}>} 出現位置順
 */
export function detectPII(text) {
  assertString(text);
  const found = [];
  const taken = [];
  for (const d of DETECTORS) {
    d.re.lastIndex = 0;
    let m;
    while ((m = d.re.exec(text)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (d.validate && !d.validate(m[0])) continue;
      if (overlaps(taken, start, end)) continue;
      found.push({ type: d.type, label: d.label, value: m[0], start, end });
      taken.push([start, end]);
    }
  }
  found.sort((a, b) => a.start - b.start);
  return found;
}

/**
 * 検出した PII を [ラベル] に置き換えた文字列を返す。
 * @returns {{ masked: string, found: Array }}
 */
export function maskPII(text) {
  const found = detectPII(text);
  let masked = text;
  for (const f of [...found].sort((a, b) => b.start - a.start)) {
    masked = masked.slice(0, f.start) + `[${f.label}]` + masked.slice(f.end);
  }
  return { masked, found };
}
