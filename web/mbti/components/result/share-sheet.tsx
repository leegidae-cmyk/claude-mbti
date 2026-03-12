'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
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
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* 바텀 시트 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto"
          >
            <div className="p-6">
              {/* 핸들 */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">결과 공유하기</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* 공유 옵션 */}
              <div className="space-y-3">
                <button
                  onClick={handleWebShare}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Share2 size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">공유하기</p>
                    <p className="text-sm text-gray-500">SNS나 메신저로 공유</p>
                  </div>
                </button>

                <button
                  onClick={handleCopyLink}
                  disabled={copying}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <Link2 size={20} className="text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">링크 복사</p>
                    <p className="text-sm text-gray-500">결과 페이지 URL 복사</p>
                  </div>
                </button>
              </div>

              <Button variant="ghost" onClick={onClose} className="w-full mt-4 text-gray-500">
                취소
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
