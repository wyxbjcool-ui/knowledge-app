import { useState, useMemo, useRef } from 'react';
import { ArrowRight, Check, X as XIcon, RefreshCw } from 'lucide-react';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { generateFillBlank, type FillBlankQuestion } from '../utils/fillBlankGenerator';
import { fuzzyMatch } from '../utils/matching';

export default function FillBlankPage() {
  const { addToWrongList, tickStudyDay } = useProgressStore();
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const generateQuestions = () => {
    const kps = shuffleArray([...knowledgePoints]);
    const qs: FillBlankQuestion[] = [];
    for (const kp of kps) {
      if (qs.length >= 20) break;
      const q = generateFillBlank(kp);
      if (q) qs.push(q);
    }
    setQuestions(qs);
    setCurrentIdx(0);
    setUserAnswer('');
    setResult(null);
    setScore({ correct: 0, wrong: 0, total: 0 });
  };

  useMemo(() => {
    if (questions.length === 0) generateQuestions();
  }, []);

  const current = questions[currentIdx];

  const handleSubmit = () => {
    if (!current || result !== null) return;
    tickStudyDay();

    const isCorrect = fuzzyMatch(userAnswer, current.answers);
    setResult(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({
      ...s,
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));

    if (!isCorrect) {
      addToWrongList(current.knowledgePointId);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      setResult(null);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && result === null) {
      handleSubmit();
    } else if (e.key === 'Enter' && result !== null) {
      handleNext();
    }
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 mb-4">正在生成题目...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* 进度与分数 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {questions.length}
        </span>
        <span className="text-sm">
          正确: <span className="text-green-500 font-semibold">{score.correct}</span>
          {' '}错误: <span className="text-red-500 font-semibold">{score.wrong}</span>
        </span>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-4 animate-slide-in">
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mb-3 inline-block">
          {current.category}
        </span>

        <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words mb-6">
          {current.question}
        </p>

        {/* 输入框 */}
        {result === null && (
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的答案..."
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white font-medium disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '48px' }}
            >
              确认答案 <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* 结果展示 */}
        {result !== null && (
          <div className="space-y-4">
            <div className={`flex items-center gap-2 text-lg font-semibold ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {result === 'correct' ? <Check size={24} /> : <XIcon size={24} />}
              {result === 'correct' ? '回答正确！' : '回答错误'}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">正确答案：</p>
              <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                {current.answers.join(' / ')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">原始知识点：</p>
              <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                {current.originalContent}
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium active:scale-95 transition-transform touch-manipulation"
              style={{ minHeight: '48px' }}
            >
              {currentIdx < questions.length - 1 ? '下一题' : '完成'}
            </button>
          </div>
        )}
      </div>

      {/* 重新生成 */}
      {result !== null && currentIdx >= questions.length - 1 && (
        <button
          onClick={generateQuestions}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium active:scale-95 touch-manipulation"
          style={{ minHeight: '48px' }}
        >
          <RefreshCw size={18} /> 再来一轮
        </button>
      )}
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
