import { Question } from '@/types/mbti';

export const questions: Question[] = [
  // EI 축 (Q1-Q3)
  {
    id: 1,
    text: '주말 저녁, 가장 즐거운 시간은?',
    axis: 'EI',
    optionA: { text: '친구들과 왁자지껄한 파티나 모임', icon: '🎉', dimension: 'E' },
    optionB: { text: '혼자만의 조용한 취미나 휴식', icon: '📚', dimension: 'I' },
  },
  {
    id: 2,
    text: '처음 만나는 사람들과 있을 때 나는?',
    axis: 'EI',
    optionA: { text: '먼저 말을 걸고 분위기를 이끈다', icon: '😄', dimension: 'E' },
    optionB: { text: '상대가 말 걸어올 때까지 기다린다', icon: '🤫', dimension: 'I' },
  },
  {
    id: 3,
    text: '지치고 힘들 때 에너지를 채우는 방법은?',
    axis: 'EI',
    optionA: { text: '친구를 만나거나 사람들과 어울린다', icon: '👥', dimension: 'E' },
    optionB: { text: '혼자 조용히 있거나 집에서 쉰다', icon: '🏠', dimension: 'I' },
  },
  // SN 축 (Q4-Q6)
  {
    id: 4,
    text: '새 가전제품을 살 때 나는?',
    axis: 'SN',
    optionA: { text: '스펙과 후기를 꼼꼼히 비교하고 결정', icon: '📊', dimension: 'S' },
    optionB: { text: '브랜드 이미지와 직감으로 결정', icon: '✨', dimension: 'N' },
  },
  {
    id: 5,
    text: '대화할 때 내가 더 좋아하는 주제는?',
    axis: 'SN',
    optionA: { text: '실제 경험, 최근 있었던 일', icon: '📅', dimension: 'S' },
    optionB: { text: '미래 가능성, 아이디어와 상상', icon: '💡', dimension: 'N' },
  },
  {
    id: 6,
    text: '길을 찾을 때 나는?',
    axis: 'SN',
    optionA: { text: '지도 앱을 켜고 단계별 안내를 따른다', icon: '🗺️', dimension: 'S' },
    optionB: { text: '대략적인 방향을 파악하고 감으로 찾아간다', icon: '🧭', dimension: 'N' },
  },
  // TF 축 (Q7-Q9)
  {
    id: 7,
    text: '친구가 고민을 털어놓을 때 나는?',
    axis: 'TF',
    optionA: { text: '원인을 분석하고 해결책을 제시한다', icon: '🔍', dimension: 'T' },
    optionB: { text: '공감하며 감정을 먼저 받아준다', icon: '🤝', dimension: 'F' },
  },
  {
    id: 8,
    text: '팀 프로젝트에서 갈등이 생겼을 때 나는?',
    axis: 'TF',
    optionA: { text: '논리적으로 옳고 그름을 따져 해결', icon: '⚖️', dimension: 'T' },
    optionB: { text: '팀원들의 감정을 고려해 원만하게 조율', icon: '💬', dimension: 'F' },
  },
  {
    id: 9,
    text: '중요한 결정을 내릴 때 나는?',
    axis: 'TF',
    optionA: { text: '데이터와 근거를 중심으로 판단', icon: '📈', dimension: 'T' },
    optionB: { text: '내 감정과 가치관을 중심으로 판단', icon: '💖', dimension: 'F' },
  },
  // JP 축 (Q10-Q12)
  {
    id: 10,
    text: '여행을 계획할 때 나는?',
    axis: 'JP',
    optionA: { text: '일정, 숙소, 맛집을 미리 꼼꼼히 예약', icon: '📋', dimension: 'J' },
    optionB: { text: '대략적인 목적지만 정하고 즉흥적으로', icon: '🎒', dimension: 'P' },
  },
  {
    id: 11,
    text: '할 일이 생겼을 때 나는?',
    axis: 'JP',
    optionA: { text: '마감 전에 미리미리 끝내야 마음이 편하다', icon: '✅', dimension: 'J' },
    optionB: { text: '마감이 다가올수록 집중력이 올라간다', icon: '⚡', dimension: 'P' },
  },
  {
    id: 12,
    text: '내 방이나 책상 상태는?',
    axis: 'JP',
    optionA: { text: '항상 정리정돈이 되어 있어야 한다', icon: '🗂️', dimension: 'J' },
    optionB: { text: '내 나름의 기준이 있는 창의적 카오스', icon: '🎨', dimension: 'P' },
  },
];
