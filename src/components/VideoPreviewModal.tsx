import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getEmbeddableVideoUrl } from './PubgVideoPlayer';
import { soundEngine } from '../utils/soundEngine';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Play, 
  Tv, 
  HardDrive, 
  Sparkles, 
  AlertCircle,
  Film,
  CheckCircle2
} from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { 
    previewVideoUrl, 
    setPreviewVideoUrl, 
    pubgAccounts, 
    allPubgAccounts, 
    setSelectedAccountForBuy 
  } = useStore();

  if (!previewVideoUrl) return null;

  const videoInfo = getEmbeddableVideoUrl(previewVideoUrl);
  const { type, embedUrl, rawUrl } = videoInfo;

  // Find associated PUBG account if exists
  const account = allPubgAccounts.find((a) => a.videoUrl === previewVideoUrl) ||
    pubgAccounts.find((a) => a.videoUrl === previewVideoUrl);

  const handleClose = () => {
    soundEngine.playButtonClick();
    setPreviewVideoUrl(null);
  };

  const handleOpenExternal = () => {
    soundEngine.playButtonClick();
    if (rawUrl) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isSold = account?.isSold || account?.saleStatus === 'تم البيع';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        id="video-modal-backdrop"
        onClick={handleClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="video-preview-card"
        className="relative w-full max-w-4xl bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl p-4 sm:p-6 text-right z-10 overflow-hidden transition-all duration-300 font-['Cairo',sans-serif] space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <button
            id="close-video-modal-btn"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 active:scale-95 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>

          <div className="flex items-center gap-2">
            {account && (
              <span className="text-xs font-bold text-slate-300">
                {account.title || account.accountName || 'حساب PUBG مميز'}
              </span>
            )}
            <span className="px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span>استعراض الفيديو</span>
            </span>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-video w-full flex items-center justify-center shadow-2xl">
          {type === 'drive' || type === 'youtube' ? (
            <iframe
              src={embedUrl}
              title="استعراض حساب ببجي"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 object-contain"
            />
          ) : type === 'direct' ? (
            <video
              src={embedUrl}
              controls
              playsInline
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-white">رابط الفيديو غير متوفر أو قيد التحديث</p>
            </div>
          )}
        </div>

        {/* Fallback Guidance Notice Under Video */}
        {rawUrl && (
          <div className="bg-gradient-to-r from-red-950/40 via-[#161926] to-red-950/40 border border-red-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-right">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-200">
                إن لم يشتغل عندك الفيديو في الموقع نفسه، انتقل هنا لتشغيل بكل سلاسة كاملة 100%.
              </p>
            </div>

            <button
              onClick={handleOpenExternal}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>فتح الفيديو من المصدر</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Account Details Below Video (User requested: عند الضغط على الفيديو يظهر لك الفيديو في الأسفل تلقى البيانات الخاصة بالحساب) */}
        {account && (
          <div className="bg-[#12141e] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isSold ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                <h3 className="text-base sm:text-lg font-black text-white">
                  {account.title || account.accountName || 'حساب PUBG مميز'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {account.level && (
                  <span className="px-2.5 py-1 rounded-xl bg-black/80 text-white font-mono font-bold text-xs border border-white/10">
                    {account.level}
                  </span>
                )}
                {isSold ? (
                  <span className="px-3 py-1 rounded-xl bg-red-950/80 text-red-300 font-black text-xs border border-red-500/50 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>تم البيع</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 font-bold text-xs border border-emerald-500/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{account.badge || 'حساب موثق ومتاح'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* 4 Gaming Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#171a27] border border-white/5 text-right">
                <span className="text-[10px] text-slate-400 block">الميثيك</span>
                <span className="text-sm font-black text-red-400 font-mono">{account.mythicsCount || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171a27] border border-white/5 text-right">
                <span className="text-[10px] text-slate-400 block">أسلحة مطورة</span>
                <span className="text-sm font-black text-white font-mono">{account.upgradableWeaponsCount || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171a27] border border-white/5 text-right">
                <span className="text-[10px] text-slate-400 block">السيارات</span>
                <span className="text-sm font-black text-amber-400 font-mono">{account.carsCount || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#171a27] border border-white/5 text-right">
                <span className="text-[10px] text-slate-400 block">الربط</span>
                <span className="text-xs font-bold text-emerald-300 truncate block">
                  {account.linkedServices || account.linkedAccounts || 'موثق'}
                </span>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">سعر الحساب</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-red-500 font-mono">
                    {account.price.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-300">د.ل</span>
                </div>
              </div>

              {isSold ? (
                <div className="px-5 py-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>تم بيع هذا الحساب (غير متاح للشراء)</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setPreviewVideoUrl(null);
                    setSelectedAccountForBuy(account);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-950/60 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>شراء الحساب الآن</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
