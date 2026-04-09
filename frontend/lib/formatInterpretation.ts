/** Soft-wrap plain text to ~maxLen columns on whitespace only. */
export function wrapInterpretation(text: string, maxLen = 30): string {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return "";
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxLen) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w.length > maxLen ? w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.join("\n");
}

/** Gregorian date in Chinese numerals, e.g. 2026年4月8日 */
export function chineseDate(d = new Date()): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
