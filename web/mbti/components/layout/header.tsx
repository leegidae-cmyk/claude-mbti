import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-base font-bold tracking-tight text-zinc-950">
          TypeFinder
        </Link>
        <Link
          href="/stats"
          className="text-sm text-zinc-500 hover:text-zinc-950 transition-colors duration-150"
        >
          통계
        </Link>
      </div>
    </header>
  );
}
