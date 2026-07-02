import { categories } from '../data/knowledgePoints';
import CategoryTag from '../components/CategoryTag';
import { FolderOpen } from 'lucide-react';

interface Props {
  onNavigate: (page: string) => void;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryStudy({ onNavigate, onSelectCategory }: Props) {
  const handleCategory = (cat: string) => {
    onSelectCategory(cat);
    onNavigate('studyByCategory');
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        分类学习
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform touch-manipulation"
            style={{ minHeight: '56px' }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <FolderOpen size={18} className="text-indigo-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{cat}</div>
              <CategoryTag category={cat} small />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
