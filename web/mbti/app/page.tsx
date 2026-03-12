'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { mbtiTypes } from '@/data/mbti-types';
import { useTestStore } from '@/store/test-store';

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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-6">
        {/* 이어하기 배너 */}
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 px-4 py-3 border border-zinc-200 rounded-xl flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium text-zinc-900">이어서 테스트하기</p>
              <p className="text-xs text-zinc-500 mt-0.5">{currentQuestion - 1}/12 완료</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { resetTest(); setShowBanner(false); }}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                title="테스트 초기화"
              >
                <RotateCcw size={14} />
              </button>
              <Link
                href="/test"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-zinc-950 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                이어하기
              </Link>
            </div>
          </motion.div>
        )}

        {/* 히어로 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-20 pb-16"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-6">
            12개 질문 · 무료 · 1분 완성
          </p>
          <h1 className="text-6xl font-black tracking-tight text-zinc-950 leading-[1.05] mb-6">
            당신의<br />MBTI는?
          </h1>
          <p className="text-lg text-zinc-500 mb-8 max-w-sm leading-relaxed">
            12개의 핵심 질문으로 나만의 성격 유형을 발견해보세요.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/test"
              className="inline-flex items-center gap-2 text-base font-semibold text-white bg-zinc-950 px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors duration-150"
            >
              테스트 시작
              <ArrowRight size={16} />
            </Link>
            {totalCount !== null && (
              <p className="text-sm text-zinc-400">
                <span className="font-bold text-zinc-700">{totalCount.toLocaleString()}명</span> 참여
              </p>
            )}
          </div>
        </motion.section>

        {/* 구분선 */}
        <div className="border-t border-zinc-100" />

        {/* 16개 유형 */}
        <section className="py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-6">
            16가지 유형
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-4 gap-2"
          >
            {mbtiTypes.map((type) => (
              <Link key={type.code} href={`/result/${type.code}`}>
                <div
                  className="rounded-xl p-3 text-center cursor-pointer transition-opacity hover:opacity-80 active:opacity-60"
                  style={{ background: type.color.gradient }}
                >
                  <p className="text-sm font-black text-white">{type.code}</p>
                  <p className="text-[11px] text-white/80 mt-0.5 truncate">{type.nickname}</p>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* 그룹 범례 */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { label: '분석가', color: '#6366F1' },
              { label: '외교관', color: '#EC4899' },
              { label: '관리자', color: '#0EA5E9' },
              { label: '탐험가', color: '#10B981' },
            ].map((group) => (
              <div key={group.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs text-zinc-500">{group.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
