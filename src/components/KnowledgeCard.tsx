import type { KnowledgePoint } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { useSettingsStore } from '../store/settingsStore';
import type { MasteryLevel } from '../utils/spacedRepetition';
import { Star, Eye, EyeOff, Check, HelpCircle, X } from 'lucide-react';

interface Props {
  kp: KnowledgePoint;
  showContent?: boolean;
  onToggleContent?: () => void;
  showActions?: boolean;
  onRate?: (level: MasteryLevel) => void;
}

export default function KnowledgeCard({ kp, showContent = true, onToggleContent, showActions = false, onRate }: Props) {
  const { fontSize } = useSettingsStore();
  const { isFavorite, toggleFavorite } = useProgressStore();
  const favorited = isFavorite(kp.id);

  const handleRate = (level: MasteryLevel) => {
    useProgressStore.getState().tickStudyDay();
    onRate?.(level);
  };

  return (
    <div className="w-full">
      {/* 卡片主体 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
        <div
          className={`whitespace-pre-wrap break-words leading-relaxed text-gray-900 dark:text-gray-100 ${onToggleContent ? 'cursor-pointer select-none' : ''}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
          onClick={onToggleContent}
        >
          {showContent ? (
            kp.content
          ) : (
            <span className="text-gray-400 dark:text-gray-500 italic">
              点击显示内容
            </span>
          )}
        </div>
      </div>

      {/* 内联操作按钮（仅用于非Study场景，如错题本详情页） */}
      {showActions && (
        <div className="mt-3 space-y-2.5">
          <div className="flex justify-center gap-3">
            {onToggleContent && (
              <button
                onClick={onToggleContent}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                {showContent ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="text-sm">{showContent ? '隐藏' : '显示'}</span>
              </button>
            )}
            <button
              onClick={() => toggleFavorite(kp.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl active:scale-95 transition-transform touch-manipulation ${
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

          {onRate && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleRate('known')}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md"
                style={{ minHeight: '48px', maxWidth: '120px' }}
              >
                <Check size={20} />
                <span className="font-semibold">认识</span>
              </button>
              <button
                onClick={() => handleRate('fuzzy')}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-yellow-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md"
                style={{ minHeight: '48px', maxWidth: '120px' }}
              >
                <HelpCircle size={20} />
                <span className="font-semibold">模糊</span>
              </button>
              <button
                onClick={() => handleRate('unknown')}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-500 text-white active:scale-95 transition-transform touch-manipulation shadow-md"
                style={{ minHeight: '48px', maxWidth: '120px' }}
              >
                <X size={20} />
                <span className="font-semibold">不会</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
