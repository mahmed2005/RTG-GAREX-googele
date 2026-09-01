import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { soundEngine } from '../utils/soundEngine';
import { 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  PhoneCall, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Maximize2, 
  X, 
  Plus, 
  Minus,
  Layers,
  Zap,
  Tag,
  AlertCircle
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { 
    selectedProduct, 
    products, 
    setCurrentPage, 
    addToCart, 
    setIsCheckoutOpen,
    deliveryRates,
    settings 
  } = useStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // If no product is selected, fallback to products page
  if (!selectedProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold text-white">لم يتم تحديد منتج</h2>
        <p className="text-slate-400 text-xs sm:text-sm">يرجى اختيار أحد المنتجات من المتجر لعرض تفاصيله الكاملة.</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-950/50"
        >
          الذهاب لمتجر المنتجات
        </button>
      </div>
    );
  }

  // Delivery calculation for this product
  const selectedCityRate = useMemo(() => {
    if (!selectedCityId) return null;
    return deliveryRates.find((r) => r.id === selectedCityId) || null;
  }, [deliveryRates, selectedCityId]);

  // Related products from same category or others
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== selectedProduct.id && (p.category === selectedProduct.category || selectedProduct.category === 'الكل'))
      .slice(0, 4);
  }, [products, selectedProduct]);

  // Add to cart handler
  const handleAddToCart = () => {
    soundEngine.playSuccessSound();
    addToCart(selectedProduct, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  // Buy Now direct checkout
  const handleBuyNow = () => {
    soundEngine.playButtonClick();
    addToCart(selectedProduct, quantity);
    setIsCheckoutOpen(true);
  };

  // Direct WhatsApp order
  const handleWhatsAppOrder = () => {
    soundEngine.playButtonClick();
    const phone = settings.whatsappNumber ? settings.whatsappNumber.replace(/[^0-9]/g, '') : '218943981577';
    const cleanPhone = phone.startsWith('218') ? phone : `218${phone.replace(/^0/, '')}`;
    const text = encodeURIComponent(
      `مرحباً، أود طلب المنتج التالي من متجر RTG:\n- المنتج: ${selectedProduct.name}\n- الفئة: ${selectedProduct.category}\n- الكمية: ${quantity}\n- السعر الإجمالي: ${(selectedProduct.price * quantity).toLocaleString()} د.ل`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Share product link
  const handleShare = () => {
    soundEngine.playButtonClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Discount calculation
  const discountAmount = selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price
    ? selectedProduct.oldPrice - selectedProduct.price
    : null;

  return (
    <div className="py-6 sm:py-10 min-h-screen text-right font-['Cairo',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Breadcrumbs & Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <button
              onClick={() => setCurrentPage('home')}
              className="hover:text-white transition-colors"
            >
              الرئيسية
            </button>
            <span>/</span>
            <button
              onClick={() => setCurrentPage('products')}
              className="hover:text-white transition-colors"
            >
              متجر المعدات
            </button>
            <span>/</span>
            <span className="text-red-400 font-bold">{selectedProduct.category}</span>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-[150px] sm:max-w-xs">{selectedProduct.name}</span>
          </div>

          <button
            id="back-to-products-btn"
            onClick={() => setCurrentPage('products')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرجوع للمنتجات</span>
          </button>
        </div>

        {/* 2. Main Product Display Section (Grid Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT/TOP: Visual Image Gallery Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-2xl group">
              {/* Category & Badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-black rounded-full backdrop-blur-md">
                  {selectedProduct.category}
                </span>
                {selectedProduct.featured && (
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>مميز</span>
                  </span>
                )}
              </div>

              {/* Stock Tag */}
              <div className="absolute top-4 left-4 z-10">
                {selectedProduct.inStock ? (
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>متوفر في المخزن</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    نفذت الكمية
                  </span>
                )}
              </div>

              {/* Product Image */}
              <div className="w-full aspect-square flex items-center justify-center py-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-h-[380px] w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setIsImageZoomed(true)}
                />
              </div>

              {/* Zoom Trigger Button */}
              <button
                onClick={() => setIsImageZoomed(true)}
                className="absolute bottom-4 left-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all text-xs flex items-center gap-1.5"
                title="تكبير الصورة"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">معاينة بالحجم الكامل</span>
              </button>
            </div>

            {/* Guaranteed Trust Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#12141e] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">أصلي ومضمون 100%</h4>
                  <p className="text-[10px] text-slate-400">جودة عالية مفحوصة بدقة</p>
                </div>
              </div>

              <div className="bg-[#12141e] border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">توصيل سريع بليبيا</h4>
                  <p className="text-[10px] text-slate-400">خلال 24-48 ساعة لباب بيتك</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details, Pricing, Actions & Instant Delivery (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header: Title & Share */}
            <div className="bg-[#12141e] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>فئة: {selectedProduct.category}</span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                    {selectedProduct.name}
                  </h1>
                </div>

                <button
                  onClick={handleShare}
                  className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl border border-white/10 transition-all flex-shrink-0 relative"
                  title="مشاركة رابط المنتج"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                      تم نسخ الرابط!
                    </span>
                  )}
                </button>
              </div>

              {/* Price Box */}
              <div className="bg-[#181b28] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">السعر النهائي للقطعة:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {selectedProduct.price.toLocaleString()}
                    </span>
                    <span className="text-sm font-black text-red-500 font-sans">د.ل (دينار ليبي)</span>
                  </div>
                  {selectedProduct.oldPrice && selectedProduct.oldPrice > selectedProduct.price && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {selectedProduct.oldPrice.toLocaleString()} د.ل
                      </span>
                      {discountAmount && (
                        <span className="text-[11px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold">
                          وفرت {discountAmount.toLocaleString()} د.ل
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex flex-col items-center sm:items-end gap-1.5">
                  <span className="text-xs text-slate-400 font-bold">الكمية المطلوبة:</span>
                  <div className="flex items-center bg-[#12141e] border border-white/15 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !selectedProduct.inStock}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-white text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={!selectedProduct.inStock}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Add to Cart */}
                  <button
                    id="product-detail-add-cart-btn"
                    onClick={handleAddToCart}
                    disabled={!selectedProduct.inStock}
                    className={`py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      addedToCart
                        ? 'bg-emerald-600 text-white shadow-emerald-950/60'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>تمت الإضافة للسلة بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>إضافة إلى السلة ({quantity})</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now Direct */}
                  <button
                    id="product-detail-buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={!selectedProduct.inStock}
                    className="py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm bg-white text-black hover:bg-slate-200 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 text-red-600 fill-red-600" />
                    <span>شراء مباشر الآن</span>
                  </button>
                </div>

                {/* WhatsApp Direct Order Button */}
                <button
                  id="product-detail-whatsapp-btn"
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>طلب مباشر أو استفسار عبر واتساب</span>
                </button>
              </div>

              {/* Description Section */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span>تفاصيل ووصف المنتج:</span>
                </h3>
                <div className="bg-[#181b28]/60 border border-white/5 rounded-2xl p-4 text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                  {selectedProduct.description || 'معدة ألعاب احترافية أصلية وعالية الأداء تم اختيارها بعناية لتلبي احتياجات اللاعبين وصناع المحتوى، مع أداء فائق وتصميم مميز وضمان كامل.'}
                </div>
              </div>

              {/* Mini Delivery Calculator Widget for this Product */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-red-500" />
                    <span>استعلم عن سعر التوصيل لمدينتك:</span>
                  </h3>
                  <button
                    onClick={() => setCurrentPage('delivery_rates')}
                    className="text-[11px] text-red-400 hover:text-red-300 hover:underline font-bold"
                  >
                    عرض كل المدن
                  </button>
                </div>

                <div className="bg-[#181b28] border border-white/10 p-4 rounded-2xl space-y-3">
                  <select
                    id="product-city-delivery-select"
                    value={selectedCityId}
                    onChange={(e) => {
                      soundEngine.playButtonClick();
                      setSelectedCityId(e.target.value);
                    }}
                    className="w-full bg-[#12141e] border border-white/15 focus:border-red-500 rounded-xl py-2.5 px-3 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="">-- اضغط لاختيار مدينتك لمعرفة سعر ومدة التوصيل --</option>
                    {deliveryRates.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        📍 {rate.name} ({rate.zoneName})
                      </option>
                    ))}
                  </select>

                  {selectedCityRate && (
                    <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-white block">
                          توصيل إلى {selectedCityRate.name} ({selectedCityRate.zoneName})
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>المدة التقريبية: {selectedCityRate.estimatedTime || '24 - 48 ساعة'}</span>
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-black text-red-400 font-mono">
                          {selectedCityRate.priceDisplay || `${selectedCityRate.price} د.ل`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-white/10 pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <span>منتجات أخرى قد تعجبك</span>
              </h3>
              <button
                onClick={() => setCurrentPage('products')}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <span>تصفح الكل</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 4. Fullscreen Zoom Image Lightbox Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute -top-12 right-0 sm:-right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              title="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-3 text-center">
              <h4 className="text-white font-bold text-sm">{selectedProduct.name}</h4>
              <p className="text-slate-400 text-xs">{selectedProduct.price} د.ل • {selectedProduct.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
