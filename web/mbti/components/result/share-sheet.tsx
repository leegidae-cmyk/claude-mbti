'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MbtiCode } from '@/types/mbti';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mbtiType: MbtiCode;
}

export function ShareSheet({ isOpen, onClose, mbtiType }: ShareSheetProps) {
  const [copying, setCopying] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/result/${mbtiType}`
      : `/result/${mbtiType}`;

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 복사되었습니다!');
      onClose();
    } catch {
      toast.error('복사에 실패했습니다.');
    } finally {
      setCopying(false);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `나는 ${mbtiType}입니다!`,
          text: `TypeFinder에서 내 MBTI를 확인해봤어요. 나는 ${mbtiType}! 당신은 어떤 유형인지 알아보세요.`,
          url: shareUrl,
        });
        onClose();
      } catch {
        // 사용자가 취소한 경우 무시
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-w-2xl mx-auto"
          >
            <div className="px-6 pt-5 pb-8">
              <div className="w-8 h-1 bg-zinc-200 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-zinc-950">결과 공유하기</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded-lg hover:bg-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleWebShare}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-950 flex items-center justify-center shrink-0">
                    <Share2 size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">공유하기</p>
                    <p className="text-xs text-zinc-500">SNS나 메신저로 공유</p>
                  </div>
                </button>

                <button
                  onClick={handleCopyLink}
                  disabled={copying}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <Link2 size={16} className="text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">링크 복사</p>
                    <p className="text-xs text-zinc-500">결과 페이지 URL 복사</p>
                  </div>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 py-3 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
