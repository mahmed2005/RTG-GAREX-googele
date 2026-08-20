import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, MessageCircle, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export const PubgUcModal: React.FC = () => {
  const { selectedUcPackage, setSelectedUcPackage, submitUcOrder } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pubgId, setPubgId] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    name: string;
    phone: string;
    pubgId: string;
    uc: number;
    price: number;
  } | null>(null);

  if (!selectedUcPackage) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val && (val.length < 9 || val.length > 12)) {
      setPhoneError('رقم الهاتف غير صحيح (9-10 أرقام)');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !pubgId.trim()) {
      return;
    }

    if (phone.length < 8) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    setLastOrderDetails({
      name: name.trim(),
      phone: phone.trim(),
      pubgId: pubgId.trim(),
      uc: selectedUcPackage.ucAmount,
      price: selectedUcPackage.price,
    });

    submitUcOrder({
      name: name.trim(),
      phone: phone.trim(),
      pubgId: pubgId.trim(),
      pkg: selectedUcPackage,
    });

    setIsSuccess(true);
  };

  const handleClose = () => {
    setSelectedUcPackage(null);
    setIsSuccess(false);
    setName('');
    setPhone('');
    setPubgId('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="uc-modal-backdrop"
        onClick={handleClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="uc-modal-card"
        className="relative w-full max-w-md bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-6 text-right z-10 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <button
            id="close-uc-modal-btn"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">طلب شدات PUBG</h3>
          </div>
        </div>

        {isSuccess && lastOrderDetails ? (
          /* Success Screen matching the video */
          <div className="text-center py-4 space-y-5 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-black text-white">تم إرسال طلبك!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                سيتواصل معك صاحب المتجر على رقم{' '}
                <span className="text-emerald-400 font-bold font-mono dir-ltr">
                  {lastOrderDetails.phone}
                </span>{' '}
                لإتمام عملية الدفع وإرسال الكود
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-[#171a26] border border-white/10 rounded-2xl p-4 text-xs space-y-2.5 text-right font-sans">
              <div className="flex items-center justify-between text-slate-400">
                <span>الباقة:</span>
                <span className="text-amber-400 font-bold font-mono">
                  {lastOrderDetails.uc} UC
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>السعر:</span>
                <span className="text-red-400 font-bold font-mono">
                  {lastOrderDetails.price} د.ل
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>PUBG ID:</span>
                <span className="text-white font-mono font-bold">
                  {lastOrderDetails.pubgId}
                </span>
              </div>
            </div>

            <button
              id="close-uc-success-btn"
              onClick={handleClose}
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-950/60 transition-colors"
            >
              إغلاق
            </button>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm font-bold text-slate-300">أدخل بياناتك</div>

            {/* Selected Package Badge Banner */}
            <div className="p-3.5 rounded-2xl bg-[#171a26] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">الباقة المختارة</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400">
                  {selectedUcPackage.price} د.ل
                </span>
                <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-lg font-bold font-mono">
                  {selectedUcPackage.ucAmount} UC
                </span>
              </div>
            </div>

            {/* Customer Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الاسم الكامل
              </label>
              <input
                id="uc-input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك بالعربي..."
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none transition-all"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم هاتفك
              </label>
              <input
                id="uc-input-phone"
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="09XXXXXXXX"
                className={`w-full bg-[#181b27] border rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all ${
                  phoneError ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-red-500'
                }`}
              />
              {phoneError && (
                <p className="text-[11px] text-red-400 mt-1 font-sans flex items-center gap-1 justify-end">
                  <span>{phoneError}</span>
                  <AlertCircle className="w-3 h-3" />
                </p>
              )}
            </div>

            {/* PUBG ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                # ID حسابك في PUBG Mobile
              </label>
              <input
                id="uc-input-pubgid"
                type="text"
                required
                dir="ltr"
                value={pubgId}
                onChange={(e) => setPubgId(e.target.value)}
                placeholder="XXXXXXXXXXXXX"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none text-right font-mono transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1 text-right">
                يمكن إيجاد الـ ID في إعدادات حسابك داخل اللعبة
              </p>
            </div>

            {/* Note */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                بعد إرسال الطلب سيتم التواصل معك عبر واتساب لتحديد طريقة الدفع المناسبة (libyana أو حوالة)
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-uc-order-btn"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>إرسال الطلب عبر واتساب</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
