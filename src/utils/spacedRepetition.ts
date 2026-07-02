export type MasteryLevel = 'known' | 'fuzzy' | 'unknown';

export interface ProgressEntry {
  knowledgePointId: number;
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  masteryLevel: MasteryLevel;
  lastReviewDate: string; // ISO date
  nextReviewDate: string; // ISO date
  consecutiveCorrect: number;
}

const INTERVALS: Record<MasteryLevel, number[]> = {
  unknown: [0, 0, 0],         // 当天再出现
  fuzzy: [0, 1, 2],            // 次日出现
  known: [1, 3, 7, 15, 30],    // 逐步延长
};

export function createProgressEntry(kpId: number): ProgressEntry {
  const today = dateStr();
  return {
    knowledgePointId: kpId,
    seenCount: 0,
    correctCount: 0,
    wrongCount: 0,
    masteryLevel: 'unknown',
    lastReviewDate: '',
    nextReviewDate: today,
    consecutiveCorrect: 0,
  };
}

export function getNextInterval(level: MasteryLevel, consecutiveCorrect: number): number {
  const intervals = INTERVALS[level];
  if (consecutiveCorrect >= intervals.length) {
    return intervals[intervals.length - 1];
  }
  return intervals[Math.max(0, consecutiveCorrect)];
}

export function computeNextReview(level: MasteryLevel, consecutiveCorrect: number): string {
  const days = getNextInterval(level, consecutiveCorrect);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateStr(d);
}

export function updateProgress(
  entry: ProgressEntry,
  result: MasteryLevel,
): ProgressEntry {
  const today = dateStr();
  const newEntry = { ...entry };

  newEntry.seenCount += 1;
  newEntry.lastReviewDate = today;
  newEntry.masteryLevel = result;

  if (result === 'known') {
    newEntry.correctCount += 1;
    newEntry.consecutiveCorrect += 1;
  } else if (result === 'fuzzy') {
    newEntry.consecutiveCorrect = Math.max(0, newEntry.consecutiveCorrect - 1);
  } else {
    // unknown
    newEntry.wrongCount += 1;
    newEntry.consecutiveCorrect = 0;
  }

  newEntry.nextReviewDate = computeNextReview(result, newEntry.consecutiveCorrect);
  return newEntry;
}

export function dateStr(d?: Date): string {
  const date = d ?? new Date();
  return date.toISOString().slice(0, 10);
}

export function isDue(entry: ProgressEntry): boolean {
  return entry.nextReviewDate <= dateStr();
}

export function getTodayReviewed(entries: Record<number, ProgressEntry>): number {
  const today = dateStr();
  return Object.values(entries).filter(e => e.lastReviewDate === today).length;
}

export function getMasteredCount(entries: Record<number, ProgressEntry>): number {
  return Object.values(entries).filter(e => e.masteryLevel === 'known').length;
}

export function getPendingCount(entries: Record<number, ProgressEntry>): number {
  return Object.values(entries).filter(e => isDue(e)).length;
}
