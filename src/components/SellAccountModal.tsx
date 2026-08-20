import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Sparkles, 
  Upload, 
  Video, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2,
  Loader2,
  ExternalLink,
  Star,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { PubgSellSubmission } from '../types';

export const SellAccountModal: React.FC = () => {
  const { isSellAccountOpen, setIsSellAccountOpen, submitSellAccount, settings } = useStore();

  // 17 Form Fields
  const [ownerName, setOwnerName] = useState(''); // 1
  const [accountName, setAccountName] = useState(''); // 2
  const [accountLevel, setAccountLevel] = useState(''); // 3
  const [mythicsCount, setMythicsCount] = useState(''); // 4
  const [apartmentLevel, setApartmentLevel] = useState(''); // 5
  const [goldCount, setGoldCount] = useState(''); // 6
  const [upgradableWeapons, setUpgradableWeapons] = useState(''); // 7
  const [carsCount, setCarsCount] = useState(''); // 8
  const [hashtagsCount, setHashtagsCount] = useState(''); // 9
  const [linkedServices, setLinkedServices] = useState(''); // 10
  const [salePrice, setSalePrice] = useState(''); // 11
  const [sellerPhone, setSellerPhone] = useState(''); // 12
  const [transferPhone, setTransferPhone] = useState(''); // 13
  const storeReceivePhone = settings.transferFeePhone || '0943981577'; // 14
  const [siteRating, setSiteRating] = useState('5'); // 16
  const [isAgreed, setIsAgreed] = useState(false); // 17

  // Video File Upload / URL (Field 15)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoBase64, setVideoBase64] = useState<string>('');
  const [fallbackVideoUrl, setFallbackVideoUrl] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSellAccountOpen) return null;

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو صالح بصيغة MP4 أو WebM أو MOV');
      return;
    }

    if (file.size > 35 * 1024 * 1024) {
      alert('حجم الفيديو كبير جداً. يرجى اختيار فيديو استعراض مدته أقل من 40 ثانية وبحجم أقل من 35 ميجابايت.');
      return;
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

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
    if (!ownerName.trim() || !accountName.trim() || !sellerPhone.trim() || !salePrice.trim() || !transferPhone.trim()) {
      alert('يرجى ملء جميع الحقول الإلزامية ورقم الهاتف المحول منه الـ 5 دينار.');
      return;
    }

    if (!videoFile && !fallbackVideoUrl.trim()) {
      alert('يرجى إرفاق فيديو الحساب (أقل من 40 ثانية) أو رابط الفيديو.');
      return;
    }

    if (!isAgreed) {
      alert('يرجى الموافقة على الشروط وتأكيد تحويل رسوم العرض (5 دينار).');
      return;
    }

    setIsSubmitting(true);

    try {
      const submission: Omit<PubgSellSubmission, 'id' | 'date' | 'status'> = {
        ownerName: ownerName.trim(),
        accountName: accountName.trim(),
        accountLevel: accountLevel.trim() || '60',
        mythicsCount: mythicsCount.trim() || '0',
        apartmentLevel: apartmentLevel.trim() || '',
        goldCount: goldCount.trim() || '0',
        upgradableWeapons: upgradableWeapons.trim() || '',
        carsCount: carsCount.trim() || '0',
        hashtagsCount: hashtagsCount.trim() || '0',
        linkedServices: linkedServices.trim() || 'جيميل / رقم هاتف',
        salePrice: salePrice.trim(),
        sellerPhone: sellerPhone.trim(),
        transferPhone: transferPhone.trim(),
        storeReceivePhone: storeReceivePhone,
        videoUrl: fallbackVideoUrl.trim() || (videoFile ? `[فيديو مرفوع: ${videoFile.name}]` : ''),
        videoFileBase64: videoBase64,
        videoFileName: videoFile?.name,
        videoMimeType: videoFile?.type,
        siteRating: siteRating,
        displayOnSite: 'لا', // Default to 'لا' in sheet until admin verifies 5 LYD and clicks approve
      };

      submitSellAccount(submission);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        id="sell-modal-backdrop"
        onClick={() => !isSubmitting && setIsSellAccountOpen(false)}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-2xl bg-[#12141e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 my-6 text-right">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-b from-red-600/20 via-transparent to-transparent border-b border-white/5 flex items-center justify-between">
          <button
            id="close-sell-modal-btn"
            onClick={() => setIsSellAccountOpen(false)}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 justify-end">
                <span>عرض حساب PUBG للبيع</span>
                <Sparkles className="w-5 h-5 text-red-500" />
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                املأ الـ 17 بياناً وسيتم تسجيل حسابك في Google Sheets واعتماده للعرض
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Direct Google Forms Link Banner */}
        <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
          <a
            href={settings.googleFormUrl || 'https://forms.gle/LCS6CgXUWciHH21k8'}
            target="_blank"
            rel="noreferrer"
            id="open-google-form-link"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md flex-shrink-0"
          >
            <span>فتح Google Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="text-slate-300 text-right">
            <span className="font-bold text-purple-300 block">نموذج Google Form المباشر:</span>
            <span>يمكنك أيضاً تعبئة النموذج عبر الرابط المعتمد مباشرة</span>
          </div>
        </div>

        {/* 5 LYD Fee Notice Banner */}
        <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-right flex-1">
            <span className="font-bold block">رسوم عرض الحساب: 5 دينار ليبي فقط</span>
            <span>يتم تحويل الـ 5 دينار إلى الرقم <strong className="text-white font-mono px-1 bg-black/40 rounded">{storeReceivePhone}</strong> ثم كتابة رقمك المحول منه بالأسفل.</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                1. اسم المالك (الاسم الثلاثي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="مثال: محمد أحمد علي"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                2. اسم الحساب المراد بيعه (In-Game Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="مثال: 〆KING〆 أو NOOB_KILLER"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>
          </div>

          {/* Section 2: Levels & Mythics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                3. مستوى الحساب <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountLevel}
                onChange={(e) => setAccountLevel(e.target.value)}
                placeholder="مثال: 78"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                4. عدد المثكات <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mythicsCount}
                onChange={(e) => setMythicsCount(e.target.value)}
                placeholder="مثال: 55"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                5. مستوى الشقة / الروم
              </label>
              <input
                type="text"
                value={apartmentLevel}
                onChange={(e) => setApartmentLevel(e.target.value)}
                placeholder="مثال: لفل 15 أو لا يوجد"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                6. مقاييس الذهب / ميثيك ذهبي
              </label>
              <input
                type="text"
                value={goldCount}
                onChange={(e) => setGoldCount(e.target.value)}
                placeholder="مثال: 3 قطع"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>
          </div>

          {/* Section 3: Weapons, Cars, Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                7. أسلحة قيد التطوير
              </label>
              <input
                type="text"
                value={upgradableWeapons}
                onChange={(e) => setUpgradableWeapons(e.target.value)}
                placeholder="مثال: M4 جوكر ماكس، اوم لفل 4"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                8. عدد السيارات
              </label>
              <input
                type="text"
                value={carsCount}
                onChange={(e) => setCarsCount(e.target.value)}
                placeholder="مثال: لمبرجيني، جيب، بوجاتي"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                9. الهاشتاجات والألقاب
              </label>
              <input
                type="text"
                value={hashtagsCount}
                onChange={(e) => setHashtagsCount(e.target.value)}
                placeholder="مثال: مصير مميز، كونكيرور"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>
          </div>

          {/* Section 4: Links & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                10. خدمات الربط (فيسبوك، جيميل، هاتف، آي كلاود) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={linkedServices}
                onChange={(e) => setLinkedServices(e.target.value)}
                placeholder="مثال: جيميل متاح، فيسبوك ملغي، هاتف متاح"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                11. سعر بيع الحساب (دينار ليبي) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="مثال: 1250"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right font-mono"
              />
            </div>
          </div>

          {/* Section 5: Phones & Transfer verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                12. رقم هاتف البائع <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="091XXXXXXX"
                className="w-full bg-[#171a26] border border-white/10 focus:border-red-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                13. الرقم المحول منه الـ 5 دينار <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={transferPhone}
                onChange={(e) => setTransferPhone(e.target.value)}
                placeholder="رقم هاتفك الذي حولت منه"
                className="w-full bg-[#171a26] border border-amber-500/40 focus:border-amber-500 rounded-xl p-3 text-xs sm:text-sm text-white outline-none text-right font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                14. رقم تحويل الـ 5 دينار إليه
              </label>
              <input
                type="text"
                disabled
                value={storeReceivePhone}
                className="w-full bg-[#0d0f17] border border-white/5 rounded-xl p-3 text-xs sm:text-sm text-amber-400 outline-none text-right font-mono cursor-not-allowed font-bold"
              />
            </div>
          </div>

          {/* Section 6: Video Upload (Field 15) */}
          <div className="p-4 rounded-2xl bg-[#171a26] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">MP4, WebM (أقل من 40 ثانية)</span>
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>15. فيديو الحساب (استعراض لا يتجاوز 40 ثانية)</span>
                <Video className="w-4 h-4 text-red-500" />
              </label>
            </div>

            {/* Direct File Upload area */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
                id="pubg-video-upload-input"
              />

              {!videoFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-white/15 hover:border-red-500/50 bg-black/30 hover:bg-black/40 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
                >
                  <Upload className="w-7 h-7 text-slate-400 group-hover:text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-300">
                    اضغط لاختيار فيديو الحساب من جهازك مباشرة
                  </span>
                  <span className="text-[10px] text-slate-500">
                    سيتم حفظ الفيديو تلقائياً في Google Drive المرتبط بجدول Google Sheets
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-emerald-500/30">
                  <button
                    type="button"
                    onClick={removeSelectedVideo}
                    className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">
                        {videoFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  </div>
                </div>
              )}
            </div>

            {/* Fallback URL if user prefers to paste Google Drive / YouTube link */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[11px] text-slate-400 mb-1">
                أو يمكنك وضع رابط مباشر للفيديو (Google Drive / YouTube):
              </label>
              <input
                type="url"
                value={fallbackVideoUrl}
                onChange={(e) => setFallbackVideoUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none text-right font-mono"
              />
            </div>
          </div>

          {/* Section 7: Site Rating (Field 16) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171a26] border border-white/10">
            <div className="flex items-center gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSiteRating(String(star))}
                  className={`p-1.5 rounded-lg transition-colors ${
                    Number(siteRating) >= star ? 'text-amber-400' : 'text-slate-600'
                  }`}
                >
                  <Star className={`w-5 h-5 ${Number(siteRating) >= star ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
            <label className="text-xs font-bold text-slate-300">
              16. تقييمك لمتجرنا والخدمة:
            </label>
          </div>

          {/* Section 8: Agreement & Status notice (Field 17) */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 text-xs text-slate-300">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-red-600"
              />
              <span className="leading-relaxed">
                <strong>17. التعهد والموافقة:</strong> أتعهد بأن جميع بيانات الحساب المذكورة صحيحة وبأني قمت بتحويل رسوم العرض (5 دينار)، وأعلم أنه سيتم تسجيل الحساب في Google Sheets ومراجعته من قبل الإدارة لتغيير الحالة إلى (<strong>نعم</strong>) ليظهر على الموقع.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-sell-account-final-btn"
              disabled={isSubmitting || isProcessingVideo}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-950/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting || isProcessingVideo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل الحساب في Google Sheets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>إرسال وتأكيد عرض الحساب الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
