import { Home, BookOpen, Library, AlertTriangle, Settings } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const tabs = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'study', label: '背题', icon: BookOpen },
  { key: 'library', label: '题库', icon: Library },
  { key: 'wrong', label: '错题', icon: AlertTriangle },
  { key: 'settings', label: '设置', icon: Settings },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe flex justify-around items-end"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            className={`flex flex-col items-center justify-center w-full py-2 min-h-[50px] transition-colors touch-manipulation ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[11px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
