import { BookOpen, Shuffle, AlertTriangle, Star, FolderOpen, Flame, CheckCircle, Clock, BookMarked } from 'lucide-react';
import { useProgressStore } from '../store/progressStore';
import { knowledgePoints } from '../data/knowledgePoints';

interface Props {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: Props) {
  const { todayReviewed, masteredCount, pendingCount, streak, wrongCount } = useProgressStore();
  const totalCount = knowledgePoints.length;
  const toReview = pendingCount();

  const stats = [
    { icon: BookOpen, label: '知识总数', value: totalCount, color: 'text-indigo-500' },
    { icon: CheckCircle, label: '今日已复习', value: todayReviewed(), color: 'text-green-500' },
    { icon: BookMarked, label: '已掌握', value: masteredCount(), color: 'text-blue-500' },
    { icon: Clock, label: '待复习', value: toReview, color: 'text-orange-500' },
  ];

  const cards = [
    { key: 'study', icon: BookOpen, title: '开始背题', desc: '按计划逐条背诵知识点', color: 'from-indigo-500 to-blue-500' },
    { key: 'randomStudy', icon: Shuffle, title: '随机复习', desc: '随机抽取知识点复习', color: 'from-purple-500 to-pink-500' },
    { key: 'wrongStudy', icon: AlertTriangle, title: '错题重练', desc: `共 ${wrongCount()} 题待重练`, color: 'from-red-500 to-orange-500' },
    { key: 'favorites', icon: Star, title: '我的收藏', desc: '查看收藏的重点知识', color: 'from-yellow-500 to-amber-500' },
    { key: 'categoryStudy', icon: FolderOpen, title: '分类学习', desc: '按分类浏览和学习', color: 'from-green-500 to-teal-500' },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 连续学习天数 */}
      {streak > 0 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <Flame size={20} className="text-orange-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            已连续学习 <strong className="text-orange-500">{streak}</strong> 天
          </span>
        </div>
      )}

      {/* 统计数据 */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <s.icon size={20} className={`mx-auto mb-1 ${s.color}`} />
            <div className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 功能入口 */}
      <div className="space-y-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${card.color} text-white shadow-lg active:scale-[0.98] transition-transform touch-manipulation`}
              style={{ minHeight: '56px' }}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base">{card.title}</div>
                <div className="text-xs opacity-80">{card.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('fillBlank')}
          className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium active:scale-95 transition-transform touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          📝 填空题模式
        </button>
        <button
          onClick={() => onNavigate('choice')}
          className="flex-1 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium active:scale-95 transition-transform touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          🎯 选择题模式
        </button>
      </div>
    </div>
  );
}
