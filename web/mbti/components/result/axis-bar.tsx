'use client';

import { motion } from 'framer-motion';

interface AxisBarProps {
  leftLabel: string;
  rightLabel: string;
  leftPercent: number;
  color?: string;
}

export function AxisBar({ leftLabel, rightLabel, leftPercent, color = '#09090b' }: AxisBarProps) {
  const rightPercent = 100 - leftPercent;
  const leftWins = leftPercent >= rightPercent;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className={leftWins ? 'text-zinc-900' : 'text-zinc-400'}>{leftLabel}</span>
        <span className={!leftWins ? 'text-zinc-900' : 'text-zinc-400'}>{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${leftPercent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{leftPercent}%</span>
        <span>{rightPercent}%</span>
      </div>
    </div>
  );
}
