import React from 'react';
import { useStore } from '../context/StoreContext';
import { MessageCircle, ExternalLink } from 'lucide-react';

export const DirectOrderBanner: React.FC = () => {
  const { settings } = useStore();

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#171926] via-[#1c1421] to-[#171926] border border-white/10 p-8 sm:p-10 text-center overflow-hidden shadow-2xl shadow-black/50">
          {/* Subtle Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              هل تفضل الطلب مباشرة؟
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              يمكنك التواصل معنا عبر واتساب للطلب والاستفسار عن أي منتج، فريقنا جاهز لخدمتك بأسرع وقت.
            </p>

            <div className="pt-2">
              <a
                id="direct-order-whatsapp-btn"
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('مرحباً RTG Gear X، أرغب في الاستفسار عن المنتجات المتاحة')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/70 transition-all hover:shadow-emerald-600/20"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>الطلب عبر واتساب</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
