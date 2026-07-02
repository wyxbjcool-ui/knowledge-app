import { useState, useMemo } from 'react';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import SearchBar from '../components/SearchBar';
import CategoryTag from '../components/CategoryTag';
import { BookOpen } from 'lucide-react';
import KnowledgeCard from '../components/KnowledgeCard';

type Filter = 'all' | 'unlearned' | 'fuzzy' | 'unknown' | 'mastered' | 'favorite' | 'wrong';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unlearned', label: '未学习' },
  { key: 'fuzzy', label: '模糊' },
  { key: 'unknown', label: '不会' },
  { key: 'mastered', label: '已掌握' },
  { key: 'favorite', label: '收藏' },
  { key: 'wrong', label: '错题' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { entries, favorites, wrongList } = useProgressStore();

  const results = useMemo(() => {
    let list = knowledgePoints;

    // 文本搜索
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(kp =>
        kp.content.toLowerCase().includes(q) ||
        kp.originalNumbers.some(n => String(n).includes(q)) ||
        kp.category.includes(q) ||
        kp.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    // 筛选
    switch (filter) {
      case 'unlearned':
        list = list.filter(kp => !entries[kp.id] || entries[kp.id].seenCount === 0);
        break;
      case 'fuzzy':
        list = list.filter(kp => entries[kp.id]?.masteryLevel === 'fuzzy');
        break;
      case 'unknown':
        list = list.filter(kp => entries[kp.id]?.masteryLevel === 'unknown');
        break;
      case 'mastered':
        list = list.filter(kp => entries[kp.id]?.masteryLevel === 'known');
        break;
      case 'favorite':
        list = list.filter(kp => favorites.includes(kp.id));
        break;
      case 'wrong':
        list = list.filter(kp => wrongList.includes(kp.id));
        break;
    }

    return list;
  }, [query, filter, entries, favorites, wrongList]);

  if (selectedId !== null) {
    const kp = knowledgePoints.find(k => k.id === selectedId);
    if (!kp) return null;
    return (
      <div className="px-4 py-4 pb-24">
        <button
          onClick={() => setSelectedId(null)}
          className="mb-3 text-sm text-indigo-500 active:scale-95 touch-manipulation py-1"
        >
          ← 返回搜索结果
        </button>
        <KnowledgeCard kp={kp} showActions={false} />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        题库搜索
      </h2>

      <div className="mb-3">
        <SearchBar onSearch={setQuery} placeholder="搜索编号、关键词、分类..." />
      </div>

      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(filter === f.key ? 'all' : f.key)}
            className={`text-xs px-3 py-1.5 rounded-full active:scale-95 transition-all touch-manipulation ${
              filter === f.key
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 结果 */}
      <p className="text-xs text-gray-400 mb-2">
        {results.length} 条结果
      </p>

      <div className="space-y-2">
        {results.map(kp => {
          const entry = entries[kp.id];
          return (
            <button
              key={kp.id}
              onClick={() => setSelectedId(kp.id)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform touch-manipulation"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">#{kp.originalNumbers.join(', ')}</span>
                  <CategoryTag category={kp.category} small />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {entry && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      entry.masteryLevel === 'known' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      entry.masteryLevel === 'fuzzy' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {entry.masteryLevel === 'known' ? '已掌握' : entry.masteryLevel === 'fuzzy' ? '模糊' : '不会'}
                    </span>
                  )}
                  <BookOpen size={14} className="text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {kp.content}
              </p>
            </button>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>未找到匹配的知识点</p>
        </div>
      )}
    </div>
  );
}
