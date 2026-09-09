import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, X } from 'lucide-react';

export const LoadingNotification: React.FC = () => {
  const { dataLoadedMessage, dismissDataLoadedMessage } = useStore();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto pointer-events-none">
      <AnimatePresence>
        {dataLoadedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-auto bg-[#0d1c15]/95 backdrop-blur-md border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-2xl shadow-2xl shadow-emerald-950/40 flex items-center justify-between gap-3 text-xs font-bold"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{dataLoadedMessage}</span>
            </div>
            <button
              onClick={dismissDataLoadedMessage}
              className="p-1 rounded-lg text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors"
              title="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

