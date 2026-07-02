import { create } from 'zustand';
import { loadJSON, saveJSON } from '../utils/storage';

export type StudyMode = 'sequential' | 'random' | 'byCategory';
export type DailyGoal = 10 | 20 | 30 | 50 | 0; // 0 = all

interface SettingsState {
  fontSize: number;         // 16-24
  dailyGoal: DailyGoal;
  studyMode: StudyMode;
  selectedCategory: string;
  showContent: boolean;     // 是否默认显示答案
  darkMode: 'auto' | 'light' | 'dark';
  highContrast: boolean;

  setFontSize: (n: number) => void;
  setDailyGoal: (g: DailyGoal) => void;
  setStudyMode: (m: StudyMode) => void;
  setSelectedCategory: (c: string) => void;
  setShowContent: (v: boolean) => void;
  setDarkMode: (m: 'auto' | 'light' | 'dark') => void;
  setHighContrast: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  const saved = loadJSON<Partial<SettingsState>>('settings', {});

  return {
    fontSize: saved.fontSize ?? 18,
    dailyGoal: saved.dailyGoal ?? 20,
    studyMode: saved.studyMode ?? 'sequential',
    selectedCategory: saved.selectedCategory ?? '',
    showContent: saved.showContent ?? false,
    darkMode: saved.darkMode ?? 'auto',
    highContrast: saved.highContrast ?? false,

    setFontSize: (n) => {
      set({ fontSize: Math.max(14, Math.min(28, n)) });
      saveJSON('settings', useSettingsStore.getState());
    },
    setDailyGoal: (g) => {
      set({ dailyGoal: g });
      saveJSON('settings', useSettingsStore.getState());
    },
    setStudyMode: (m) => {
      set({ studyMode: m });
      saveJSON('settings', useSettingsStore.getState());
    },
    setSelectedCategory: (c) => {
      set({ selectedCategory: c });
      saveJSON('settings', useSettingsStore.getState());
    },
    setShowContent: (v) => {
      set({ showContent: v });
      saveJSON('settings', useSettingsStore.getState());
    },
    setDarkMode: (m) => {
      set({ darkMode: m });
      saveJSON('settings', useSettingsStore.getState());
    },
    setHighContrast: (v) => {
      set({ highContrast: v });
      saveJSON('settings', useSettingsStore.getState());
    },
  };
});
