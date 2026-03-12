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
    x: dir === 'left' ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Direction) => ({
    x: dir === 'left' ? -300 : 300,
    opacity: 0,
  }),
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
      // 마지막 질문 완료 → 결과 계산
      setIsLoading(true);

      // 가짜 로딩 애니메이션
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 15 + 5;
        if (prog >= 95) {
          prog = 95;
          clearInterval(interval);
        }
        setLoadingProgress(prog);
      }, 100);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearInterval(interval);
      setLoadingProgress(100);

      const finalAnswers = { ...answers, [currentQuestion]: option };
      const result = calculateMbti(finalAnswers);
      setResult(result);

      // 결과 저장 (mock API)
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
    if (currentQuestion === 1) {
      router.push('/');
    } else {
      setDirection('right');
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결과 분석 중...</h2>
          <p className="text-gray-500 mb-8">당신의 성격 유형을 파악하고 있어요</p>
          <Progress value={loadingProgress} className="h-3" />
          <p className="text-sm text-gray-400 mt-3">{Math.round(loadingProgress)}%</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors p-1 -ml-1"
            >
              <ChevronLeft size={20} />
              <span className="text-sm">뒤로</span>
            </button>
            <span className="text-sm font-semibold text-gray-600">
              {currentQuestion}
              <span className="text-gray-400">/{totalQuestions}</span>
            </span>
            <button
              onClick={() => {
                if (confirm('테스트를 처음부터 다시 시작할까요?')) {
                  resetTest();
                  router.push('/');
                }
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              처음으로
            </button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* 질문 */}
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                {question.axis === 'EI'
                  ? '에너지 방향'
                  : question.axis === 'SN'
                  ? '인식 기능'
                  : question.axis === 'TF'
                  ? '판단 기능'
                  : '생활 양식'}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{question.text}</h2>
            </div>

            {/* 선택지 */}
            <div className="space-y-4">
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
