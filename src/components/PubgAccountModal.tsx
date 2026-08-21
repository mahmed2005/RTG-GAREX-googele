import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PubgVideoPlayer } from './PubgVideoPlayer';
import { X, MessageCircle, ShieldCheck, UserCheck } from 'lucide-react';

export const PubgAccountModal: React.FC = () => {
  const { selectedAccountForBuy, setSelectedAccountForBuy, submitAccountOrder } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!selectedAccountForBuy) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Letters only (Arabic & English)
    const filtered = e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
    setName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Digits only
    const filtered = e.target.value.replace(/\D/g, '');
    setPhone(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    submitAccountOrder(selectedAccountForBuy, {
      name: name.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="account-modal-backdrop"
        onClick={() => setSelectedAccountForBuy(null)}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div
        id="account-modal-card"
        className="relative w-full max-w-md bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-6 text-right z-10 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <button
            id="close-account-modal-btn"
            onClick={() => setSelectedAccountForBuy(null)}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-bold text-white">شراء حساب PUBG</h3>
          </div>
        </div>

        {/* Account Info Box & Video Player */}
        <div className="bg-[#181b27] border border-white/5 rounded-2xl overflow-hidden space-y-2.5 mb-5">
          {selectedAccountForBuy.videoUrl && (
            <PubgVideoPlayer
              videoUrl={selectedAccountForBuy.videoUrl}
              thumbnailUrl={selectedAccountForBuy.image}
              title={selectedAccountForBuy.title}
              badge={selectedAccountForBuy.badge}
              level={selectedAccountForBuy.level}
            />
          )}
          
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold">
                {selectedAccountForBuy.badge} • {selectedAccountForBuy.level}
              </span>
              <span className="text-lg font-black text-red-500 font-mono">
                {selectedAccountForBuy.price.toLocaleString()} د.ل
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {selectedAccountForBuy.title}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>حساب مفحوص ومضمون مع تسليم مباشر</span>
            </div>
          </div>
        </div>

        {/* Buyer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">حروف فقط</span>
              <label className="text-xs font-bold text-slate-300">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="account-input-name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="...أدخل اسمك"
              className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-3 px-4 text-white text-sm placeholder:text-slate-500 outline-none transition-all text-right"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">أرقام فقط</span>
              <label className="text-xs font-bold text-slate-300">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
            </div>
            <input
              id="account-input-phone"
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

          <p className="text-[11px] text-slate-400 leading-relaxed">
            عند النقر على الزر، سيتم فتح محادثة واتساب مع المتجر لتأكيد بيانات الحساب وإتمام تحويل الملكية بشكل فوري وآمن.
          </p>

          <button
            type="submit"
            id="submit-buy-account-btn"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>متابعة الشراء عبر واتساب</span>
          </button>
        </form>
      </div>
    </div>
  );
};
