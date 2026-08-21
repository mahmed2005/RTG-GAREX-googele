import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ALL_DELIVERY_RATES, DELIVERY_ZONES } from '../data/deliveryData';
import { soundEngine } from '../utils/soundEngine';
import { 
  Truck, 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  MessageCircle, 
  ShoppingBag,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

export const DeliveryRatesPage: React.FC = () => {
  const { setCurrentPage, setIsCartOpen, settings, deliveryRates } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

  // Find the currently selected city for the dropdown option
  const selectedCityRate = useMemo(() => {
    if (!selectedCityId) return null;
    return deliveryRates.find((r) => r.id === selectedCityId) || null;
  }, [deliveryRates, selectedCityId]);

  // Filtered Delivery Rates based on search and selected zone
  const filteredRates = useMemo(() => {
    return deliveryRates.filter((rate) => {
      const matchesSearch =
        !searchQuery.trim() ||
        rate.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        rate.zoneName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        rate.priceDisplay.toLowerCase().includes(searchQuery.trim().toLowerCase());

      const matchesZone =
        selectedZoneId === 'all' || rate.zoneId === selectedZoneId;

      return matchesSearch && matchesZone;
    });
  }, [deliveryRates, searchQuery, selectedZoneId]);

  return (
    <div className="py-8 sm:py-12 min-h-screen text-right font-['Cairo',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Page Header & Delivery Partner Badge */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Partner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold shadow-sm">
            <Truck className="w-4 h-4 text-red-500" />
            <span>شركة درب السبيل لخدمات التوصيل • الإنطلاقة من طرابلس</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            أسعار التوصيل <span className="text-red-500">لكافة المدن الليبية</span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            تعرف على سعر ومدة التوصيل لمدينتك أو منطقتك بكل شفافية وسهولة قبل إتمام الطلب أو التواصل معنا. التوصيل يشمل كافة ربوع ليبيا من طرابلس إلى أقصى الشرق والجنوب.
          </p>
        </div>

        {/* 2. Dual Quick Lookup Module: 1) Dropdown Selector + 2) Direct Search Bar */}
        <div className="max-w-4xl mx-auto bg-[#12141f] border border-white/10 p-5 sm:p-7 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center sm:text-right border-b border-white/10 pb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <span>استعلم عن سعر التوصيل لمدينتك مباشرة</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              اختر مدينتك من القائمة المنسدلة أو اكتب اسمها في شريط البحث لمعرفة القيمة ومدة الوصول فوراً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* METHOD 1: Dropdown Selection */}
            <div className="bg-[#181b28] border border-white/10 p-4 sm:p-5 rounded-2xl space-y-3">
              <label htmlFor="city-dropdown-select" className="block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>1. اختر المدينة من القائمة:</span>
              </label>
              <select
                id="city-dropdown-select"
                value={selectedCityId}
                onChange={(e) => {
                  soundEngine.playButtonClick();
                  setSelectedCityId(e.target.value);
                }}
                className="w-full bg-[#12141e] border border-white/15 focus:border-red-500 rounded-xl py-3 px-4 text-white text-xs sm:text-sm outline-none cursor-pointer"
              >
                <option value="">-- اضغط لاختيار المدينة أو المنطقة --</option>
                {deliveryRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    📍 {rate.name} ({rate.zoneName}) - {rate.priceDisplay}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                بمجرد اختيار المدينة ستظهر تفاصيل وسعر التوصيل بالأسفل مباشرة.
              </p>
            </div>

            {/* METHOD 2: Direct Search Bar */}
            <div className="bg-[#181b28] border border-white/10 p-4 sm:p-5 rounded-2xl space-y-3">
              <label htmlFor="delivery-search-input" className="block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-red-500" />
                <span>2. أو ابحث بالاسم مباشرة:</span>
              </label>
              <div className="relative">
                <input
                  id="delivery-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب اسم المدينة (مثال: بنغازي، الزاوية، مصراتة، سبها)..."
                  className="w-full bg-[#12141e] border border-white/15 focus:border-red-500 rounded-xl py-3 pl-4 pr-10 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all text-right"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
                  >
                    مسح
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                نتائج مطابقة فورية أثناء الكتابة.
              </p>
            </div>
          </div>

          {/* Instant Highlight Box for Dropdown Selection */}
          {selectedCityRate && (
            <div className="bg-gradient-to-r from-red-950/40 via-[#181b28] to-red-950/40 border-2 border-red-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-right">
                  <span className="text-[11px] text-red-400 font-bold bg-red-600/20 px-3 py-1 rounded-full border border-red-500/30">
                    المدينة المحددة: {selectedCityRate.zoneName}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    مدينة {selectedCityRate.name}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>مدة الوصول: {selectedCityRate.estimatedTime || '24 - 48 ساعة'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>توصيل حتى باب المنزل / نقطة استلام</span>
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-[#0e1017] border border-white/15 rounded-2xl p-4 text-center min-w-[180px] shadow-lg flex-shrink-0">
                  <span className="block text-[11px] text-slate-400 font-bold">قيمة التوصيل</span>
                  <span className="text-3xl font-black text-red-400 font-mono tracking-tight block my-1">
                    {selectedCityRate.priceDisplay}
                  </span>
                  <span className="text-[10px] text-slate-500">شامل لكافة أحياء ومناطق المدينة</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCityId('')}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  إلغاء التحديد
                </button>
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setCurrentPage('products');
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all"
                >
                  <span>طلب منتجات إلى {selectedCityRate.name}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] text-slate-400 border-t border-white/5 pt-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>الأسعار رسمية ومحدثة من نظام شركة درب السبيل</span>
            </span>
            <span className="text-slate-500">
              إجمالي المدن المتاحة: <strong className="text-white font-mono">{deliveryRates.length}</strong> مدينة ومنطقة
            </span>
          </div>
        </div>

        {/* 3. Regional Filter Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Filter className="w-4 h-4 text-red-500" />
              <span>تصفية حسب المنطقة الجغرافية:</span>
            </div>
            {selectedZoneId !== 'all' && (
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setSelectedZoneId('all');
                }}
                className="text-[11px] text-red-400 hover:underline font-bold"
              >
                عرض كل المناطق
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setSelectedZoneId('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedZoneId === 'all'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>جميع المناطق ({deliveryRates.length})</span>
            </button>

            {DELIVERY_ZONES.map((zone) => {
              const isSelected = selectedZoneId === zone.id;
              const count = deliveryRates.filter((r) => r.zoneId === zone.id).length;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setSelectedZoneId(zone.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? `${zone.badgeColor} border-current shadow-lg`
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'
                  }`}
                >
                  <span>{zone.name}</span>
                  <span className="mr-1.5 opacity-70 font-mono text-[11px]">({count > 0 ? count : zone.priceDisplay})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Display Modes: Search Results OR Regional Cards Grid */}
        {searchQuery ? (
          /* Search Results View */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>نتائج البحث عن: "{searchQuery}"</span>
              <span className="font-bold text-white">{filteredRates.length} نتيجة</span>
            </div>

            {filteredRates.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#12141e] border border-white/10 space-y-3">
                <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">لم يتم العثور على منطقة بهذا الاسم</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  يرجى التأكد من كتابة اسم المدينة أو المنطقة بشكل صحيح أو التواصل معنا مباشرة عبر واتساب لمعرفة السعر.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-colors"
                >
                  إعادة تعيين البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="p-4 rounded-2xl bg-[#141724] border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between group shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {rate.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pr-6">
                        <span>المنطقة: {rate.zoneName}</span>
                        {rate.estimatedTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{rate.estimatedTime}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 font-mono font-bold text-sm">
                        {rate.priceDisplay}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Structured Regional Zones Grid matching the delivery rate card */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DELIVERY_ZONES.filter((z) => selectedZoneId === 'all' || z.id === selectedZoneId).map((zone) => {
              const zoneRates = deliveryRates.filter((r) => r.zoneId === zone.id);
              const hasCustomRates = zoneRates.length > 0;
              return (
                <div
                  key={zone.id}
                  className={`rounded-3xl border ${zone.borderColor} bg-gradient-to-b ${zone.bgColor} p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xl hover:shadow-2xl transition-all group`}
                >
                  <div className="space-y-4">
                    {/* Zone Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[11px] font-bold mb-1.5 ${zone.badgeColor}`}>
                          {zone.name}
                        </span>
                        <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                          {zone.name}
                        </h3>
                        {zone.description && (
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {zone.description}
                          </p>
                        )}
                      </div>

                      {/* Zone Price Badge */}
                      <div className="text-left flex-shrink-0">
                        <span className="block text-[10px] text-slate-400 font-bold">سعر التوصيل</span>
                        <span className="text-xl font-black text-white font-mono tracking-tight text-red-400">
                          {zone.priceDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Cities Tags Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-2">
                        المدن والمناطق المغطاة ({hasCustomRates ? zoneRates.length : zone.cities.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                        {hasCustomRates ? (
                          zoneRates.map((rate) => (
                            <span
                              key={rate.id}
                              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <span>{rate.name}</span>
                              {rate.price && (
                                <span className="text-[10px] text-red-400 font-mono">({rate.price} د.ل)</span>
                              )}
                            </span>
                          ))
                        ) : (
                          zone.cities.map((city, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 text-xs font-semibold transition-colors"
                            >
                              {city}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Action */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>توصيل مضمون وسريع</span>
                    </span>

                    <button
                      onClick={() => {
                        soundEngine.playButtonClick();
                        setCurrentPage('products');
                      }}
                      className="text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 group/btn"
                    >
                      <span>طلب منتجات</span>
                      <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Delivery Information & Advantages Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-5 rounded-3xl bg-[#12141f] border border-white/10 text-right space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">مواعيد وسرعة التوصيل</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              داخل طرابلس وضواحيها خلال 24 ساعة. المنطقة الغربية والوسطى 24 - 48 ساعة. المنطقة الشرقية والجنوبية 48 - 72 ساعة.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#12141f] border border-white/10 text-right space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">تغليف احترافي وآمن</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              جميع كروت الشاشة، الشاشات، السماعات والمعدات الحساسة يتم تغليفها بطبقات حماية مخصصة لضمان وصولها بحالة المصنع.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#12141f] border border-white/10 text-right space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">طرق دفع مرنة</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              يمكنك الدفع كاش عند استلام الطلب من المندوب مباشرة، أو عبر خدمة التحويل المصرفي المباشر.
            </p>
          </div>
        </div>

        {/* 6. Direct Contact & Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#171926] via-[#1f1624] to-[#171926] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-right shadow-2xl">
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              هل لديك استفسار خاص عن التوصيل أو طلبيات الجملة؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              تواصل مباشرة مع خدمة العملاء عبر واتساب وسنجيبك في ثوانٍ معدودة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              id="delivery-rates-whatsapp-btn"
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('مرحباً RTG Gear X، أرغب في الاستفسار عن أسعار ومدة التوصيل لمنطقتي')}`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>استفسر عبر واتساب</span>
            </a>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setCurrentPage('products');
              }}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>تصفح المنتجات</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
