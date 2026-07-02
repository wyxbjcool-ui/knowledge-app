import { useState } from 'react';
import type { KnowledgePoint } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import type { MasteryLevel } from '../utils/spacedRepetition';
import { Star, Eye, EyeOff, Check, HelpCircle, X } from 'lucide-react';

interface Props {
  kp: KnowledgePoint;
  onRate?: (level: MasteryLevel) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onRandom?: () => void;
  showActions?: boolean;
  index?: number;
  total?: number;
}

export default function KnowledgeCard({ kp, onRate, onPrev, onNext, onRandom, showActions = true, index, total }: Props) {
  const [showContent, setShowContent] = useState(useSettingsStore.getState().showContent);
  const { fontSize } = useSettingsStore();
  const { isFavorite, toggleFavorite } = useProgressStore();
  const favorited = isFavorite(kp.id);

  const handleRate = (level: MasteryLevel) => {
    useProgressStore.getState().tickStudyDay();
    onRate?.(level);
  };

  return (
    <div className="animate-slide-in w-full max-w-lg mx-auto">
      {/* 进度条 */}
      {index !== undefined && total !== undefined && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
            {index + 1}/{total}
          </span>
        </div>
      )}

      {/* 分类标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
          {kp.category}
        </span>
        <span className="text-xs text-gray-400">
          编号: {kp.originalNumbers.join(', ')}
        </span>
        {kp.note && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300" title={kp.note}>
            待核
          </span>
        )}
      </div>

      {/* 卡片主体 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-4">
        {/* 正文 - 可切换显示/隐藏 */}
        <div
          className="relative cursor-pointer select-none"
          onClick={() => setShowContent(!showContent)}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {showContent ? (
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
              {kp.content}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <EyeOff size={32} />
              <span className="mt-2">点击显示答案</span>
            </div>
          )}
        </div>

        {/* 关键词 */}
        {showContent && kp.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {kp.keywords.map((kw, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 操作区域 */}
      {showActions && (
        <div className="space-y-3">
          {/* 收藏 + 显示/隐藏 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowContent(!showContent)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              {showContent ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="text-sm">{showContent ? '隐藏' : '显示'}</span>
            </button>
            <button
              onClick={() => toggleFavorite(kp.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl active:scale-95 transition-transform touch-manipulation ${
                favorited
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              <Star size={18} fill={favorited ? 'currentColor' : 'none'} />
              <span className="text-sm">{favorited ? '已收藏' : '收藏'}</span>
            </button>
          </div>

          {/* 认识/模糊/不会 */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleRate('known')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-green-500 text-white active:scale-95 transition-transform touch-manipulation shadow-lg shadow-green-500/25"
              style={{ minHeight: '48px' }}
            >
              <Check size={18} />
              <span className="font-medium">认识</span>
            </button>
            <button
              onClick={() => handleRate('fuzzy')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-yellow-500 text-white active:scale-95 transition-transform touch-manipulation shadow-lg shadow-yellow-500/25"
              style={{ minHeight: '48px' }}
            >
              <HelpCircle size={18} />
              <span className="font-medium">模糊</span>
            </button>
            <button
              onClick={() => handleRate('unknown')}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-red-500 text-white active:scale-95 transition-transform touch-manipulation shadow-lg shadow-red-500/25"
              style={{ minHeight: '48px' }}
            >
              <X size={18} />
              <span className="font-medium">不会</span>
            </button>
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-center gap-4">
            {onPrev && (
              <button
                onClick={onPrev}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                上一题
              </button>
            )}
            {onRandom && (
              <button
                onClick={onRandom}
                className="px-5 py-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                随机题
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                下一题
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
