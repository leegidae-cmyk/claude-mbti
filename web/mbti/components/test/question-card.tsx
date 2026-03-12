'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Option } from '@/types/mbti';

interface QuestionCardProps {
  option: Option;
  label: 'A' | 'B';
  selected: boolean;
  onClick: () => void;
}

export function QuestionCard({ option, label, selected, onClick }: QuestionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer',
        'flex items-center gap-4 group',
        selected
          ? 'border-zinc-950 bg-zinc-950'
          : 'border-zinc-200 bg-white hover:border-zinc-400'
      )}
    >
      <span className="text-2xl shrink-0">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-xs font-bold tracking-widest uppercase block mb-1',
            selected ? 'text-zinc-400' : 'text-zinc-300'
          )}
        >
          {label}
        </span>
        <p
          className={cn(
            'text-base font-medium leading-snug',
            selected ? 'text-white' : 'text-zinc-700'
          )}
        >
          {option.text}
        </p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150',
          selected
            ? 'border-white bg-white'
            : 'border-zinc-300 group-hover:border-zinc-500'
        )}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="w-2 h-2 rounded-full bg-zinc-950"
          />
        )}
      </div>
    </button>
  );
}
