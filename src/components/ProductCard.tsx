import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { soundEngine } from '../utils/soundEngine';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    soundEngine.playSuccessSound();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#12141e] hover:bg-[#161926] border border-white/10 hover:border-red-500/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-red-950/20"
    >
      {/* Category Tag */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-red-600/25 border border-red-500/40 text-red-400 text-xs font-black rounded-full backdrop-blur-md shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/40 mb-4 border border-white/5 flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between text-right space-y-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white mb-2 group-hover:text-red-400 transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
            {product.description || 'معدة ألعاب احترافية عالية الجودة والأداء للألعاب التنافسية.'}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-red-400 font-bold font-sans">د.ل</span>
            </div>
            {product.oldPrice && (
              <span className="text-xs text-slate-500 line-through font-mono block">
                {product.oldPrice} د.ل
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
              added
                ? 'bg-emerald-600 text-white shadow-emerald-950/60'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>إضافة للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
