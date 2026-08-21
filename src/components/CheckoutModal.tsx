import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { LIBYAN_CITIES_LIST } from '../data/libyanCities';
import { findDeliveryRate } from '../data/deliveryData';
import { X, MessageCircle, AlertCircle, FileText, Truck, Clock, ExternalLink } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    submitGearOrder,
    setCurrentPage,
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'كاش' | 'تحويل مصرفي'>('كاش');
  const [errorMsg, setErrorMsg] = useState('');

  // Determine delivery rate based on selected city
  const cityDeliveryRate = useMemo(() => {
    if (!selectedCity) return null;
    return findDeliveryRate(selectedCity);
  }, [selectedCity]);

  if (!isCheckoutOpen) return null;

  // Real-time Input Handlers with Strict Validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow Arabic letters, English letters, and spaces only (No numbers or special symbols)
    const filtered = val.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
    setName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits only (0-9)
    const filtered = val.replace(/\D/g, '');
    setPhone(filtered);
  };

  const handleAltPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits only (0-9)
    const filtered = val.replace(/\D/g, '');
    setAltPhone(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل (حروف فقط)');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف (أرقام فقط)');
      return;
    }

    // Libyan phone validation check (9 to 12 digits)
    if (phone.length < 9 || phone.length > 12) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح (مثال: 091XXXXXXX أو 092XXXXXXX)');
      return;
    }

    if (altPhone && (altPhone.length < 9 || altPhone.length > 12)) {
      setErrorMsg('الرقم الاحتياطي غير صحيح، يرجى كتابة رقم هاتف صالح أو تركه فارغاً');
      return;
    }

    if (!selectedCity) {
      setErrorMsg('يرجى اختيار المدينة من القائمة');
      return;
    }

    submitGearOrder({
      name: name.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      city: selectedCity,
      region: addressDetails.trim() || selectedCity,
      deliveryFee: cityDeliveryRate ? cityDeliveryRate.priceDisplay : undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="checkout-modal-backdrop"
        onClick={() => setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="checkout-modal-card"
        className="relative w-full max-w-lg bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 text-right z-10 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <button
            id="close-checkout-modal-btn"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold text-white">تأكيد الطلب</h3>
        </div>

        {/* Order Preview Items Pill */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#171a26] border border-white/5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold">محتويات السلة ({cart.length} منتج):</span>
          </div>
          <span className="font-bold text-red-400 font-mono text-sm">
            {cartTotal.toLocaleString()} د.ل
          </span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name - Letters Only */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">حروف فقط</span>
              <label className="text-xs font-bold text-slate-300">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="checkout-input-name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="مثال: محمد علي الفرجاني"
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none transition-all text-right"
            />
          </div>

          {/* Phone Numbers Grid - Digits Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500">أرقام فقط</span>
                <label className="text-xs font-bold text-slate-300">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                id="checkout-input-phone"
                type="tel"
                inputMode="numeric"
                required
                dir="ltr"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-500">أرقام فقط</span>
                <label className="text-xs font-bold text-slate-400">
                  رقم احتياطي (اختياري)
                </label>
              </div>
              <input
                id="checkout-input-altphone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                value={altPhone}
                onChange={handleAltPhoneChange}
                placeholder="09XXXXXXXX"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all"
              />
            </div>
          </div>

          {/* Single Consolidated Libyan City Selection List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setCurrentPage('delivery_rates');
                }}
                className="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-bold"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>جدول أسعار التوصيل</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <label className="text-xs font-bold text-slate-300">
                المدينة / المنطقة <span className="text-red-500">*</span>
              </label>
            </div>

            <select
              id="checkout-select-city"
              required
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all cursor-pointer text-right"
            >
              <option value="" className="bg-[#11131c]">...اختر مدينتك أو منطقتك من القائمة</option>
              {LIBYAN_CITIES_LIST.map((city) => (
                <option key={city} value={city} className="bg-[#11131c]">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Delivery Rate Preview Badge */}
          {cityDeliveryRate && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#181b28] to-red-950/40 border border-red-500/30 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Truck className="w-3.5 h-3.5 text-red-500" />
                  <span>توصيل لـ {cityDeliveryRate.name}:</span>
                  <span className="text-red-400 font-mono font-bold">{cityDeliveryRate.priceDisplay}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>المنطقة: {cityDeliveryRate.zoneName}</span>
                  {cityDeliveryRate.estimatedTime && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>المدة: {cityDeliveryRate.estimatedTime}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-red-600/20 text-red-400 font-bold text-[11px] font-mono border border-red-500/30">
                {cityDeliveryRate.priceDisplay}
              </span>
            </div>
          )}

          {/* Detailed Address (Street/Neighborhood) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              تفاصيل العنوان / الشارع (اختياري)
            </label>
            <input
              id="checkout-input-address"
              type="text"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="مثال: بالقرب من مسجد القدس، شارع النصر"
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none transition-all text-right"
            />
          </div>

          {/* Order Notes Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">ألوان، مواعيد، أو توضيحات خاصة</span>
              <span className="flex items-center gap-1">
                <span>ملاحظات إضافية على الطلب (اختياري)</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </label>
            <textarea
              id="checkout-input-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظة أو طلب خاص هنا..."
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-all text-right resize-none custom-scrollbar"
            />
          </div>

          {/* Payment Method Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="payment-method-cash"
                onClick={() => setPaymentMethod('كاش')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  paymentMethod === 'كاش'
                    ? 'border-red-500 bg-red-600/10 text-white shadow-lg shadow-red-950/40'
                    : 'border-white/10 bg-[#181b27] text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span>كاش عند الاستلام</span>
                <span className="text-base">💵</span>
              </button>
              <button
                type="button"
                id="payment-method-bank"
                onClick={() => setPaymentMethod('تحويل مصرفي')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                  paymentMethod === 'تحويل مصرفي'
                    ? 'border-red-500 bg-red-600/10 text-white shadow-lg shadow-red-950/40'
                    : 'border-white/10 bg-[#181b27] text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span>تحويل مصرفي</span>
                <span className="text-base">💳</span>
              </button>
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>إجمالي المنتجات:</span>
                <span className="font-mono font-bold text-slate-200">{cartTotal.toLocaleString()} د.ل</span>
              </div>
              {cityDeliveryRate && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>سعر التوصيل ({selectedCity}):</span>
                  <span className="font-mono font-bold text-red-400">+{cityDeliveryRate.priceDisplay}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
              <span className="text-slate-300 font-bold">الإجمالي المتوقع:</span>
              <span className="text-xl font-black text-red-500 font-mono">
                {typeof cityDeliveryRate?.price === 'number'
                  ? `${(cartTotal + cityDeliveryRate.price).toLocaleString()} د.ل`
                  : `${cartTotal.toLocaleString()} د.ل ${cityDeliveryRate ? `(+ ${cityDeliveryRate.priceDisplay})` : ''}`}
              </span>
            </div>

            <button
              type="submit"
              id="submit-order-whatsapp-btn"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>إرسال الطلب عبر واتساب</span>
            </button>

            <p className="text-[11px] text-center text-slate-500">
              سيتم تحويلك لواتساب لإرسال الطلب مباشرة مع كافة الملاحظات وسعر التوصيل
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

