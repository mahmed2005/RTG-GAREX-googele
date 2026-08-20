import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  MessageCircle, 
  Sparkles, 
  Upload, 
  Video, 
  ShieldAlert, 
  CheckCircle2, 
  Film, 
  Trash2,
  Loader2 
} from 'lucide-react';
import { PubgSellSubmission } from '../types';

export const SellAccountModal: React.FC = () => {
  const { isSellAccountOpen, setIsSellAccountOpen, submitSellAccount } = useStore();

  // Form Fields
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

  // Video File Upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoBase64, setVideoBase64] = useState<string>('');
  const [fallbackVideoUrl, setFallbackVideoUrl] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agreement Checkbox
  const [isOwnerConfirmed, setIsOwnerConfirmed] = useState(false);
  const [isFeeConfirmed, setIsFeeConfirmed] = useState(false);

  if (!isSellAccountOpen) return null;

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if video
    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو صالح بصيغة MP4 أو WebM أو MOV');
      return;
    }

    // Size limit warning (> 35MB)
    if (file.size > 35 * 1024 * 1024) {
      alert('حجم الفيديو كبير جداً. يرجى اختيار فيديو استعراض مدته أقل من 40 ثانية وبحجم أقل من 35 ميجابايت.');
      return;
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Read as Base64 for Google Apps Script / Drive storage
    setIsProcessingVideo(true);
    const reader = new FileReader();
    reader.onload = () => {
      setVideoBase64(reader.result as string);
      setIsProcessingVideo(false);
    };
    reader.onerror = () => {
      alert('حدث خطأ أثناء قراءة ملف الفيديو');
      setIsProcessingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl('');
    setVideoBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !salePrice.trim() || !transferPhone.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة ورقم الهاتف المحول منه الـ 5 ليرات.');
      return;
    }

    if (!videoFile && !fallbackVideoUrl.trim()) {
      alert('يرجى رفع ملف فيديو استعراض الحساب (أو وضع رابط فيديو).');
      return;
    }

    if (!isOwnerConfirmed || !isFeeConfirmed) {
      alert('يرجى تأكيد ملكيتك للحساب وتأكيد تحويل رسوم العرض (5 ليرات).');
      return;
    }

    setIsSubmitting(true);

    try {
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
        videoUrl: fallbackVideoUrl.trim() || (videoFile ? `[فيديو مرفوع: ${videoFile.name}]` : ''),
        videoFileBase64: videoBase64,
        videoFileName: videoFile?.name,
        videoMimeType: videoFile?.type,
      };

      submitSellAccount(submission);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="sell-modal-backdrop"
        onClick={() => !isSubmitting && setIsSellAccountOpen(false)}
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
            disabled={isSubmitting}
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
            <li><strong className="text-white">الشرط الأول:</strong> يجب أن يكون الحساب ملكك شخصياً.</li>
            <li><strong className="text-white">الشرط الثاني:</strong> تعبئة جميع بيانات الحساب بدقة وأمانة.</li>
            <li>
              <strong className="text-white">رسوم العرض:</strong> يتم تحويل قيمة <strong className="text-amber-400 underline">5 ليرات</strong> إلى الرقم: <span className="text-red-400 font-mono font-bold text-sm" dir="ltr">0943981577</span> قبل عرض الحساب.
            </li>
            <li>
              <strong className="text-white">فيديو الحساب:</strong> قم برفع ملف فيديو استعراض الحساب مباشرة (أقل من <strong className="text-amber-400">40 ثانية</strong>).
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الأسلحة القابلة للتطوير
              </label>
              <input
                type="text"
                value={upgradableWeapons}
                onChange={(e) => setUpgradableWeapons(e.target.value)}
                placeholder="مثال: 12 سلاح (ام فور ثلجي ماكس...)"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                سكنات السيارات
              </label>
              <input
                type="text"
                value={carsCount}
                onChange={(e) => setCarsCount(e.target.value)}
                placeholder="مثال: 4 سيارات (داسيا، لمبرجيني...)"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الهاشتاجات والألقاب
              </label>
              <input
                type="text"
                value={hashtagsCount}
                onChange={(e) => setHashtagsCount(e.target.value)}
                placeholder="مثال: 8 هاشتاجات نادرة"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                روابط ربط الحساب (Phone, Gmail, Twitter...) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={linkedAccounts}
                onChange={(e) => setLinkedAccounts(e.target.value)}
                placeholder="مثال: جيميل + فيسبوك متاح، الباقي فارغ"
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm font-mono outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-white/10 focus:border-red-500 rounded-xl py-2.5 px-3.5 text-white text-sm text-right font-mono outline-none transition-colors"
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
                className="w-full bg-[#181b27] border border-amber-500/40 focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-amber-300 text-sm text-right font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* 4. Direct Video File Upload */}
          <div className="p-4 rounded-2xl bg-[#141724] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-white">
                <Video className="w-4 h-4 text-red-500" />
                <span>رفع فيديو استعراض الحساب (ملف كامل)</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-amber-400 font-medium">أقل من 40 ثانية (MP4 / WebM / MOV)</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/mov,video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />

            {!videoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-red-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-white/[0.02] flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">اضغط لاختيار فيديو من جهازك أو اسحبه هنا</div>
                <p className="text-xs text-slate-400">سيتم حفظ الفيديو تلقائياً في السيرفر وGoogle Drive وربطه بالحساب</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">{videoFile.name}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • جاهز للرفع والتخزين
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedVideo}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="حذف الفيديو"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Video Player Preview */}
                {videoPreviewUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-h-48 flex items-center justify-center">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {isProcessingVideo && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري معالجة وتجهيز الفيديو للرفع إلى Google Drive...</span>
              </div>
            )}
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
              disabled={isSubmitting || isProcessingVideo}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري إرسال البيانات وحفظ الفيديو...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>إرسال بيانات الحساب مع الفيديو وإيصال الـ 5 ليرات للمتجر</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
