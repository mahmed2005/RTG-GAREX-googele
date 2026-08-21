import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowLeft, Flame, PackagePlus } from 'lucide-react';

export const LatestProducts: React.FC = () => {
  const { products, setCurrentPage } = useStore();
  const latestList = products.slice(0, 4);

  return (
    <section className="py-14 sm:py-20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 text-center sm:text-right">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                أحدث المنتجات
              </h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              تصفح تشكيلتنا المميزة من معدات الجيمنج الاحترافية المضافة حديثاً
            </p>
          </div>

          <button
            id="view-all-products-btn"
            onClick={() => setCurrentPage('products')}
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-xs sm:text-sm transition-colors py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10"
          >
            <span>عرض جميع المنتجات</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Grid or Empty State */}
        {latestList.length === 0 ? (
          <div className="bg-[#12141f] rounded-3xl border border-white/10 p-8 sm:p-12 max-w-2xl mx-auto text-center shadow-2xl relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-950/40">
                <PackagePlus className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  قريباً وصول تشكيلة جديدة من معدات الجيمنج
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  يتم حالياً تجهيز وتحديث قائمة المنتجات الحصرية. يمكنك تصفح حسابات ببجي وباقات الشدات المتوفرة الآن أو إضافة منتجاتك عبر لوحة التحكم.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage('pubg_accounts')}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  تصفح حسابات PUBG
                </button>
                <button
                  onClick={() => setCurrentPage('pubg_uc')}
                  className="px-5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  شحن شدات UC
                </button>
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-950/50"
                >
                  + إضافة منتجات من لوحة الإدارة
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestList.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
