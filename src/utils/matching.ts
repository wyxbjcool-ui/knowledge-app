export function fuzzyMatch(input: string, expectedAnswers: string[]): boolean {
  if (!input.trim()) return false;
  const normalized = normalize(input);
  return expectedAnswers.some(ans => {
    const normAns = normalize(ans);
    if (normAns === normalized) return true;
    // 包含匹配
    if (normAns.includes(normalized) && normalized.length >= 2) return true;
    if (normalized.includes(normAns) && normAns.length >= 2) return true;
    return false;
  });
}

function normalize(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/[，,。.！!？?、；;：:（）()【】\[\]"'']/g, '')
    .toLowerCase()
    .trim();
}

export function extractKeywords(content: string): string[] {
  const kw: string[] = [];

  // 引号中的词
  const quoted = content.match(/[""]([^""]{2,30})[""]/g);
  if (quoted) {
    quoted.forEach(q => kw.push(q.replace(/[""]/g, '')));
  }

  // 书名号中的词
  const book = content.match(/《([^》]{2,30})》/g);
  if (book) {
    book.forEach(b => kw.push(b.replace(/[《》]/g, '')));
  }

  return [...new Set(kw)].slice(0, 8);
}
