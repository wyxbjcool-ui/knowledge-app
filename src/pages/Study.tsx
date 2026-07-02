import { useState, useMemo } from 'react';
import KnowledgeCard from '../components/KnowledgeCard';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import type { MasteryLevel } from '../utils/spacedRepetition';
import { isDue } from '../utils/spacedRepetition';
import { Star, Eye, EyeOff, Check, HelpCircle, X, Shuffle } from 'lucide-react';

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
      list = list.filter(kp => {
        const entry = entries[kp.id];
        if (!entry) return true;
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

    if (dailyGoal > 0 && mode === 'daily') {
      list = list.slice(0, dailyGoal);
    }

    return list;
  }, [mode, category, entries, dailyGoal]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContent, setShowContent] = useState(true);

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
  if (!currentKp) return null;

  const { isFavorite, toggleFavorite } = useProgressStore();
  const favorited = isFavorite(currentKp.id);

  const handleRate = (level: MasteryLevel) => {
    useProgressStore.getState().tickStudyDay();
    recordResult(currentKp.id, level);
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowContent(true);
    } else {
      onDone?.();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowContent(true);
    }
  };

  const goToNext = () => {
    if (currentIndex < studyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowContent(true);
    }
  };

  const goToRandom = () => {
    const next = Math.floor(Math.random() * studyList.length);
    setCurrentIndex(next);
    setShowContent(true);
  };

  return (
    <div className="h-full flex flex-col" style={{
      height: 'calc(100dvh - 48px - env(safe-area-inset-top, 0px) - 64px - env(safe-area-inset-bottom, 0px))',
    }}>
      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 no-scrollbar">
        <div className="animate-slide-in w-full max-w-lg mx-auto">
          {/* 进度条 */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / studyList.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
              {currentIndex + 1}/{studyList.length}
            </span>
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {currentKp.category}
            </span>
            <span className="text-xs text-gray-400">
              编号: {currentKp.originalNumbers.join(', ')}
            </span>
            {currentKp.note ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300" title={currentKp.note}>
                待核
              </span>
            ) : null}
          </div>

          {/* 卡片内容 */}
          <KnowledgeCard
            kp={currentKp}
            showContent={showContent}
            onToggleContent={() => setShowContent(!showContent)}
            showActions={false}
          />
        </div>
      </div>

      {/* 固定底部的操作栏 */}
      <div className="shrink-0 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-4 py-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
        <div className="w-full max-w-lg mx-auto space-y-2.5">
          {/* 收藏 + 显示/隐藏 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowContent(!showContent)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '44px', minWidth: '80px' }}
            >
              {showContent ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="text-sm">{showContent ? '隐藏' : '显示'}</span>
            </button>
            <button
              onClick={() => toggleFavorite(currentKp.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-transform touch-manipulation ${
                favorited
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-600'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
              }`}
              style={{ minHeight: '44px', minWidth: '80px' }}
            >
              <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
              <span className="text-sm">{favorited ? '已收藏' : '收藏'}</span>
            </button>
          </div>

          {/* 认识/模糊/不会 - 固定等宽 */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleRate('known')}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md shadow-green-500/20"
              style={{ minHeight: '48px', maxWidth: '120px' }}
            >
              <Check size={20} />
              <span className="font-semibold text-base">认识</span>
            </button>
            <button
              onClick={() => handleRate('fuzzy')}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-yellow-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md shadow-yellow-500/20"
              style={{ minHeight: '48px', maxWidth: '120px' }}
            >
              <HelpCircle size={20} />
              <span className="font-semibold text-base">模糊</span>
            </button>
            <button
              onClick={() => handleRate('unknown')}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md shadow-red-500/20"
              style={{ minHeight: '48px', maxWidth: '120px' }}
            >
              <X size={20} />
              <span className="font-semibold text-base">不会</span>
            </button>
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex-1 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium active:scale-95 transition-transform touch-manipulation disabled:opacity-30"
              style={{ minHeight: '44px', maxWidth: '110px' }}
            >
              上一题
            </button>
            <button
              onClick={goToRandom}
              className="flex-1 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '44px', maxWidth: '110px' }}
            >
              <Shuffle size={16} className="inline mr-1" />
              随机
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex >= studyList.length - 1}
              className="flex-1 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium active:scale-95 transition-transform touch-manipulation disabled:opacity-30"
              style={{ minHeight: '44px', maxWidth: '110px' }}
            >
              下一题
            </button>
          </div>
        </div>
      </div>
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
