import { useState, useMemo } from 'react';
import KnowledgeCard from '../components/KnowledgeCard';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import type { MasteryLevel } from '../utils/spacedRepetition';
import { isDue } from '../utils/spacedRepetition';

interface Props {
  mode?: 'sequential' | 'random' | 'daily' | 'wrong' | 'favorite';
  category?: string;
  onDone?: () => void;
}

export default function Study({ mode = 'daily', category, onDone }: Props) {
  const { entries, recordResult } = useProgressStore();
  const { dailyGoal } = useSettingsStore();

  const studyList = useMemo(() => {
    let list = [...knowledgePoints];

    if (mode === 'daily') {
      // 按间隔复习：筛选到期知识点
      list = list.filter(kp => {
        const entry = entries[kp.id];
        if (!entry) return true; // 从未学习过的
        return isDue(entry);
      });
    } else if (mode === 'wrong') {
      const wrongIds = useProgressStore.getState().wrongList;
      list = list.filter(kp => wrongIds.includes(kp.id));
    } else if (mode === 'favorite') {
      const favIds = useProgressStore.getState().favorites;
      list = list.filter(kp => favIds.includes(kp.id));
    } else if (category) {
      list = list.filter(kp => kp.category === category);
    }

    if (mode === 'random') {
      list = shuffleArray(list);
    }

    // 限制每日目标
    if (dailyGoal > 0 && mode === 'daily') {
      list = list.slice(0, dailyGoal);
    }

    return list;
  }, [mode, category, entries, dailyGoal]);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (studyList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {mode === 'daily' ? '今日复习已完成！' : '暂无知识点'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {mode === 'daily' ? '你已经完成了今天的复习计划，继续保持！' : '该分类下暂无可复习的内容'}
        </p>
        {onDone && (
          <button
            onClick={onDone}
            className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-medium active:scale-95 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            返回首页
          </button>
        )}
      </div>
    );
  }

  const currentKp = studyList[currentIndex];

  const handleRate = (level: MasteryLevel) => {
    recordResult(currentKp.id, level);
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 完成
      onDone?.();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < studyList.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goToRandom = () => {
    const next = Math.floor(Math.random() * studyList.length);
    setCurrentIndex(next);
  };

  if (!currentKp) return null;

  return (
    <div className="px-4 py-4 pb-24">
      <KnowledgeCard
        kp={currentKp}
        onRate={handleRate}
        onPrev={currentIndex > 0 ? goToPrev : undefined}
        onNext={currentIndex < studyList.length - 1 ? goToNext : undefined}
        onRandom={goToRandom}
        index={currentIndex}
        total={studyList.length}
      />
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
