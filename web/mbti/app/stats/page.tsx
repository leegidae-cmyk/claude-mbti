'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { mbtiTypeMap } from '@/data/mbti-types';
import { MbtiCode } from '@/types/mbti';

interface StatsData {
  total: number;
  distribution: Record<MbtiCode, number>;
}

const GROUP_ORDER: MbtiCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = stats
    ? Math.max(...Object.values(stats.distribution))
    : 1;

  // 축별 비율 계산
  const axisStats = stats
    ? (() => {
        let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
        (Object.entries(stats.distribution) as [MbtiCode, number][]).forEach(([code, count]) => {
          if (code[0] === 'E') E += count; else I += count;
          if (code[1] === 'S') S += count; else N += count;
          if (code[2] === 'T') T += count; else F += count;
          if (code[3] === 'J') J += count; else P += count;
        });
        const total = stats.total;
        return { E, I, S, N, T, F, J, P, total };
      })()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Users size={20} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">유형별 통계</h1>
          </div>
          {stats && (
            <p className="text-sm text-gray-500">
              총{' '}
              <span className="font-bold text-indigo-600">
                {stats.total.toLocaleString()}명
              </span>
              의 결과
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">통계를 불러오는 중...</div>
        ) : stats ? (
          <>
            {/* 유형별 막대 차트 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
              <h2 className="text-base font-bold text-gray-900 mb-4">유형별 분포</h2>
              <div className="space-y-2.5">
                {GROUP_ORDER.map((code, index) => {
                  const count = stats.distribution[code] ?? 0;
                  const percentage = ((count / stats.total) * 100).toFixed(1);
                  const barWidth = (count / maxCount) * 100;
                  const typeData = mbtiTypeMap[code];

                  return (
                    <motion.div
                      key={code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link href={`/result/${code}`} className="block group">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-xs font-bold text-gray-700 shrink-0">{code}</span>
                          <div className="flex-1 relative h-7 bg-gray-100 rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.8, delay: index * 0.04, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 rounded-lg"
                              style={{ backgroundColor: typeData.color.primary }}
                            />
                            <span className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-gray-600">
                              {percentage}%
                            </span>
                          </div>
                          <span className="w-16 text-xs text-gray-500 text-right shrink-0">
                            {count.toLocaleString()}명
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 축별 비율 */}
            {axisStats && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">성격 축 비율</h2>
                <div className="space-y-4">
                  {[
                    { left: 'E', right: 'I', leftLabel: '외향(E)', rightLabel: '내향(I)', leftCount: axisStats.E, rightCount: axisStats.I, color: '#6366F1' },
                    { left: 'S', right: 'N', leftLabel: '감각(S)', rightLabel: '직관(N)', leftCount: axisStats.S, rightCount: axisStats.N, color: '#EC4899' },
                    { left: 'T', right: 'F', leftLabel: '사고(T)', rightLabel: '감정(F)', leftCount: axisStats.T, rightCount: axisStats.F, color: '#0EA5E9' },
                    { left: 'J', right: 'P', leftLabel: '판단(J)', rightLabel: '인식(P)', leftCount: axisStats.J, rightCount: axisStats.P, color: '#10B981' },
                  ].map((axis) => {
                    const total = axis.leftCount + axis.rightCount;
                    const leftPct = Math.round((axis.leftCount / total) * 100);
                    const rightPct = 100 - leftPct;
                    return (
                      <div key={axis.left} className="space-y-1.5">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className={leftPct >= rightPct ? 'text-gray-900' : 'text-gray-400'}>
                            {axis.leftLabel}
                          </span>
                          <span className={rightPct > leftPct ? 'text-gray-900' : 'text-gray-400'}>
                            {axis.rightLabel}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${leftPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-l-full"
                            style={{ backgroundColor: axis.color }}
                          />
                          <div
                            className="h-full flex-1 rounded-r-full"
                            style={{ backgroundColor: axis.color + '33' }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{leftPct}%</span>
                          <span>{rightPct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">통계를 불러올 수 없습니다.</div>
        )}

        <Link href="/test">
          <Button className="w-full gap-2">
            나도 테스트하기
            <ArrowRight size={16} />
          </Button>
        </Link>
      </main>
    </div>
  );
}
