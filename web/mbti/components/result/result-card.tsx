'use client';

import { MbtiTypeData, MbtiResult } from '@/types/mbti';
import { AxisBar } from './axis-bar';

interface ResultCardProps {
  typeData: MbtiTypeData;
  result: MbtiResult;
}

export function ResultCard({ typeData, result }: ResultCardProps) {
  const { percentages } = result;

  return (
    <div
      id="result-card"
      className="rounded-2xl overflow-hidden"
      style={{ background: typeData.color.gradient }}
    >
      {/* 헤더 */}
      <div className="px-8 pt-10 pb-8 text-white">
        <p className="text-xs font-bold tracking-widest uppercase opacity-60 mb-4">
          {typeData.group}형
        </p>
        <h1 className="text-8xl font-black tracking-tight leading-none mb-4">{typeData.code}</h1>
        <h2 className="text-xl font-bold mb-2">{typeData.nickname}</h2>
        <p className="text-sm opacity-80 leading-relaxed">{typeData.tagline}</p>
      </div>

      {/* 콘텐츠 */}
      <div className="bg-white mx-2 mb-2 rounded-xl p-6 space-y-5">
        <p className="text-sm text-zinc-600 leading-relaxed">{typeData.description}</p>

        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">성격 지표</p>
          <AxisBar leftLabel="외향(E)" rightLabel="내향(I)" leftPercent={percentages.E} color={typeData.color.primary} />
          <AxisBar leftLabel="감각(S)" rightLabel="직관(N)" leftPercent={percentages.S} color={typeData.color.primary} />
          <AxisBar leftLabel="사고(T)" rightLabel="감정(F)" leftPercent={percentages.T} color={typeData.color.primary} />
          <AxisBar leftLabel="판단(J)" rightLabel="인식(P)" leftPercent={percentages.J} color={typeData.color.primary} />
        </div>

        <div className="pt-3 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-300 font-medium tracking-wider">typefinder.app</p>
        </div>
      </div>
    </div>
  );
}
