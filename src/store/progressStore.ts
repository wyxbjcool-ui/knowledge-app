import { create } from 'zustand';
import type { ProgressEntry, MasteryLevel } from '../utils/spacedRepetition';
import {
  createProgressEntry,
  updateProgress,
  getTodayReviewed,
  getMasteredCount,
  getPendingCount,
  dateStr,
} from '../utils/spacedRepetition';
import { loadJSON, saveJSON } from '../utils/storage';

const STORAGE_KEY = 'progress';

interface ProgressState {
  entries: Record<number, ProgressEntry>;
  favorites: number[]; // knowledgePointId[]
  wrongList: number[]; // knowledgePointId[] for wrong book
  streak: number; // 连续学习天数
  lastStudyDate: string;

  // Actions
  getEntry: (kpId: number) => ProgressEntry;
  recordResult: (kpId: number, result: MasteryLevel) => void;
  toggleFavorite: (kpId: number) => void;
  isFavorite: (kpId: number) => boolean;
  addToWrongList: (kpId: number) => void;
  removeFromWrongList: (kpId: number) => void;
  isInWrongList: (kpId: number) => boolean;
  clearWrongList: () => void;
  tickStudyDay: () => void;
  resetProgress: () => void;
  exportData: () => string;
  importData: (json: string) => { success: boolean; message: string };
  isKnown: (kpId: number) => boolean;

  // Computed
  todayReviewed: () => number;
  masteredCount: () => number;
  pendingCount: () => number;
  totalCount: () => number;
  wrongCount: () => number;
}

export const useProgressStore = create<ProgressState>((set, get) => {
  const saved = loadJSON<{
    entries: Record<number, ProgressEntry>;
    favorites: number[];
    wrongList: number[];
    streak: number;
    lastStudyDate: string;
  }>(STORAGE_KEY, {
    entries: {},
    favorites: [],
    wrongList: [],
    streak: 0,
    lastStudyDate: '',
  });

  const persist = () => {
    const { entries, favorites, wrongList, streak, lastStudyDate } = get();
    saveJSON(STORAGE_KEY, { entries, favorites, wrongList, streak, lastStudyDate });
  };

  return {
    entries: saved.entries,
    favorites: saved.favorites,
    wrongList: saved.wrongList,
    streak: saved.streak,
    lastStudyDate: saved.lastStudyDate,

    getEntry: (kpId: number) => {
      const { entries } = get();
      return entries[kpId] ?? createProgressEntry(kpId);
    },

    recordResult: (kpId: number, result: MasteryLevel) => {
      set(state => {
        const entry = state.entries[kpId] ?? createProgressEntry(kpId);
        const updated = updateProgress(entry, result);
        const newWrongList = result === 'unknown'
          ? [...new Set([...state.wrongList, kpId])]
          : state.wrongList;
        return { entries: { ...state.entries, [kpId]: updated }, wrongList: newWrongList };
      });
      persist();
    },

    toggleFavorite: (kpId: number) => {
      set(state => {
        const idx = state.favorites.indexOf(kpId);
        if (idx >= 0) {
          return { favorites: state.favorites.filter(id => id !== kpId) };
        }
        return { favorites: [...state.favorites, kpId] };
      });
      persist();
    },

    isFavorite: (kpId: number) => {
      return get().favorites.includes(kpId);
    },

    addToWrongList: (kpId: number) => {
      set(state => ({
        wrongList: [...new Set([...state.wrongList, kpId])],
      }));
      persist();
    },

    removeFromWrongList: (kpId: number) => {
      set(state => ({
        wrongList: state.wrongList.filter(id => id !== kpId),
      }));
      persist();
    },

    isInWrongList: (kpId: number) => {
      return get().wrongList.includes(kpId);
    },

    clearWrongList: () => {
      set({ wrongList: [] });
      persist();
    },

    tickStudyDay: () => {
      const today = dateStr();
      const { lastStudyDate, streak } = get();
      if (lastStudyDate === today) return; // already counted

      const yesterday = dateStr(new Date(Date.now() - 86400000));
      const newStreak = lastStudyDate === yesterday ? streak + 1 : 1;

      set({ lastStudyDate: today, streak: newStreak });
      persist();
    },

    resetProgress: () => {
      set({ entries: {}, favorites: [], wrongList: [], streak: 0, lastStudyDate: '' });
      persist();
    },

    exportData: () => {
      const { entries, favorites, wrongList, streak, lastStudyDate } = get();
      return JSON.stringify({ entries, favorites, wrongList, streak, lastStudyDate }, null, 2);
    },

    importData: (json: string) => {
      try {
        const data = JSON.parse(json);
        if (!data.entries || typeof data.entries !== 'object') {
          return { success: false, message: '数据格式不正确：缺少 entries 字段' };
        }
        set({
          entries: data.entries ?? {},
          favorites: data.favorites ?? [],
          wrongList: data.wrongList ?? [],
          streak: data.streak ?? 0,
          lastStudyDate: data.lastStudyDate ?? '',
        });
        persist();
        return { success: true, message: '数据导入成功！' };
      } catch {
        return { success: false, message: 'JSON 格式解析失败，请检查文件格式' };
      }
    },

    isKnown: (kpId: number) => {
      const entry = get().entries[kpId];
      return entry?.masteryLevel === 'known';
    },

    todayReviewed: () => {
      return getTodayReviewed(get().entries);
    },

    masteredCount: () => {
      return getMasteredCount(get().entries);
    },

    pendingCount: () => {
      return getPendingCount(get().entries);
    },

    totalCount: () => {
      // Will be dynamically set but we need a reference
      return 236;
    },

    wrongCount: () => {
      return get().wrongList.length;
    },
  };
});
