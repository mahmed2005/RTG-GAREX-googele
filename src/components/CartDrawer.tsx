import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    setIsCheckoutOpen,
    setCurrentPage,
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleBrowse = () => {
    setIsCartOpen(false);
    setCurrentPage('products');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      {/* Slide Drawer */}
      <div
        id="cart-drawer-panel"
        className="absolute inset-y-0 left-0 max-w-md w-full bg-[#10121a] border-r border-white/10 shadow-2xl flex flex-col justify-between p-6 z-10 animate-slideInLeft"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">سلة المشتريات</h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق السلة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List or Empty State */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 my-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-slate-400 font-semibold text-lg">السلة فارغة حالياً</p>
              <p className="text-slate-500 text-xs max-w-xs">
                تصفح أفضل معدات الألعاب وأضف المنتجات التي ترغب في شرائها
              </p>
              <button
                id="cart-browse-btn"
                onClick={handleBrowse}
                className="mt-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-950/60 transition-colors"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                id={`cart-item-${item.product.id}`}
                className="flex items-center justify-between gap-3 p-3.5 bg-[#171924] rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Product Image */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 bg-black/40 flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0 text-right">
                  <h4 className="text-sm font-bold text-white truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-red-400 font-bold mt-1 font-mono">
                    {item.product.price} د.ل
                  </p>
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#0d0e14] rounded-xl border border-white/10 p-1">
                    <button
                      id={`cart-qty-minus-${item.product.id}`}
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-white font-mono">
                      {item.quantity}
                    </span>
                    <button
                      id={`cart-qty-plus-${item.product.id}`}
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    id={`cart-remove-item-${item.product.id}`}
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label="حذف المنتج"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total and Checkout Button */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-slate-400 font-semibold">:الإجمالي</span>
              <span className="text-xl font-black text-red-500 font-mono tracking-tight">
                د.ل {cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              id="cart-checkout-proceed-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white rounded-xl font-bold text-base shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2"
            >
              <span>إتمام الطلب</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
