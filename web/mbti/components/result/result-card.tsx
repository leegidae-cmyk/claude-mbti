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
      className="rounded-3xl overflow-hidden shadow-xl"
      style={{ background: typeData.color.gradient }}
    >
      {/* 헤더 영역 */}
      <div className="p-8 text-white text-center">
        <p className="text-sm font-semibold opacity-80 mb-1 tracking-widest uppercase">
          {typeData.group}형
        </p>
        <h1 className="text-7xl font-black mb-3 tracking-tight">{typeData.code}</h1>
        <h2 className="text-2xl font-bold mb-2">{typeData.nickname}</h2>
        <p className="text-base opacity-90 font-medium leading-relaxed">{typeData.tagline}</p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-white mx-3 mb-3 rounded-2xl p-6 space-y-6">
        {/* 설명 */}
        <p className="text-gray-700 text-sm leading-relaxed">{typeData.description}</p>

        {/* 축 퍼센트 바 */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900">성격 지표</h3>
          <AxisBar
            leftLabel="외향(E)"
            rightLabel="내향(I)"
            leftPercent={percentages.E}
            color={typeData.color.primary}
          />
          <AxisBar
            leftLabel="감각(S)"
            rightLabel="직관(N)"
            leftPercent={percentages.S}
            color={typeData.color.primary}
          />
          <AxisBar
            leftLabel="사고(T)"
            rightLabel="감정(F)"
            leftPercent={percentages.T}
            color={typeData.color.primary}
          />
          <AxisBar
            leftLabel="판단(J)"
            rightLabel="인식(P)"
            leftPercent={percentages.J}
            color={typeData.color.primary}
          />
        </div>

        {/* 서비스 URL */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">typefinder.app</p>
        </div>
      </div>
    </div>
  );
}
