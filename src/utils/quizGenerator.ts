import type { KnowledgePoint } from '../data/knowledgePoints';
import { knowledgePoints as allKPs } from '../data/knowledgePoints';

export interface ChoiceQuestion {
  knowledgePointId: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 从同分类知识点中抽取可作为选项的关键词/短语
function collectDistractorPool(category: string, excludeId: number): string[] {
  const pool: string[] = [];
  for (const kp of allKPs) {
    if (kp.id === excludeId) continue;
    // 同分类优先，但也混入少量跨分类
    if (kp.category !== category && Math.random() > 0.3) continue;

    const c = kp.content;
    // 抽数字
    for (const m of c.matchAll(/\d+(?:\.\d+)?%?/g)) {
      pool.push(m[0]);
    }
    // 抽括号内容
    for (const m of c.matchAll(/[（(]([^）)]{2,15})[）)]/g)) {
      pool.push(m[1]);
    }
    // 抽冒号后的关键短语（顿号分割的）
    const colon = c.indexOf('：');
    if (colon > 0) {
      const after = c.slice(colon + 1);
      const items = after.split(/[、，,]/);
      for (const item of items) {
        const t = item.trim();
        if (t.length >= 2 && t.length <= 12) pool.push(t);
      }
    }
    // 抽关键词本身
    for (const kw of kp.keywords) {
      if (kw.length >= 2 && kw.length <= 15) pool.push(kw);
    }
  }
  return [...new Set(pool)];
}

export function generateChoiceQuestion(kp: KnowledgePoint): ChoiceQuestion | null {
  try {
    const result = tryGenerate(kp);
    if (!result) return null;
    return result;
  } catch {
    return null;
  }
}

function tryGenerate(kp: KnowledgePoint): ChoiceQuestion | null {
  const content = kp.content;
  const cat = kp.category;
  const pool = collectDistractorPool(cat, kp.id);

  // === 策略1: 数字类 ===
  const numbers = [...content.matchAll(/\d+(?:\.\d+)?%?/g)].map(m => m[0]);
  if (numbers.length >= 1 && pool.length >= 3) {
    const target = numbers[Math.floor(Math.random() * numbers.length)];
    // 找到该数字的上下文
    const idx = content.indexOf(target);
    const prefix = idx > 8 ? '...' + content.slice(Math.max(0, idx - 8), idx) : content.slice(0, idx);
    const question = `"${prefix}" 中的数字是？`;

    const distractors = pickSimilarNumbers(pool, target, 3);
    const options = shuffleArr([target, ...distractors]);
    const correctIdx = options.indexOf(target);
    if (distractors.length >= 3) {
      return { knowledgePointId: kp.id, question, options, correctIndex: correctIdx, category: cat };
    }
  }

  // === 策略2: 人名/专有名词归属类 ===
  const nameMatch = content.match(/([A-Z]{2,8}|阿奇舒勒|雷格[·･]瑞文斯|毛泽东|焦裕禄|马克思|恩格斯|习近平|戴厚良|穆青|冯健|周原|雷格)/);
  if (nameMatch) {
    const name = nameMatch[0];
    const before = content.slice(0, nameMatch.index).trim();
    let question = '';
    if (before.length >= 4) {
      question = `${before.replace(/[，,。！!？?；;：:、\s]+$/, '')} 的创立者/提出者是？`;
    } else {
      question = `"${content.slice(nameMatch.index! - 3 > 0 ? nameMatch.index! - 3 : 0, nameMatch.index! + name.length + 20)}" —— 与此相关的人物是？`;
    }

    // 从所有知识点抽人名作为干扰项
    const names = collectNames().filter(n => n !== name);
    const distractors = shuffleArr(names).slice(0, 3);
    if (distractors.length >= 3) {
      const options = shuffleArr([name, ...distractors]);
      return { knowledgePointId: kp.id, question, options, correctIndex: options.indexOf(name), category: cat };
    }
  }

  // === 策略3: 括号内容填空类 ===
  const parenMatch = content.match(/[（(]([^）)]{2,20})[）)]/);
  if (parenMatch && pool.length >= 3) {
    const answer = parenMatch[1];
    const question = content.replace(parenMatch[0], '（___）');
    const distractors = pickSimilarFromPool(pool, answer, 3);
    if (distractors.length >= 3) {
      const options = shuffleArr([answer, ...distractors]);
      return { knowledgePointId: kp.id, question, options, correctIndex: options.indexOf(answer), category: cat };
    }
  }

  // === 策略4: 列举/分类类：哪项不属于/属于 ===
  const listItems = extractListItems(content);
  if (listItems.length >= 4 && pool.length >= 4) {
    // 挑一个正确项，生成"以下哪项属于XXX"
    const topic = extractTopic(content);
    const correctItem = listItems[Math.floor(Math.random() * listItems.length)];
    const question = topic ? `以下哪项${topic.includes('不') ? '' : '属于'}${topic}？` : `以下哪项与"${content.slice(0, 20)}..."相关？`;

    const distractors = pickSimilarFromPool(pool, correctItem, 3);
    if (distractors.length >= 3) {
      const options = shuffleArr([correctItem, ...distractors]);
      return { knowledgePointId: kp.id, question, options, correctIndex: options.indexOf(correctItem), category: cat };
    }
  }

  // === 策略5: 冒号后的关键定义作为答案，题干问"XXX是指什么" ===
  const colonIdx = content.indexOf('：');
  if (colonIdx > 0 && colonIdx < content.length * 0.6) {
    const term = content.slice(0, colonIdx).trim();
    const answer = content.slice(colonIdx + 1).trim();
    // 截短答案
    const shortAnswer = answer.length > 40 ? answer.slice(0, 38) + '...' : answer;
    const question = `${term} 是指？`;

    // 从pool中找相近长度的作为干扰项
    const distractors = pickSimilarFromPool(pool, shortAnswer, 3);
    if (distractors.length >= 3) {
      const options = shuffleArr([shortAnswer, ...distractors]);
      return { knowledgePointId: kp.id, question, options, correctIndex: options.indexOf(shortAnswer), category: cat };
    }
  }

  // === 策略6: 反向题 —— 给内容问分类 ===
  const otherCats = [...new Set(allKPs.filter(k => k.id !== kp.id).map(k => k.category))];
  if (otherCats.length >= 3) {
    const shortContent = content.length > 40 ? content.slice(0, 38) + '...' : content;
    const question = `"${shortContent}" 属于以下哪个分类？`;
    const distractors = shuffleArr(otherCats).slice(0, 3);
    const options = shuffleArr([cat, ...distractors]);
    return { knowledgePointId: kp.id, question, options, correctIndex: options.indexOf(cat), category: cat };
  }

  return null;
}

// === 辅助函数 ===

function collectNames(): string[] {
  const names: string[] = [];
  for (const kp of allKPs) {
    for (const m of kp.content.matchAll(/([A-Z]{2,8}|阿奇舒勒|雷格[·･]瑞文斯|毛泽东|焦裕禄|马克思|恩格斯|习近平|戴厚良|穆青|冯健|周原|雷格)/g)) {
      names.push(m[0]);
    }
  }
  return [...new Set(names)];
}

function pickSimilarNumbers(pool: string[], target: string, count: number): string[] {
  // Prefer numbers that look similar in magnitude
  const targetNum = parseFloat(target.replace('%', ''));
  const candidates = pool
    .filter(p => /\d/.test(p) && p !== target)
    .map(p => ({ text: p, diff: Math.abs(parseFloat(p.replace('%', '')) - targetNum) }));
  candidates.sort((a, b) => a.diff - b.diff);
  // Mix: some similar, some different
  const picked = candidates.slice(0, count * 2);
  return shuffleArr(picked).slice(0, count).map(c => c.text);
}

function pickSimilarFromPool(pool: string[], target: string, count: number): string[] {
  const filtered = pool.filter(p => p !== target && p.length >= 2 && p.length <= 30);
  // Prefer items with similar length
  const sorted = [...filtered].sort((a, b) =>
    Math.abs(a.length - target.length) - Math.abs(b.length - target.length)
  );
  const candidates = [...new Set(sorted.slice(0, count * 3))];
  return shuffleArr(candidates).slice(0, count);
}

function extractListItems(content: string): string[] {
  const items: string[] = [];
  // 顿号/逗号分隔的枚举
  const parts = content.split(/[，,。！!？?；;：:\s]+/);
  for (const p of parts) {
    const t = p.trim();
    if (t.length >= 2 && t.length <= 20 && !/^[的地得了吗呢吧啊呀和与或]$/.test(t)) {
      items.push(t);
    }
  }
  // Also look for 、 separated items
  const dunParts = content.split(/[、]/);
  for (const p of dunParts) {
    const t = p.replace(/^[，,。！!？?；;：:\s]+/, '').replace(/[，,。！!？?；;：:\s]+$/, '').trim();
    if (t.length >= 2 && t.length <= 15) items.push(t);
  }
  return [...new Set(items)];
}

function extractTopic(content: string): string {
  // 提取问题的主题，如"三重一大"、"财务三表"等
  const quoted = content.match(/[""]([^""]{2,15})[""]/);
  if (quoted) return quoted[1];

  const paren = content.match(/[（(]([^）)]{2,15})[）)]/);
  if (paren) return paren[1];

  // 冒号前的内容
  const colon = content.indexOf('：');
  if (colon > 0 && colon < 20) return content.slice(0, colon);

  // 前几个字
  return content.length > 10 ? content.slice(0, 10) : content;
}
