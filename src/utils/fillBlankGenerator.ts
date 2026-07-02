import type { KnowledgePoint } from '../data/knowledgePoints';

export interface FillBlankQuestion {
  knowledgePointId: number;
  question: string;
  answers: string[];
  originalContent: string;
  category: string;
}

// 冒号/破折号后面的定义内容
const DEFINITION_PATTERN = /[：:——]\s*([^。！!？?\n]{4,50})/g;

// 括号中的内容
const PAREN_PATTERN = /[（(]([^）)]{2,30})[）)]/g;

// 数字（包括小数、百分数、年份）
const NUMBER_PATTERN = /\d+(?:\.\d+)?%?/g;

// 英文单词/缩写（放宽边界条件）
const ENGLISH_PATTERN = /[A-Za-z]{2,10}/g;

// 书名号
const BOOK_PATTERN = /《([^》]{1,25})》/g;

// 引号
const QUOTE_PATTERN = /[""]([^""]{2,25})[""]/g;

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

  // 收集所有可用的替换候选
  const candidates: Array<{ start: number; end: number; text: string; priority: number }> = [];

  // 1. 括号中的内容 (priority 10 - highest)
  for (const m of content.matchAll(PAREN_PATTERN)) {
    candidates.push({ start: m.index!, end: m.index! + m[0].length, text: m[1], priority: 10 });
  }

  // 2. 书名号内容 (priority 9)
  for (const m of content.matchAll(BOOK_PATTERN)) {
    candidates.push({ start: m.index!, end: m.index! + m[0].length, text: m[1], priority: 9 });
  }

  // 3. 引号内容 (priority 8)
  for (const m of content.matchAll(QUOTE_PATTERN)) {
    candidates.push({ start: m.index!, end: m.index! + m[0].length, text: m[1], priority: 8 });
  }

  // 4. 数字 (priority 6)
  for (const m of content.matchAll(NUMBER_PATTERN)) {
    candidates.push({ start: m.index!, end: m.index! + m[0].length, text: m[0], priority: 6 });
  }

  // 5. 英文 (priority 5)
  for (const m of content.matchAll(ENGLISH_PATTERN)) {
    candidates.push({ start: m.index!, end: m.index! + m[0].length, text: m[0], priority: 5 });
  }

  // 6. 冒号/破折号后面的关键定义 (priority 4)
  for (const m of content.matchAll(DEFINITION_PATTERN)) {
    // 取后面部分的前几个字作为填空
    const def = m[1];
    // 如果定义太长，取关键部分
    if (def.length > 6 && def.length < 30) {
      candidates.push({
        start: m.index! + 1, // after the colon
        end: m.index! + 1 + def.length,
        text: def,
        priority: 4,
      });
    }
  }

  // 7. 从 content 中提取关键词（通过分词启发式）
  const extraKeywords = extractMeaningfulPhrases(content);
  for (const kw of extraKeywords) {
    const idx = content.indexOf(kw);
    if (idx >= 0) {
      candidates.push({ start: idx, end: idx + kw.length, text: kw, priority: 3 });
    }
  }

  // 去重、排序（按优先级降序，同优先级按位置）
  const seen = new Set<string>();
  const unique: typeof candidates = [];
  for (const c of candidates.sort((a, b) => b.priority - a.priority)) {
    const key = `${c.start}-${c.end}`;
    if (!seen.has(key) && !isOverlapping(c, unique)) {
      seen.add(key);
      unique.push(c);
    }
  }

  if (unique.length === 0) {
    // 最后的兜底方案：把整句话拆成两半，后半作为填空
    return fallbackBlank(kp);
  }

  // 取 1-3 个最高优先级的候选
  const selected = unique.slice(0, 3);

  // 从后往前替换
  selected.sort((a, b) => b.start - a.start);

  let question = content;
  const answers: string[] = [];

  for (const r of selected) {
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

function fallbackBlank(kp: KnowledgePoint): FillBlankQuestion {
  const content = kp.content;
  // 尝试在逗号/分号处断开
  const splitPoints: number[] = [];
  for (let i = 0; i < content.length; i++) {
    if ('，,；;。！!？?'.includes(content[i])) {
      splitPoints.push(i);
    }
  }

  if (splitPoints.length >= 2) {
    // 取中间一段作为填空
    const mid = Math.floor(splitPoints.length / 2);
    const start = splitPoints[mid - 1] + 1;
    const end = splitPoints[mid] + 1;
    const text = content.slice(start, end).trim();
    if (text.length >= 4) {
      return {
        knowledgePointId: kp.id,
        question: content.slice(0, start) + '____' + content.slice(end),
        answers: [text],
        originalContent: content,
        category: kp.category,
      };
    }
  }

  // 实在不行，随机隐藏一段
  const start = Math.floor(content.length * 0.3);
  const end = Math.min(start + Math.floor(content.length * 0.4), content.length);
  const text = content.slice(start, end);
  return {
    knowledgePointId: kp.id,
    question: content.slice(0, start) + '____' + content.slice(end),
    answers: [text],
    originalContent: content,
    category: kp.category,
  };
}

function isOverlapping(
  c: { start: number; end: number },
  existing: Array<{ start: number; end: number }>,
): boolean {
  return existing.some(e => c.start < e.end && c.end > e.start);
}

function extractMeaningfulPhrases(content: string): string[] {
  const phrases: string[] = [];

  // 顿号分隔的专有名词（取最后一两个）
  const parts = content.split(/[，,。！!？?；;：:\s]+/);
  for (const part of parts) {
    if (part.length >= 3 && part.length <= 15 && !/^[的地得了吗呢吧啊呀]$/.test(part)) {
      phrases.push(part);
    }
  }

  // 去重并取前几个
  return [...new Set(phrases)].slice(0, 5);
}
