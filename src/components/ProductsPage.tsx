import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Category } from '../types';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    'الكل',
    'كاميرات مراقبة',
    'سماعات',
    'مبردات',
    'كروت شاشة',
    'ميكروفونات',
    'كيبورد',
    'ماوس',
    'إكسسوارات',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 sm:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            متجر <span className="text-red-500">المعدات</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            اكتشف مجموعتنا الواسعة من معدات الألعاب الاحترافية، نختار أفضل القطع لضمان أداء لا يُضاهى.
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="mb-10 space-y-5">
          {/* Category Filter Pills matching video */}
          <div className="flex items-center justify-center flex-wrap gap-2.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cat-filter-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/80 scale-105'
                      : 'bg-[#151722] text-slate-300 hover:text-white hover:bg-[#1c1f2e] border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              id="products-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن سماعة، ماوس، كيبورد، مبرد..."
              className="w-full bg-[#151722] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl py-3 pr-11 pl-4 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all text-right"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#12141e] rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
            <PackageX className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">لا توجد منتجات مطابقة</h3>
            <p className="text-slate-400 text-xs">
              جرّب تغيير فئة البحث أو مسح كلمة البحث الحالية
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
