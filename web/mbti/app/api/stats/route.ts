import { NextResponse } from 'next/server';

export async function GET() {
  const mockStats = {
    total: 12847,
    distribution: {
      INFP: 1842,
      ENFJ: 1205,
      INTJ: 987,
      ENFP: 1634,
      INFJ: 892,
      ENTJ: 743,
      INTP: 876,
      ENTP: 654,
      ISTJ: 1123,
      ISFJ: 987,
      ESTJ: 654,
      ESFJ: 765,
      ISTP: 543,
      ISFP: 876,
      ESTP: 432,
      ESFP: 433,
    },
  };

  return NextResponse.json(mockStats, {
    headers: { 'Cache-Control': 'public, s-maxage=3600' },
  });
}
