import { MbtiCode, MbtiResult } from '@/types/mbti';

export function calculateMbti(answers: Record<number, 'A' | 'B'>): MbtiResult {
  const eScore = [1, 2, 3].filter((q) => answers[q] === 'A').length;
  const sScore = [4, 5, 6].filter((q) => answers[q] === 'A').length;
  const tScore = [7, 8, 9].filter((q) => answers[q] === 'A').length;
  const jScore = [10, 11, 12].filter((q) => answers[q] === 'A').length;

  const dim1 = eScore >= 2 ? 'E' : 'I';
  const dim2 = sScore >= 2 ? 'S' : 'N';
  const dim3 = tScore >= 2 ? 'T' : 'F';
  const dim4 = jScore >= 2 ? 'J' : 'P';

  const type = `${dim1}${dim2}${dim3}${dim4}` as MbtiCode;

  return {
    type,
    scores: {
      E: eScore,
      I: 3 - eScore,
      S: sScore,
      N: 3 - sScore,
      T: tScore,
      F: 3 - tScore,
      J: jScore,
      P: 3 - jScore,
    },
    percentages: {
      E: Math.round((eScore / 3) * 100),
      S: Math.round((sScore / 3) * 100),
      T: Math.round((tScore / 3) * 100),
      J: Math.round((jScore / 3) * 100),
    },
  };
}
