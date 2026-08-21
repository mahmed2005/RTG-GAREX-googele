import React from 'react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';
import { Sparkles, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';

export const HomeHero: React.FC = () => {
  const { setCurrentPage } = useStore();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-white/5">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Brand Big 3D Logo matching video */}
        <div className="flex justify-center mb-6">
          <Logo size="xl" showSubtitle={true} />
        </div>

        {/* Badge: "الوجهة الأولى للاعبين" */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-6 glow-red-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>الوجهة الأولى للاعبين في ليبيا</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.25] max-w-3xl mx-auto mb-6">
          ارتقِ بمستوى <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            أدائك في اللعب
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
          في <span className="text-white font-bold" dir="ltr">RTG Gear X</span>، نوفر لك أقوى معدات الألعاب، حسابات ببجي النادرة، وشدات بأسعار تنافسية. جهز السيت أب الخاص بك وانطلق نحو الاحتراف.
        </p>

        {/* Action Buttons matching video */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            id="hero-browse-store-btn"
            onClick={() => setCurrentPage('products')}
            className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white rounded-xl font-bold text-base shadow-xl shadow-red-950/70 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>تصفح المتجر</span>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            id="hero-charge-uc-btn"
            onClick={() => setCurrentPage('pubg_uc')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#171924] hover:bg-[#202333] border border-white/10 hover:border-red-500/30 active:scale-[0.98] text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-amber-400" />
            <span>شحن شدات</span>
          </button>
        </div>

        {/* Quick Trust Highlights */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mt-12 pt-8 border-t border-white/5 text-slate-400 text-xs">
          <button
            onClick={() => setCurrentPage('products')}
            className="flex flex-col items-center hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-white font-black text-sm sm:text-base font-mono">100%</span>
            <span>منتجات أصلية</span>
          </button>
          <button
            onClick={() => setCurrentPage('pubg_uc')}
            className="flex flex-col items-center border-x border-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-white font-black text-sm sm:text-base font-bold">فوري</span>
            <span>تسليم الشدات</span>
          </button>
          <button
            onClick={() => setCurrentPage('delivery_rates')}
            className="flex flex-col items-center hover:text-red-400 transition-colors cursor-pointer group"
          >
            <span className="text-red-400 font-black text-sm sm:text-base font-bold group-hover:underline">أسعار التوصيل</span>
            <span>لكافة مدن ليبيا ↗</span>
          </button>
        </div>
      </div>
    </section>
  );
};
