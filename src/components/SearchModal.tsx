import React, { useState, useEffect, useMemo } from 'react';
import { useStore, PageType } from '../context/StoreContext';
import { Search, X, Package, Gamepad2, Zap, ArrowLeft, ShieldCheck, Check } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    pubgAccounts, 
    ucPackages, 
    setCurrentPage, 
    setSelectedCategory, 
    setSelectedAccountForBuy, 
    setSelectedUcPackage, 
    addToCart 
  } = useStore();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'accounts' | 'uc'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        products: products.slice(0, 4),
        accounts: pubgAccounts.slice(0, 2),
        uc: ucPackages.slice(0, 3),
        total: products.length + pubgAccounts.length + ucPackages.length,
      };
    }

    const matchedProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    const matchedAccounts = pubgAccounts.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.accountName && a.accountName.toLowerCase().includes(q)) ||
        (a.ownerName && a.ownerName.toLowerCase().includes(q)) ||
        (a.level && a.level.toLowerCase().includes(q)) ||
        (a.badge && a.badge.toLowerCase().includes(q)) ||
        (a.features && a.features.some((f) => f.toLowerCase().includes(q)))
    );

    const matchedUc = ucPackages.filter(
      (u) =>
        u.ucAmount.toString().includes(q) ||
        (u.tag && u.tag.toLowerCase().includes(q)) ||
        u.price.toString().includes(q)
    );

    return {
      products: matchedProducts,
      accounts: matchedAccounts,
      uc: matchedUc,
      total: matchedProducts.length + matchedAccounts.length + matchedUc.length,
    };
  }, [query, products, pubgAccounts, ucPackages]);

  if (!isOpen) return null;

  const handleAddToCart = (e: React.MouseEvent, prod: any) => {
    e.stopPropagation();
    addToCart(prod);
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleSelectProduct = (prod: any) => {
    setSelectedCategory(prod.category);
    setCurrentPage('products');
    onClose();
  };

  const handleSelectAccount = (account: any) => {
    setSelectedAccountForBuy(account);
    setCurrentPage('pubg_accounts');
    onClose();
  };

  const handleSelectUc = (pkg: any) => {
    setSelectedUcPackage(pkg);
    setCurrentPage('pubg_uc');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0f111a] border border-white/15 rounded-3xl shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[85vh] mt-4 sm:mt-12 text-right font-['Cairo',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 bg-[#12141f]">
          <Search className="w-5 h-5 text-red-500 flex-shrink-0" />
          <input
            type="text"
            id="global-search-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن أي منتج، كاميرا، ماوس، سماعة، حساب ببجي، باقة شدات..."
            className="flex-1 bg-transparent text-white placeholder:text-slate-400 text-sm sm:text-base outline-none font-semibold"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
          >
            إغلاق
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-[#0a0b10] border-b border-white/5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            الكل ({results.products.length + results.accounts.length + results.uc.length})
          </button>
          <button
            onClick={() => setActiveFilter('products')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'products'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>منتجات ومعدات ({results.products.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('accounts')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'accounts'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>حسابات ببجي ({results.accounts.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('uc')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'uc'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>باقات الشدات ({results.uc.length})</span>
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {results.total === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white mb-1">لا توجد نتائج بحث مطابقة لـ "{query}"</p>
              <p className="text-xs text-slate-500">جرّب البحث باسم منتج آخر مثل "كاميرا"، "سماعة"، "مبرد"، أو "660"</p>
            </div>
          )}

          {/* Section: Products */}
          {(activeFilter === 'all' || activeFilter === 'products') && results.products.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5 text-red-400">
                  <Package className="w-4 h-4" />
                  <span>المنتجات والمعدات والكاميرات</span>
                </span>
                <span>{results.products.length} منتج</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {results.products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod)}
                    className="p-3 bg-[#141724] hover:bg-[#1a1e30] border border-white/5 hover:border-red-500/30 rounded-2xl cursor-pointer transition-all flex items-center gap-3 group"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover bg-black/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md">
                        {prod.category}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-red-400 transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-white">
                          {prod.price} <span className="text-[10px] text-red-400">د.ل</span>
                        </span>
                        <button
                          onClick={(e) => handleAddToCart(e, prod)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            addedId === prod.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white'
                          }`}
                        >
                          {addedId === prod.id ? '✓ أضيف' : '+ للسلة'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: PUBG Accounts */}
          {(activeFilter === 'all' || activeFilter === 'accounts') && results.accounts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span>حسابات PUBG Mobile</span>
                </span>
                <span>{results.accounts.length} حساب</span>
              </div>

              <div className="space-y-2">
                {results.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className="p-3.5 bg-[#141724] hover:bg-[#1a1e30] border border-white/5 hover:border-amber-500/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs flex-shrink-0">
                        {acc.level || 'LVL'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                            {acc.accountName || acc.title}
                          </h4>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold">
                            {acc.badge || 'موثق'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {acc.mythicsCount ? `${acc.mythicsCount} ميثيك` : ''} 
                          {acc.upgradableWeaponsCount ? ` • ${acc.upgradableWeaponsCount} سلاح مطور` : ''}
                          {acc.carsCount ? ` • ${acc.carsCount} سيارات` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-black text-amber-400">
                        {acc.price || acc.salePrice} د.ل
                      </span>
                      <span className="p-1.5 rounded-lg bg-white/5 text-slate-300 group-hover:bg-amber-500 group-hover:text-black transition-all">
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: UC Packages */}
          {(activeFilter === 'all' || activeFilter === 'uc') && results.uc.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span>باقات شحن الشدات UC</span>
                </span>
                <span>{results.uc.length} باقة</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {results.uc.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectUc(pkg)}
                    className="p-3 bg-[#141724] hover:bg-[#1a1e30] border border-white/5 hover:border-yellow-500/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-2 group"
                  >
                    <div>
                      <div className="text-xs font-black text-yellow-400 flex items-center gap-1">
                        <span>{pkg.ucAmount} UC</span>
                        {pkg.bonusUc ? (
                          <span className="text-[10px] text-emerald-400 font-bold">+{pkg.bonusUc}</span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {pkg.tag || 'شحن فوري بالـ ID'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white group-hover:text-yellow-400">
                      {pkg.price} د.ل
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Shortcuts */}
        <div className="p-3 bg-[#0a0b10] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>بحث فوري ومباشر في قاعدة بيانات المتجر</span>
          </div>
          <span>اضغط على أي عنصر للانتقال والشراء</span>
        </div>
      </div>
    </div>
  );
};
