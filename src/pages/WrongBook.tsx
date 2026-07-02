import { useState } from 'react';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { Trash2, BookOpen, Check } from 'lucide-react';
import KnowledgeCard from '../components/KnowledgeCard';
import type { MasteryLevel } from '../utils/spacedRepetition';

export default function WrongBook() {
  const { wrongList, removeFromWrongList, clearWrongList, recordResult, entries } = useProgressStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const wrongKPs = knowledgePoints.filter(kp => wrongList.includes(kp.id));

  if (showConfirmClear) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          确认清空所有错题？
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          此操作不可恢复。已掌握的错题也会被清空。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { clearWrongList(); setShowConfirmClear(false); }}
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-medium active:scale-95 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            确认清空
          </button>
          <button
            onClick={() => setShowConfirmClear(false)}
            className="px-6 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium active:scale-95 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  if (wrongKPs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">错题本为空</h3>
        <p className="text-gray-500 dark:text-gray-400">做错的题目会自动加入错题本</p>
      </div>
    );
  }

  if (selectedId !== null) {
    const kp = knowledgePoints.find(k => k.id === selectedId);
    if (!kp) return null;

    const handleRate = (level: MasteryLevel) => {
      recordResult(kp.id, level);
      if (level === 'known') {
        removeFromWrongList(kp.id);
      }
      setSelectedId(null);
    };

    return (
      <div className="px-4 py-4 pb-24">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 text-sm text-indigo-500 active:scale-95 touch-manipulation py-1"
        >
          ← 返回错题列表
        </button>
        <KnowledgeCard kp={kp} onRate={handleRate} showActions={true} />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          错题本 ({wrongKPs.length})
        </h2>
        <button
          onClick={() => setShowConfirmClear(true)}
          className="flex items-center gap-1 text-sm text-red-500 active:scale-95 touch-manipulation py-1.5 px-3"
        >
          <Trash2 size={16} />
          清空
        </button>
      </div>

      <div className="space-y-2">
        {wrongKPs.map(kp => {
          const entry = entries[kp.id];
          return (
            <div
              key={kp.id}
              onClick={() => setSelectedId(kp.id)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      {kp.category}
                    </span>
                    {entry?.masteryLevel === 'known' && (
                      <Check size={14} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {kp.content}
                  </p>
                </div>
                <BookOpen size={16} className="text-gray-400 shrink-0 mt-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
