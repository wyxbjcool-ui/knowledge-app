import { useState } from 'react';
import { useSettingsStore, type DailyGoal, type StudyMode } from '../store/settingsStore';
import { useProgressStore } from '../store/progressStore';
import { Download, Upload, RotateCcw, FileText, Moon, Sun, Monitor } from 'lucide-react';

export default function Settings() {
  const { fontSize, setFontSize, dailyGoal, setDailyGoal, studyMode, setStudyMode, darkMode, setDarkMode } = useSettingsStore();
  const { resetProgress, exportData, importData } = useProgressStore();
  const [showReset, setShowReset] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [exportStr, setExportStr] = useState('');

  const handleExport = () => {
    const data = exportData();
    setExportStr(data);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const result = importData(text);
        setImportMsg(result.message);
        setTimeout(() => setImportMsg(''), 3000);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportStr).then(() => {
      setImportMsg('已复制到剪贴板');
      setTimeout(() => setImportMsg(''), 2000);
    }).catch(() => {
      // Fallback for non-HTTPS
      setImportMsg('复制失败，请手动选择复制');
    });
  };

  return (
    <div className="px-4 py-6 pb-32 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">设置</h2>

      {/* 字号 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-200">字号大小</span>
          </div>
          <span className="text-sm font-semibold text-indigo-500">{fontSize}px</span>
        </div>
        <input
          type="range"
          min="14"
          max="28"
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* 每日复习量 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm text-gray-700 dark:text-gray-200 mb-3">每日复习数量</h3>
        <div className="flex flex-wrap gap-2">
          {([10, 20, 30, 50, 0] as DailyGoal[]).map(n => (
            <button
              key={n}
              onClick={() => setDailyGoal(n)}
              className={`px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-all touch-manipulation ${
                dailyGoal === n
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              {n === 0 ? '全部' : `${n}条`}
            </button>
          ))}
        </div>
      </div>

      {/* 背诵模式 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm text-gray-700 dark:text-gray-200 mb-3">默认背诵模式</h3>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'sequential', label: '顺序背诵' },
            { key: 'random', label: '随机背诵' },
            { key: 'byCategory', label: '按分类背诵' },
          ] as { key: StudyMode; label: string }[]).map(m => (
            <button
              key={m.key}
              onClick={() => setStudyMode(m.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-all touch-manipulation ${
                studyMode === m.key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 深色模式 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm text-gray-700 dark:text-gray-200 mb-3">深色模式</h3>
        <div className="flex gap-2">
          {([
            { key: 'auto', label: '跟随系统', icon: Monitor },
            { key: 'light', label: '浅色', icon: Sun },
            { key: 'dark', label: '深色', icon: Moon },
          ] as const).map(m => (
            <button
              key={m.key}
              onClick={() => setDarkMode(m.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-all touch-manipulation ${
                darkMode === m.key
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              style={{ minHeight: '44px' }}
            >
              <m.icon size={16} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <h3 className="text-sm text-gray-700 dark:text-gray-200 mb-1">数据管理</h3>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 py-3 text-sm text-gray-700 dark:text-gray-200 active:scale-[0.98] touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          <Download size={18} className="text-green-500" />
          导出学习记录 (JSON)
        </button>

        {exportStr && (
          <div className="space-y-2">
            <textarea
              readOnly
              value={exportStr}
              className="w-full h-32 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 font-mono resize-none"
            />
            <button
              onClick={handleCopyExport}
              className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 active:scale-95 touch-manipulation"
            >
              复制导出数据
            </button>
          </div>
        )}

        <button
          onClick={handleImport}
          className="w-full flex items-center gap-3 py-3 text-sm text-gray-700 dark:text-gray-200 active:scale-[0.98] touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          <Upload size={18} className="text-blue-500" />
          从文件导入学习记录
        </button>

        {importMsg && (
          <div className="text-sm text-center p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            {importMsg}
          </div>
        )}

        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-3 py-3 text-sm text-red-500 active:scale-[0.98] touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <RotateCcw size={18} />
            重置所有学习进度
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-500 text-center">确认重置？此操作不可恢复！</p>
            <div className="flex gap-3">
              <button
                onClick={() => { resetProgress(); setShowReset(false); setImportMsg('已重置所有学习进度'); setTimeout(() => setImportMsg(''), 2000); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium active:scale-95 touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                确认重置
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium active:scale-95 touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 关于 */}
      <div className="text-center text-xs text-gray-400 pb-8">
        <p>知识点背诵 v1.0</p>
        <p>数据仅保存在本机，不上传服务器</p>
      </div>
    </div>
  );
}
