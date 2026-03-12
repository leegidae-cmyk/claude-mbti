'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, Share2, RotateCcw, ChevronLeft, Star, Briefcase, Heart, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
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
    if (!isValid) {
      router.push('/');
    }
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

      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        cacheBust: true,
      });

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          홈으로
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResultCard typeData={typeData} result={displayResult} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mt-4"
        >
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleSaveImage}
            disabled={saving}
          >
            <Download size={16} />
            {saving ? '저장 중...' : '이미지 저장'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={16} />
            공유하기
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-4"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} style={{ color: typeData.color.primary }} />
              <h3 className="font-bold text-gray-900">강점</h3>
            </div>
            <ul className="space-y-2">
              {typeData.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: typeData.color.primary }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-bold text-gray-900">성장 포인트</h3>
            </div>
            <ul className="space-y-2">
              {typeData.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={18} style={{ color: typeData.color.primary }} />
              <h3 className="font-bold text-gray-900">잘 맞는 직업</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {typeData.careers.map((career, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-white"
                  style={{ backgroundColor: typeData.color.primary }}
                >
                  {career}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} style={{ color: typeData.color.primary }} />
              <h3 className="font-bold text-gray-900">궁합</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">찰떡 궁합</p>
                <div className="flex gap-2">
                  {typeData.compatibleTypes.map((t) => {
                    const td = mbtiTypeMap[t];
                    return (
                      <Link key={t} href={`/result/${t}`}>
                        <span
                          className="text-sm font-bold px-3 py-1.5 rounded-full text-white cursor-pointer hover:opacity-80 transition-opacity"
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
                <p className="text-xs font-semibold text-gray-500 mb-2">도전적인 관계</p>
                <div className="flex gap-2">
                  {typeData.challengingTypes.map((t) => {
                    const td = mbtiTypeMap[t];
                    return (
                      <Link key={t} href={`/result/${t}`}>
                        <span
                          className="text-sm font-bold px-3 py-1.5 rounded-full text-white cursor-pointer hover:opacity-80 transition-opacity"
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
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">같은 유형 유명인</h3>
            <div className="space-y-2">
              {typeData.celebrities.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: typeData.color.primary }}
                  >
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={handleRetake}
          >
            <RotateCcw size={16} />
            다시 테스트하기
          </Button>
        </motion.div>
      </main>

      <ShareSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} mbtiType={typeCode} />
    </div>
  );
}
