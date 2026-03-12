import { MbtiCode } from '@/types/mbti';
import { ResultPageClient } from './result-page-client';

const VALID_TYPES: MbtiCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function ResultPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <ResultPageClient type={type} />;
}
