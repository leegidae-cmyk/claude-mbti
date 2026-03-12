'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MbtiResult } from '@/types/mbti';

interface TestStore {
  answers: Record<number, 'A' | 'B'>;
  currentQuestion: number;
  startedAt: string | null;
  result: MbtiResult | null;
  setAnswer: (questionId: number, answer: 'A' | 'B') => void;
  setCurrentQuestion: (q: number) => void;
  setResult: (result: MbtiResult) => void;
  resetTest: () => void;
  hasProgress: () => boolean;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      answers: {},
      currentQuestion: 1,
      startedAt: null,
      result: null,

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
          startedAt: state.startedAt ?? new Date().toISOString(),
        })),

      setCurrentQuestion: (q) => set({ currentQuestion: q }),

      setResult: (result) => set({ result }),

      resetTest: () =>
        set({
          answers: {},
          currentQuestion: 1,
          startedAt: null,
          result: null,
        }),

      hasProgress: () => {
        const state = get();
        return Object.keys(state.answers).length > 0;
      },
    }),
    {
      name: 'mbti-test-progress',
      partialize: (state) => ({
        answers: state.answers,
        currentQuestion: state.currentQuestion,
        startedAt: state.startedAt,
      }),
    }
  )
);
