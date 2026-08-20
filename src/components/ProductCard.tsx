import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#12141e] hover:bg-[#151824] border border-white/10 hover:border-red-500/30 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-lg shadow-black/40 hover:shadow-red-950/20"
    >
      {/* Category Tag */}
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-full backdrop-blur-md">
          {product.category}
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/40 mb-4 border border-white/5 flex items-center justify-center p-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between text-right">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="text-right">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-slate-400 font-sans">د.ل</span>
              <span className="text-lg sm:text-xl font-black text-white font-mono">
                {product.price.toLocaleString()}
              </span>
            </div>
            {product.oldPrice && (
              <span className="text-[10px] text-slate-500 line-through font-mono">
                {product.oldPrice} د.ل
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/60'
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
                <span>إضافة إلى السلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
