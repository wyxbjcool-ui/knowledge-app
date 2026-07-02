import { useState, useMemo, useCallback } from 'react';
import { Check, X as XIcon, RefreshCw } from 'lucide-react';
import { knowledgePoints } from '../data/knowledgePoints';
import { useProgressStore } from '../store/progressStore';
import { generateChoiceQuestion, type ChoiceQuestion } from '../utils/quizGenerator';

export default function ChoicePage() {
  const { addToWrongList, tickStudyDay } = useProgressStore();
  const [questions, setQuestions] = useState<ChoiceQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 });

  const generateQuestions = useCallback(() => {
    const kps = shuffleArray([...knowledgePoints]);
    const qs: ChoiceQuestion[] = [];
    for (const kp of kps) {
      if (qs.length >= 20) break;
      const q = generateChoiceQuestion(kp);
      if (q) qs.push(q);
    }
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore({ correct: 0, wrong: 0, total: 0 });
  }, []);

  useMemo(() => {
    if (questions.length === 0) generateQuestions();
  }, [generateQuestions]);

  const current = questions[currentIdx];
  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 dark:text-gray-400 mb-4">正在生成题目...</p>
        <button
          onClick={generateQuestions}
          className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-medium active:scale-95 touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          重新生成
        </button>
      </div>
    );
  }

  const isCorrect = selectedIdx === current.correctIndex;

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    tickStudyDay();

    const correct = idx === current.correctIndex;
    setScore(s => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
      total: s.total + 1,
    }));

    if (!correct) {
      addToWrongList(current.knowledgePointId);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIdx(null);
    }
  };

  const correctKP = knowledgePoints.find(k => k.id === current.knowledgePointId);

  return (
    <div className="h-full flex flex-col" style={{
      height: 'calc(100dvh - 48px - env(safe-area-inset-top, 0px))',
    }}>
      {/* 固定顶栏 */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-gray-50/90 dark:bg-gray-950/90 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-500">
          {currentIdx + 1} / {questions.length}
        </span>
        <span className="text-sm">
          正确: <span className="text-green-500 font-semibold">{score.correct}</span>
          {' '}错误: <span className="text-red-500 font-semibold">{score.wrong}</span>
        </span>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="animate-slide-in w-full max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 mb-3 inline-block">
              {current.category}
            </span>

            <p className="text-lg text-gray-900 dark:text-gray-100 font-medium leading-relaxed mb-5">
              {current.question}
            </p>

            <div className="space-y-2.5">
              {current.options.map((opt, idx) => {
                let btnClass = 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200';

                if (selectedIdx !== null) {
                  if (idx === current.correctIndex) {
                    btnClass = 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-700 dark:text-green-300';
                  } else if (idx === selectedIdx && !isCorrect) {
                    btnClass = 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-700 dark:text-red-300';
                  } else {
                    btnClass = 'opacity-50 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600';
                  }
                }

                const prefix = ['A', 'B', 'C', 'D'][idx];

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedIdx !== null}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all active:scale-[0.98] touch-manipulation ${btnClass}`}
                    style={{ minHeight: '48px' }}
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center text-sm font-bold">
                      {prefix}
                    </span>
                    <span className="text-sm leading-relaxed flex-1">{opt}</span>
                    {selectedIdx !== null && idx === current.correctIndex && (
                      <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                    )}
                    {selectedIdx !== null && idx === selectedIdx && !isCorrect && (
                      <XIcon size={20} className="text-red-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && correctKP && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className={`text-base font-semibold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                  {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">原知识点：</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                    {correctKP.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 固定底部操作栏 */}
      <div className="shrink-0 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-4 py-3"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
        <div className="w-full max-w-lg mx-auto space-y-2.5">
          {selectedIdx !== null && (
            <>
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-indigo-500 text-white font-medium active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '48px' }}
              >
                {currentIdx < questions.length - 1 ? '下一题' : '完成'}
              </button>
              {currentIdx >= questions.length - 1 && (
                <button
                  onClick={generateQuestions}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium active:scale-95 touch-manipulation"
                  style={{ minHeight: '48px' }}
                >
                  <RefreshCw size={18} /> 再来一轮
                </button>
              )}
            </>
          )}
        </div>
      </div>
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
