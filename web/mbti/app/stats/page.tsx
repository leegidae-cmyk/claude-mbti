'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/layout/header';
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

const GROUPS = [
  { label: '분석가', color: '#6366F1', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] as MbtiCode[] },
  { label: '외교관', color: '#EC4899', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] as MbtiCode[] },
  { label: '관리자', color: '#0EA5E9', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] as MbtiCode[] },
  { label: '탐험가', color: '#10B981', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] as MbtiCode[] },
];

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = stats ? Math.max(...Object.values(stats.distribution)) : 1;

  const groupData = stats
    ? GROUPS.map((g) => ({
        label: g.label,
        color: g.color,
        count: g.types.reduce((sum, t) => sum + (stats.distribution[t] ?? 0), 0),
      }))
    : [];

  const axisStats = stats ? (() => {
    let E = 0, I = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
    (Object.entries(stats.distribution) as [MbtiCode, number][]).forEach(([code, count]) => {
      if (code[0] === 'E') E += count; else I += count;
      if (code[1] === 'S') S += count; else N += count;
      if (code[2] === 'T') T += count; else F += count;
      if (code[3] === 'J') J += count; else P += count;
    });
    return { E, I, S, N, T, F, J, P, total: stats.total };
  })() : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-3">통계</p>
          <h1 className="text-5xl font-black text-zinc-950 tracking-tight leading-[1.05]">
            유형별<br />분포
          </h1>
          {stats && (
            <p className="text-zinc-500 mt-3 text-sm">
              총 <span className="font-bold text-zinc-950">{stats.total.toLocaleString()}명</span>의 결과
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-400">불러오는 중...</div>
        ) : stats ? (
          <>
            {/* 그룹 도넛 차트 */}
            <section className="mb-12 border-b border-zinc-100 pb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-6">그룹별 비율</p>
              <div className="flex items-center gap-8">
                <div className="w-44 h-44 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={groupData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="count"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {groupData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const n = Number(value);
                          return [`${n.toLocaleString()}명 (${((n / stats.total) * 100).toFixed(1)}%)`];
                        }}
                        contentStyle={{
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                          fontSize: '12px',
                          boxShadow: 'none',
                        }}
                        itemStyle={{ color: '#09090b' }}
                        labelStyle={{ color: '#71717a', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-3">
                  {groupData.map((g) => {
                    const pct = ((g.count / stats.total) * 100).toFixed(1);
                    return (
                      <div key={g.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                          <span className="text-sm font-medium text-zinc-700">{g.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-zinc-950">{pct}%</span>
                          <span className="text-xs text-zinc-400 w-20 text-right">{g.count.toLocaleString()}명</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 유형별 바 차트 */}
            <section className="mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-5">유형별 분포</p>
              <div className="space-y-2">
                {GROUP_ORDER.map((code, index) => {
                  const count = stats.distribution[code] ?? 0;
                  const percentage = ((count / stats.total) * 100).toFixed(1);
                  const barWidth = (count / maxCount) * 100;
                  const typeData = mbtiTypeMap[code];

                  return (
                    <motion.div
                      key={code}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link href={`/result/${code}`} className="block group">
                        <div className="flex items-center gap-3">
                          <span className="w-11 text-xs font-bold text-zinc-700 shrink-0">{code}</span>
                          <div className="flex-1 relative h-6 bg-zinc-50 rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.7, delay: index * 0.03, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: typeData.color.primary }}
                            />
                            <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-zinc-600">
                              {percentage}%
                            </span>
                          </div>
                          <span className="w-14 text-xs text-zinc-400 text-right shrink-0">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* 축별 비율 */}
            {axisStats && (
              <section className="mb-12">
                <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-5">성격 축 비율</p>
                <div className="space-y-6">
                  {[
                    { left: 'E', leftLabel: '외향(E)', rightLabel: '내향(I)', leftCount: axisStats.E, rightCount: axisStats.I, color: '#6366F1' },
                    { left: 'S', leftLabel: '감각(S)', rightLabel: '직관(N)', leftCount: axisStats.S, rightCount: axisStats.N, color: '#EC4899' },
                    { left: 'T', leftLabel: '사고(T)', rightLabel: '감정(F)', leftCount: axisStats.T, rightCount: axisStats.F, color: '#0EA5E9' },
                    { left: 'J', leftLabel: '판단(J)', rightLabel: '인식(P)', leftCount: axisStats.J, rightCount: axisStats.P, color: '#10B981' },
                  ].map((axis) => {
                    const total = axis.leftCount + axis.rightCount;
                    const leftPct = Math.round((axis.leftCount / total) * 100);
                    const rightPct = 100 - leftPct;
                    return (
                      <div key={axis.left}>
                        <div className="flex justify-between text-sm font-semibold mb-2">
                          <span className={leftPct >= rightPct ? 'text-zinc-950' : 'text-zinc-300'}>
                            {axis.leftLabel}
                          </span>
                          <span className={rightPct > leftPct ? 'text-zinc-950' : 'text-zinc-300'}>
                            {axis.rightLabel}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${leftPct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: axis.color }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400 mt-1.5">
                          <span>{leftPct}%</span>
                          <span>{rightPct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="py-20 text-center text-sm text-zinc-400">통계를 불러올 수 없습니다.</div>
        )}

        <div className="border-t border-zinc-100 pt-8">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-zinc-950 px-5 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            나도 테스트하기
            <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
