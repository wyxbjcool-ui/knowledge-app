const COLORS: Record<string, string> = {
  '廉洁从业': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  '法治思想': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '五年规划与经济': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  '创新方法': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  '项目管理': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  '领导力': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '党史党建': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  '政绩观': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  '马克思主义': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  '中国特色社会主义': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '企业经营与财务': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  '石油精神': 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300',
  '能源与新能源': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
  '精益管理': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  '巡视监督': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  '焦裕禄精神': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '保密工作': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  '石油工程技术': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300',
  '综合': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

const DEFAULT = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';

interface Props {
  category: string;
  small?: boolean;
  onClick?: () => void;
}

export default function CategoryTag({ category, small = false, onClick }: Props) {
  const cls = COLORS[category] ?? DEFAULT;
  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full font-medium ${cls} ${small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${onClick ? 'cursor-pointer active:scale-95 transition-transform touch-manipulation' : ''}`}
    >
      {category}
    </span>
  );
}
