'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Share2, RotateCcw, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/header';
import { ResultCard } from '@/components/result/result-card';
import { ShareSheet } from '@/components/result/share-sheet';
import { mbtiTypeMap } from '@/data/mbti-types';
import { useTestStore } from '@/store/test-store';
import { MbtiCode, MbtiResult } from '@/types/mbti';

const VALID_TYPES: MbtiCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export function ResultPageClient({ type: rawType }: { type: string }) {
  const router = useRouter();
  const { result, resetTest } = useTestStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const typeCode = rawType.toUpperCase() as MbtiCode;
  const isValid = VALID_TYPES.includes(typeCode);

  useEffect(() => {
    if (!isValid) router.push('/');
  }, [isValid, router]);

  if (!isValid) return null;

  const typeData = mbtiTypeMap[typeCode];

  const displayResult: MbtiResult = result?.type === typeCode
    ? result
    : {
        type: typeCode,
        scores: { E: 2, I: 1, S: 2, N: 1, T: 2, F: 1, J: 2, P: 1 },
        percentages: { E: 67, S: 67, T: 67, J: 67 },
      };

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      const { toPng } = await import('html-to-image');
      const element = document.getElementById('result-card');
      if (!element) throw new Error('Element not found');

      const dataUrl = await toPng(element, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement('a');
      link.download = `typefinder-${typeCode}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('이미지가 저장되었습니다!');
    } catch {
      toast.error('이미지 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    resetTest();
    router.push('/test');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-8 pb-20">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-950 transition-colors mb-8"
        >
          <ChevronLeft size={15} />
          홈으로
        </Link>

        {/* 결과 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ResultCard typeData={typeData} result={displayResult} />
        </motion.div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-40"
          >
            <Download size={15} />
            {saving ? '저장 중...' : '이미지 저장'}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            <Share2 size={15} />
            공유하기
          </button>
        </div>

        {/* 상세 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 space-y-0"
        >
          {/* 강점 */}
          <section className="border-t border-zinc-100 py-8">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">강점</p>
            <ul className="space-y-2.5">
              {typeData.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                  <span
                    className="mt-2 w-1 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: typeData.color.primary }}
                  />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* 성장 포인트 */}
          <section className="border-t border-zinc-100 py-8">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">성장 포인트</p>
            <ul className="space-y-2.5">
              {typeData.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 leading-relaxed">
                  <span className="mt-2 w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </section>

          {/* 직업 */}
          <section className="border-t border-zinc-100 py-8">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">잘 맞는 직업</p>
            <div className="flex flex-wrap gap-2">
              {typeData.careers.map((career, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: typeData.color.primary }}
                >
                  {career}
                </span>
              ))}
            </div>
          </section>

          {/* 궁합 */}
          <section className="border-t border-zinc-100 py-8">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">궁합</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-400 mb-2">찰떡 궁합</p>
                <div className="flex gap-2 flex-wrap">
                  {typeData.compatibleTypes.map((t) => {
                    const td = mbtiTypeMap[t];
                    return (
                      <Link key={t} href={`/result/${t}`}>
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white hover:opacity-80 transition-opacity inline-block"
                          style={{ backgroundColor: td?.color.primary }}
                        >
                          {t}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-2">도전적인 관계</p>
                <div className="flex gap-2 flex-wrap">
                  {typeData.challengingTypes.map((t) => {
                    const td = mbtiTypeMap[t];
                    return (
                      <Link key={t} href={`/result/${t}`}>
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-lg text-white hover:opacity-80 transition-opacity inline-block"
                          style={{ backgroundColor: td?.color.primary }}
                        >
                          {t}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 유명인 */}
          <section className="border-t border-zinc-100 py-8">
            <p className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">같은 유형 유명인</p>
            <div className="space-y-3">
              {typeData.celebrities.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ backgroundColor: typeData.color.primary }}
                  >
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">{c.name}</p>
                    <p className="text-xs text-zinc-400">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 다시 테스트 */}
          <div className="border-t border-zinc-100 pt-8">
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-950 transition-colors"
            >
              <RotateCcw size={14} />
              다시 테스트하기
            </button>
          </div>
        </motion.div>
      </main>

      <ShareSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} mbtiType={typeCode} />
    </div>
  );
}
