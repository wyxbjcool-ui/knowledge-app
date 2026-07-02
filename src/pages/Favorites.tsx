import { useState } from 'react';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import KnowledgeCard from '../components/KnowledgeCard';
import CategoryTag from '../components/CategoryTag';
import { Star, BookOpen } from 'lucide-react';
import type { MasteryLevel } from '../utils/spacedRepetition';

export default function Favorites() {
  const { favorites, toggleFavorite, recordResult } = useProgressStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState('');

  const favKPs = knowledgePoints.filter(kp => favorites.includes(kp.id));
  const filteredKPs = filterCat ? favKPs.filter(kp => kp.category === filterCat) : favKPs;

  const cats = [...new Set(favKPs.map(k => k.category))];

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <Star size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">收藏夹为空</h3>
        <p className="text-gray-500 dark:text-gray-400">背诵时点击星标即可收藏</p>
      </div>
    );
  }

  if (selectedId !== null) {
    const kp = knowledgePoints.find(k => k.id === selectedId);
    if (!kp) return null;

    const handleRate = (level: MasteryLevel) => {
      recordResult(kp.id, level);
    };

    return (
      <div className="px-4 py-4 pb-24">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 text-sm text-indigo-500 active:scale-95 touch-manipulation py-1"
        >
          ← 返回收藏列表
        </button>
        <KnowledgeCard kp={kp} onRate={handleRate} showActions={true} />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        我的收藏 ({favorites.length})
      </h2>

      {/* 分类筛选 */}
      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterCat('')}
            className={`text-xs px-3 py-1.5 rounded-full active:scale-95 touch-manipulation ${
              !filterCat
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            全部
          </button>
          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`text-xs px-3 py-1.5 rounded-full active:scale-95 touch-manipulation ${
                filterCat === cat
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filteredKPs.map(kp => (
          <div
            key={kp.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0" onClick={() => setSelectedId(kp.id)}>
                <CategoryTag category={kp.category} small />
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">
                  {kp.content}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setSelectedId(kp.id)} className="p-1.5 text-gray-400">
                  <BookOpen size={16} />
                </button>
                <button onClick={() => toggleFavorite(kp.id)} className="p-1.5 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
