import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, MessageCircle, Sparkles, AlertCircle, CheckCircle2, Video, DollarSign, ShieldAlert, PhoneCall } from 'lucide-react';
import { PubgSellSubmission } from '../types';

export const SellAccountModal: React.FC = () => {
  const { isSellAccountOpen, setIsSellAccountOpen, submitSellAccount } = useStore();

  // Form Fields as explicitly requested
  const [fullName, setFullName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountLevel, setAccountLevel] = useState('');
  const [mythicsCount, setMythicsCount] = useState('');
  const [powerLevel, setPowerLevel] = useState('');
  const [goldenMythicsCount, setGoldenMythicsCount] = useState('');
  const [upgradableWeapons, setUpgradableWeapons] = useState('');
  const [carsCount, setCarsCount] = useState('');
  const [hashtagsCount, setHashtagsCount] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [phone, setPhone] = useState('');
  const [transferPhone, setTransferPhone] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Agreement Checkbox
  const [isOwnerConfirmed, setIsOwnerConfirmed] = useState(false);
  const [isFeeConfirmed, setIsFeeConfirmed] = useState(false);

  if (!isSellAccountOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !salePrice.trim() || !transferPhone.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة ورقم الهاتف المحول منه الـ 5 ليرات.');
      return;
    }

    if (!isOwnerConfirmed || !isFeeConfirmed) {
      alert('يرجى تأكيد ملكيتك للحساب وتأكيد تحويل رسوم العرض (5 ليرات).');
      return;
    }

    const submission: Omit<PubgSellSubmission, 'id' | 'date' | 'status'> = {
      fullName: fullName.trim(),
      accountName: accountName.trim(),
      accountLevel: accountLevel.trim(),
      mythicsCount: mythicsCount.trim(),
      powerLevel: powerLevel.trim(),
      goldenMythicsCount: goldenMythicsCount.trim(),
      upgradableWeapons: upgradableWeapons.trim(),
      carsCount: carsCount.trim(),
      hashtagsCount: hashtagsCount.trim(),
      linkedAccounts: linkedAccounts.trim(),
      salePrice: salePrice.trim(),
      phone: phone.trim(),
      transferPhone: transferPhone.trim(),
      videoUrl: videoUrl.trim(),
    };

    submitSellAccount(submission);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="sell-modal-backdrop"
        onClick={() => setIsSellAccountOpen(false)}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="sell-account-modal-card"
        className="relative w-full max-w-2xl bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-right z-10 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 sticky top-0 bg-[#11131c] z-20">
          <button
            id="close-sell-modal-btn"
            onClick={() => setIsSellAccountOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h3 className="text-xl font-bold text-white">طلب عرض حساب PUBG للبيع</h3>
          </div>
        </div>

        {/* ⚠️ Mandatory Conditions Banner */}
        <div className="space-y-3 mb-6 p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-slate-300 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>شروط ومتطلبات عرض الحساب في المتجر:</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300 font-medium">
            <li><strong className="text-white">الشرط الأول:</strong> يجب أن يكون الحساب مملوكاً لك شخصياً.</li>
            <li><strong className="text-white">الشرط الثاني:</strong> تعبئة جميع بيانات الحساب بدقة وأمانة.</li>
            <li>
              <strong className="text-white">رسوم العرض:</strong> يتم تحويل قيمة <strong className="text-amber-400 underline">5 ليرات</strong> إلى الرقم: <span className="text-red-400 font-mono font-bold text-sm" dir="ltr">0943981577</span> قبل عرض الحساب.
            </li>
            <li>
              <strong className="text-white">فيديو الحساب:</strong> فيديو توضيحي لمحتويات الحساب لا يتجاوز <strong className="text-amber-400">40 ثانية</strong>.
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الاسم الثلاثي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد علي أحمد..."
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                اسم الحساب داخل اللعبة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="KING亗GHOST..."
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* 2. Account Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                مستوى الحساب (Level) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountLevel}
                onChange={(e) => setAccountLevel(e.target.value)}
                placeholder="مثال: 78"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                مستوى القوة
              </label>
              <input
                type="text"
                value={powerLevel}
                onChange={(e) => setPowerLevel(e.target.value)}
                placeholder="مثال: 6500"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عدد الميثيك العادي
              </label>
              <input
                type="text"
                value={mythicsCount}
                onChange={(e) => setMythicsCount(e.target.value)}
                placeholder="مثال: 45 ميثيك"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عدد الميثيك الذهبي
              </label>
              <input
                type="text"
                value={goldenMythicsCount}
                onChange={(e) => setGoldenMythicsCount(e.target.value)}
                placeholder="مثال: 3 بدلات"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عدد الأسلحة القابلة للتطوير
              </label>
              <input
                type="text"
                value={upgradableWeapons}
                onChange={(e) => setUpgradableWeapons(e.target.value)}
                placeholder="مثال: 12 سلاح (ام فور ثلجي ماكس...)"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عدد سكنات السيارات
              </label>
              <input
                type="text"
                value={carsCount}
                onChange={(e) => setCarsCount(e.target.value)}
                placeholder="مثال: 4 سيارات (داسيا، لمبرجيني...)"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عدد الهاشتاجات والألقاب
              </label>
              <input
                type="text"
                value={hashtagsCount}
                onChange={(e) => setHashtagsCount(e.target.value)}
                placeholder="مثال: 8 هاشتاجات نادرة"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                روابط ربط الحساب (Phone, Gmail, iCloud, FB...) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={linkedAccounts}
                onChange={(e) => setLinkedAccounts(e.target.value)}
                placeholder="مثال: جيميل + فيسبوك متاح، الباقي متاح"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none"
              />
            </div>
          </div>

          {/* 3. Pricing and Phones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                سعر البيع المطلوب (دينار ليبي) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="1500"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                رقم هاتفك للتواصل <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm text-right font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                الرقم المحول منه 5 ليرات <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={transferPhone}
                onChange={(e) => setTransferPhone(e.target.value)}
                placeholder="الرقم الذي حولت منه..."
                className="w-full bg-[#181b27] border border-amber-500/40 focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-amber-300 text-sm text-right font-mono outline-none"
              />
            </div>
          </div>

          {/* 4. Video URL (Under 40 seconds) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300">
                رابط فيديو الحساب (أقل من 40 ثانية)
              </label>
              <span className="text-[10px] text-slate-400">رابط تيك توك، يوتيوب، أو درايف</span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 pl-3.5 pr-10 text-white text-sm font-mono text-left outline-none"
              />
              <Video className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Agreements */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={isOwnerConfirmed}
                onChange={(e) => setIsOwnerConfirmed(e.target.checked)}
                className="w-4 h-4 rounded accent-red-600 bg-[#181b27] border-white/20"
              />
              <span className="text-xs text-slate-300 font-medium">
                أقر وأتعهد بأن الحساب ملكي شخصياً وتفاصيله المذكورة صحيحة بالكامل.
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={isFeeConfirmed}
                onChange={(e) => setIsFeeConfirmed(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 bg-[#181b27] border-white/20"
              />
              <span className="text-xs text-slate-300 font-medium">
                تم تحويل رسوم العرض (5 ليرات) إلى الرقم <span className="text-amber-400 font-mono font-bold" dir="ltr">0943981577</span>.
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              id="submit-sell-to-whatsapp-btn"
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>إرسال بيانات الحساب وإيصال التحويل للمتجر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

