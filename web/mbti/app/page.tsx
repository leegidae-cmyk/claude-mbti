'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { mbtiTypes } from '@/data/mbti-types';
import { useTestStore } from '@/store/test-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomePage() {
  const { hasProgress, currentQuestion, resetTest } = useTestStore();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(hasProgress() && currentQuestion > 1);
  }, [hasProgress, currentQuestion]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setTotalCount(data.total))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-10">
        {/* 이어하기 배너 */}
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-semibold text-indigo-800">이어서 테스트하기</p>
              <p className="text-xs text-indigo-600 mt-0.5">
                {currentQuestion - 1}/12 완료 · 중단된 테스트가 있어요
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  resetTest();
                  setShowBanner(false);
                }}
                className="p-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                title="테스트 초기화"
              >
                <RotateCcw size={16} />
              </button>
              <Link href="/test">
                <Button size="sm">이어하기</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* 히어로 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4 tracking-wide">
            12개 질문 · 무료 · 1분 완성
          </span>
          <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight">
            당신의 MBTI는?
          </h1>
          <p className="text-base text-gray-500 mb-6 leading-relaxed">
            12개의 핵심 질문으로 나만의 성격 유형을 발견해보세요.
            <br />
            당신은 16가지 유형 중 어디에 속할까요?
          </p>

          {totalCount !== null && (
            <p className="text-sm text-gray-400 mb-6">
              지금까지{' '}
              <span className="font-bold text-indigo-600">
                {totalCount.toLocaleString()}명
              </span>
              이 참여했어요
            </p>
          )}

          <Link href="/test">
            <Button size="lg" className="gap-2 text-base px-8">
              테스트 시작하기
              <ArrowRight size={18} />
            </Button>
          </Link>
        </motion.div>

        {/* 16개 유형 그리드 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-2"
        >
          {mbtiTypes.map((type) => (
            <motion.div key={type.code} variants={itemVariants}>
              <Link href={`/result/${type.code}`}>
                <div
                  className="rounded-2xl p-3 text-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  style={{ background: type.color.gradient }}
                >
                  <p className="text-base font-black text-white">{type.code}</p>
                  <p className="text-xs text-white/80 mt-0.5 truncate">{type.nickname}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 그룹 범례 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 grid grid-cols-2 gap-2"
        >
          {[
            { label: '분석가', color: '#6366F1', types: 'INTJ INTP ENTJ ENTP' },
            { label: '외교관', color: '#EC4899', types: 'INFJ INFP ENFJ ENFP' },
            { label: '관리자', color: '#0EA5E9', types: 'ISTJ ISFJ ESTJ ESFJ' },
            { label: '탐험가', color: '#10B981', types: 'ISTP ISFP ESTP ESFP' },
          ].map((group) => (
            <div key={group.label} className="flex items-center gap-2 text-xs text-gray-500">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span className="font-medium text-gray-700">{group.label}</span>
              <span className="text-gray-400 hidden sm:inline">{group.types}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
