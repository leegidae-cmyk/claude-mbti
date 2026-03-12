import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // TODO: Supabase/Prisma 연동 시 실제 저장
  console.log('Result saved (mock):', body);
  return NextResponse.json({ success: true });
}
