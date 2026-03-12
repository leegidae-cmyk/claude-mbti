'use client';

import { motion } from 'framer-motion';

interface AxisBarProps {
  leftLabel: string;
  rightLabel: string;
  leftPercent: number;
  color?: string;
}

export function AxisBar({ leftLabel, rightLabel, leftPercent, color = '#6366F1' }: AxisBarProps) {
  const rightPercent = 100 - leftPercent;
  const leftWins = leftPercent >= rightPercent;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm font-semibold text-gray-700">
        <span className={leftWins ? 'text-gray-900' : 'text-gray-400'}>{leftLabel}</span>
        <span className={!leftWins ? 'text-gray-900' : 'text-gray-400'}>{rightLabel}</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${leftPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{leftPercent}%</span>
        <span>{rightPercent}%</span>
      </div>
    </div>
  );
}
