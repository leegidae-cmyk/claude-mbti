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
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
        'flex items-center gap-4 group',
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-indigo-300 hover:shadow-sm'
      )}
    >
      <span className="text-3xl shrink-0">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm font-semibold mb-0.5 block',
            selected ? 'text-indigo-600' : 'text-gray-400'
          )}
        >
          {label}
        </span>
        <p
          className={cn(
            'text-base font-medium leading-snug',
            selected ? 'text-indigo-900' : 'text-gray-700'
          )}
        >
          {option.text}
        </p>
      </div>
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
          selected
            ? 'border-indigo-500 bg-indigo-500'
            : 'border-gray-300 group-hover:border-indigo-300'
        )}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </div>
    </motion.button>
  );
}
