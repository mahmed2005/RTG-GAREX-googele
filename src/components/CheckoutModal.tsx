import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    cities,
    submitGearOrder,
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'كاش' | 'تحويل مصرفي'>('كاش');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCheckoutOpen) return null;

  const currentCityObj = cities.find((c) => c.name === selectedCity);
  const regionsList = currentCityObj ? currentCityObj.regions : [];

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedRegion('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف');
      return;
    }

    // Libyan phone validation check (usually 10 digits starting with 09)
    if (phone.length < 8) {
      setErrorMsg('يرجى إدخال رقم هاتف صحيح (مثال: 09XXXXXXXX)');
      return;
    }

    if (!selectedCity) {
      setErrorMsg('يرجى اختيار المدينة');
      return;
    }

    if (!selectedRegion) {
      setErrorMsg('يرجى اختيار المنطقة');
      return;
    }

    submitGearOrder({
      name: name.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      city: selectedCity,
      region: selectedRegion,
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
        className="relative w-full max-w-lg bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 text-right z-10 my-8"
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
        <div className="mb-5 p-3 rounded-2xl bg-[#171a26] border border-white/5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold">محتويات السلة ({cart.length} منتج):</span>
          </div>
          <span className="font-bold text-red-400 font-mono text-sm">
            {cartTotal} د.ل
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
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الاسم الكامل (بالعربي فقط)
            </label>
            <input
              id="checkout-input-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="...أدخل اسمك بالكامل"
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          {/* Phone Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم الهاتف
              </label>
              <input
                id="checkout-input-phone"
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                رقم احتياطي (اختياري)
              </label>
              <input
                id="checkout-input-altphone"
                type="tel"
                dir="ltr"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all"
              />
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              المدينة
            </label>
            <select
              id="checkout-select-city"
              required
              value={selectedCity}
              onChange={handleCityChange}
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all cursor-pointer"
            >
              <option value="">...اختر المدينة</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name} className="bg-[#11131c]">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              المدينة / المنطقة
            </label>
            <select
              id="checkout-select-region"
              required
              disabled={!selectedCity}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">
                {selectedCity ? '...اختر المنطقة' : 'اختر المدينة أولاً'}
              </option>
              {regionsList.map((region) => (
                <option key={region} value={region} className="bg-[#11131c]">
                  {region}
                </option>
              ))}
            </select>
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
                <span>كاش</span>
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-semibold">:إجمالي الطلب</span>
              <span className="text-xl font-black text-red-500 font-mono">
                د.ل {cartTotal.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              id="submit-order-whatsapp-btn"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>إرسال الطلب عبر واتساب</span>
            </button>

            <p className="text-[11px] text-center text-slate-500">
              سيتم تحويلك لواتساب لإرسال الطلب مباشرة
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
