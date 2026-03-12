'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from '@/components/test/question-card';
import { questions } from '@/data/questions';
import { useTestStore } from '@/store/test-store';
import { calculateMbti } from '@/lib/mbti-calculator';

type Direction = 'left' | 'right';

const slideVariants = {
  enter: (dir: Direction) => ({
    x: dir === 'left' ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Direction) => ({
    x: dir === 'left' ? -40 : 40,
    opacity: 0,
  }),
};

const axisLabel: Record<string, string> = {
  EI: '에너지 방향',
  SN: '인식 기능',
  TF: '판단 기능',
  JP: '생활 양식',
};

export default function TestPage() {
  const router = useRouter();
  const { answers, currentQuestion, setAnswer, setCurrentQuestion, setResult, resetTest } =
    useTestStore();

  const [direction, setDirection] = useState<Direction>('left');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const question = questions[currentQuestion - 1];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion - 1) / totalQuestions) * 100;

  useEffect(() => {
    setSelectedOption(answers[currentQuestion] ?? null);
  }, [currentQuestion, answers]);

  const handleSelect = async (option: 'A' | 'B') => {
    if (selectedOption) return;

    setSelectedOption(option);
    setAnswer(currentQuestion, option);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentQuestion < totalQuestions) {
      setDirection('left');
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsLoading(true);

      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 15 + 5;
        if (prog >= 95) { prog = 95; clearInterval(interval); }
        setLoadingProgress(prog);
      }, 100);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearInterval(interval);
      setLoadingProgress(100);

      const finalAnswers = { ...answers, [currentQuestion]: option };
      const result = calculateMbti(finalAnswers);
      setResult(result);

      fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: result.type, percentages: result.percentages }),
      }).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push(`/result/${result.type}`);
    }
  };

  const handleBack = () => {
    if (currentQuestion === 1) router.push('/');
    else {
      setDirection('right');
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-4">분석 중</p>
          <h2 className="text-4xl font-black text-zinc-950 mb-10 leading-tight">
            당신의 유형을<br />파악하고 있어요
          </h2>
          <div className="h-px bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-zinc-950 rounded-full"
            />
          </div>
          <p className="text-xs text-zinc-400 mt-3">{Math.round(loadingProgress)}%</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">뒤로</span>
            </button>
            <span className="text-sm font-semibold text-zinc-950">
              {currentQuestion}
              <span className="text-zinc-300 font-normal"> / {totalQuestions}</span>
            </span>
            <button
              onClick={() => {
                if (confirm('처음부터 다시 시작할까요?')) {
                  resetTest();
                  router.push('/');
                }
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              처음으로
            </button>
          </div>
          <Progress
            value={progress}
            className="h-px bg-zinc-100 rounded-none"
            indicatorClassName="bg-zinc-950 rounded-none transition-all duration-300"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* 질문 */}
            <div className="mb-10">
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-4">
                {axisLabel[question.axis]}
              </p>
              <h2 className="text-3xl font-black text-zinc-950 leading-tight">
                {question.text}
              </h2>
            </div>

            {/* 선택지 */}
            <div className="space-y-3">
              <QuestionCard
                option={question.optionA}
                label="A"
                selected={selectedOption === 'A'}
                onClick={() => handleSelect('A')}
              />
              <QuestionCard
                option={question.optionB}
                label="B"
                selected={selectedOption === 'B'}
                onClick={() => handleSelect('B')}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
