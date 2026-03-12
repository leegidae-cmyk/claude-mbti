import Link from 'next/link';
import { BarChart2 } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-600">TypeFinder</span>
        </Link>
        <Link
          href="/stats"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <BarChart2 size={16} />
          <span>통계</span>
        </Link>
      </div>
    </header>
  );
}
