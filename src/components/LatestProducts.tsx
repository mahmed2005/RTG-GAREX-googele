import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { ArrowLeft, Flame } from 'lucide-react';

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
              تصفح تشكيلتنا المميزة من معدات الجيمنج الاحترافية
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestList.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
};
