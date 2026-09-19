import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { soundEngine } from '../utils/soundEngine';
import { Loader2, CheckCircle2, ShoppingBag, X, Sparkles } from 'lucide-react';

export const LoadingNotification: React.FC = () => {
  const { isDataLoading, dataLoadedMessage, dismissDataLoadedMessage } = useStore();

  // Play subtle sound when products finish loading
  useEffect(() => {
    if (!isDataLoading && dataLoadedMessage) {
      soundEngine.playSuccessSound();
    }
  }, [isDataLoading, dataLoadedMessage]);

  return (
    <>
      <AnimatePresence>
        {/* Centered Square Loading Modal (Blocks interaction until data loads) */}
        {isDataLoading && (
          <motion.div
            key="loading-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
            role="dialog"
            aria-modal="true"
            aria-label="جاري تحميل المنتجات"
          >
            {/* Square Modal Card */}
            <motion.div
              key="loading-modal-box"
              initial={{ scale: 0.88, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: -10 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative w-72 sm:w-80 aspect-square max-w-[90vw] bg-[#12141e] border-2 border-amber-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-2xl shadow-black overflow-hidden"
            >
              {/* Ambient Golden Glows */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Glowing Ring & Icon */}
              <div className="relative mb-4 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
                  <ShoppingBag className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400" />
                </div>
                <div className="absolute inset-0 -m-1.5 rounded-3xl border-2 border-amber-400/40 border-t-transparent animate-spin" />
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 tracking-wide">
                جاري تحميل المنتجات...
              </h3>

              {/* Subtitle / User reassurance */}
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-[230px] mb-4">
                انتظر وقتاً بسيطاً جداً وستظهر جميع المنتجات وباقات الشدات
              </p>

              {/* Progress Pulse Indicator */}
              <div className="w-full max-w-[180px] h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: 'easeInOut',
                  }}
                />
              </div>

              {/* Bottom Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span>يتم التجهيز الآن</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification: "تم عرض المنتجات، يمكنك الشراء الآن!" */}
      <AnimatePresence>
        {!isDataLoading && dataLoadedMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-[#0f1f17]/98 backdrop-blur-md border-2 border-emerald-500/60 text-emerald-100 px-5 py-3 rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center justify-between gap-3 text-xs sm:text-sm font-black"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-white">
                    <span>{dataLoadedMessage}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  </div>
                  <span className="text-[10px] text-emerald-300/80 font-normal">
                    أهلاً بك في متجر RTG GEAR X، استمتع بالتسوق!
                  </span>
                </div>
              </div>

              <button
                onClick={dismissDataLoadedMessage}
                className="p-1.5 rounded-xl text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-500/20 transition-colors mr-1 flex-shrink-0"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
