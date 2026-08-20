import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // duration in ms, default 2500ms
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete,
  duration = 2500 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsVisible(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -24,
            filter: 'blur(10px)',
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-[#07080c] flex flex-col items-center justify-center px-6 overflow-hidden select-none"
        >
          {/* Ambient Luxury Lighting / Glow Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-red-600/15 via-rose-500/10 to-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Subtle Grid Background Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }} 
          />

          {/* Central Animated Content */}
          <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-8">
            {/* Brand Logo & Glowing Halo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              <div className="relative p-4 rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/80">
                <Logo size="lg" />
              </div>
            </motion.div>

            {/* Central Slogan / Requested Phrase */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-white/10 text-amber-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>تجربة رقمية استثنائية</span>
                <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              </div>

              {/* The requested slogan */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-relaxed md:leading-normal tracking-wide px-4">
                "حيث تبدأ سلاسة التجربة... ونُصمم لك المستقبل بلمسة من الرقي والانسيابية."
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto">
                متجرك الأول للألعاب، شحن الشدات الفوري، والعتاد الاحترافي
              </p>
            </motion.div>

            {/* Elegant Luxury Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-48 sm:w-64 space-y-2 pt-2"
            >
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>LOADING EXPERIENCE</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Skip Option */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={() => setIsVisible(false)}
            className="absolute bottom-8 text-xs text-slate-400 hover:text-white px-4 py-2 rounded-full border border-white/5 hover:border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all"
          >
            تخطي المقدمة ←
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
