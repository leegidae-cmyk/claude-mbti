import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'TypeFinder — 12개의 질문으로 나를 발견하다',
  description: '12개의 핵심 질문으로 나의 MBTI 성격 유형을 빠르게 알아보세요.',
  openGraph: {
    title: 'TypeFinder',
    description: '12개의 질문으로 나를 발견하다',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
