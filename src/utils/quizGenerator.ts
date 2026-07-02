import type { KnowledgePoint } from '../data/knowledgePoints';
import { knowledgePoints as allKPs } from '../data/knowledgePoints';

export interface ChoiceQuestion {
  knowledgePointId: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

function getQuestionText(kp: KnowledgePoint): string {
  // 尝试生成有意义的问题
  const content = kp.content;

  // 提取关键部分作为题干
  const colonIdx = content.indexOf('：');
  if (colonIdx > 0 && colonIdx < content.length * 0.6) {
    return content.slice(0, colonIdx) + '是什么？';
  }

  const dashIdx = content.indexOf('——');
  if (dashIdx > 0 && dashIdx < content.length * 0.6) {
    return content.slice(0, dashIdx) + '是指什么？';
  }

  // 使用前半部分
  if (content.length > 40) {
    const half = Math.min(40, content.length);
    return '以下关于"' + content.slice(0, half) + '..."的描述，正确的是？';
  }

  return '以下描述正确的是？';
}

export function generateChoiceQuestion(kp: KnowledgePoint): ChoiceQuestion | null {
  try {
    const question = getQuestionText(kp);

    // Get same category knowledge points for distractors
    const sameCat = allKPs.filter(k => k.id !== kp.id && k.category === kp.category);
    const otherCat = allKPs.filter(k => k.id !== kp.id && k.category !== kp.category);

    // Shuffle and pick distractors
    const candidates = [...sameCat, ...otherCat];
    const shuffledCandidates = shuffleArray([...candidates]);

    const distractors: string[] = [];
    for (const c of shuffledCandidates) {
      if (distractors.length >= 3) break;
      const txt = c.content.length > 60 ? c.content.slice(0, 57) + '...' : c.content;
      if (!distractors.includes(txt) && txt !== kp.content) {
        distractors.push(txt);
      }
    }

    // If not enough distractors, make some from the correct answer
    while (distractors.length < 3) {
      distractors.push('与上述内容相似但不完全相同的表述');
    }

    const options = [
      kp.content.length > 60 ? kp.content.slice(0, 57) + '...' : kp.content,
      ...distractors.slice(0, 3),
    ];

    const shuffled = shuffleArray(options.map((o, i) => ({ text: o, origIdx: i })));
    const correctIndex = shuffled.findIndex(s => s.origIdx === 0);

    return {
      knowledgePointId: kp.id,
      question,
      options: shuffled.map(s => s.text),
      correctIndex,
      category: kp.category,
    };
  } catch {
    return null;
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
