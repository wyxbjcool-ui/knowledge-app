import type { KnowledgePoint } from '../data/knowledgePoints';

export interface FillBlankQuestion {
  knowledgePointId: number;
  question: string;
  answers: string[];
  originalContent: string;
  category: string;
}

// 需要替换为填空的关键词模式
const REPLACE_PATTERNS: Array<{ pattern: RegExp; maxBlanks?: number }> = [
  // 数字（包括小数、百分数）
  { pattern: /\d+(?:\.\d+)?%?/g, maxBlanks: 3 },
  // 英文缩写和专有名词
  { pattern: /\b[A-Z]{2,8}\b/g, maxBlanks: 2 },
  // 引号中的内容
  { pattern: /[""]([^""]{1,20})[""]/g, maxBlanks: 2 },
  // 书名号中的内容
  { pattern: /《([^》]{1,20})》/g, maxBlanks: 2 },
  // 关键人名
  { pattern: /(阿奇舒勒|雷格[·･]瑞文斯|毛泽东|焦裕禄|马克思|恩格斯|习近平|戴厚良|穆青|冯健|周原)/g, maxBlanks: 2 },
];

// 需要保护不替换的词
const PROTECTED = new Set([
  '的', '了', '在', '是', '和', '与', '或', '不', '会', '能', '要', '有', '这', '那', '我', '你', '他', '也', '就', '都', '但', '而', '从', '到', '对', '被', '把', '让', '向', '以', '为', '所', '等', '及', '其', '将',
]);

export function generateFillBlank(kp: KnowledgePoint): FillBlankQuestion | null {
  const content = kp.content;

  // 手动配置了blanks的优先使用
  if (kp.blanks && kp.blanks.length > 0) {
    const b = kp.blanks[Math.floor(Math.random() * kp.blanks.length)];
    return {
      knowledgePointId: kp.id,
      question: b.question,
      answers: b.answers,
      originalContent: content,
      category: kp.category,
    };
  }

  // 自动生成填空
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  for (const { pattern, maxBlanks } of REPLACE_PATTERNS) {
    const matches = [...content.matchAll(pattern)];
    const limit = maxBlanks ?? matches.length;
    let count = 0;
    for (const m of matches) {
      if (count >= limit) break;
      const text = m[1] ?? m[0];
      if (PROTECTED.has(text)) continue;
      if (replacements.some(r => r.start === (m.index ?? 0))) continue;
      replacements.push({
        start: m.index ?? 0,
        end: (m.index ?? 0) + m[0].length,
        text: text,
      });
      count++;
    }
  }

  // 如果没有合适的关键词替换，尝试替换关键词列表中的词
  if (replacements.length === 0 && kp.keywords.length > 0) {
    for (const kw of kp.keywords) {
      const idx = content.indexOf(kw);
      if (idx >= 0 && !PROTECTED.has(kw)) {
        replacements.push({ start: idx, end: idx + kw.length, text: kw });
        break;
      }
    }
  }

  if (replacements.length === 0) {
    return null;
  }

  // 排序替换位置（从后往前替换，保持索引正确）
  replacements.sort((a, b) => b.start - a.start);

  let question = content;
  const answers: string[] = [];

  for (const r of replacements) {
    question = question.slice(0, r.start) + '____' + question.slice(r.end);
    answers.push(r.text);
  }

  return {
    knowledgePointId: kp.id,
    question,
    answers,
    originalContent: content,
    category: kp.category,
  };
}
