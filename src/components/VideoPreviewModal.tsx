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
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();
  const [playInSite, setPlayInSite] = useState<boolean>(true);

  if (!previewVideoUrl) return null;

  const videoInfo = getEmbeddableVideoUrl(previewVideoUrl);
  const { type, embedUrl, rawUrl } = videoInfo;

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

  const isDrive = type === 'drive';
  const isYoutube = type === 'youtube';

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
        className="relative w-full max-w-4xl bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl p-4 sm:p-6 text-right z-10 overflow-hidden transition-all duration-300 font-['Cairo',sans-serif] space-y-4"
      >
        {/* Header Controls Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          {/* Close Button */}
          <button
            id="close-video-modal-btn"
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 active:scale-95 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>

          {/* Title & Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span>مشاهدة فيديو الحساب</span>
            </span>
          </div>
        </div>

        {/* Options Switcher: Play in Website vs External Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: Watch Inside Site */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playButtonClick();
              setPlayInSite(true);
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
              playInSite 
                ? 'bg-red-600/15 border-red-500/80 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-500/50' 
                : 'bg-[#151824] border-white/10 text-slate-300 hover:bg-[#1c2030]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${playInSite ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}>
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-white">1. تشغيل الفيديو في الموقع</span>
                <span className="text-[11px] text-slate-400">مشاهدة مباشرة داخل الصفحة بجودة عالية</span>
              </div>
            </div>
            {playInSite && <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0" />}
          </button>

          {/* Option 2: Watch on Source (Google Drive / YouTube / Cloud) */}
          <button
            type="button"
            onClick={handleOpenExternal}
            className="p-3.5 rounded-2xl border border-white/10 bg-[#151824] hover:bg-[#1c2030] hover:border-white/20 text-right transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                {isDrive ? <HardDrive className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>2. تشغيل من المصدر الأصلي ({isDrive ? 'Google Drive' : isYoutube ? 'YouTube' : 'الرابط المباشر'})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                </span>
                <span className="text-[11px] text-slate-400">فتح الرابط في صفحة مستقلة لسرعة وسلاسة قصوى</span>
              </div>
            </div>
          </button>
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

        {/* Fallback Guidance Notice as requested by User */}
        <div className="bg-gradient-to-r from-red-950/40 via-[#161926] to-red-950/40 border border-red-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 text-right">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-200">
              إن لم يشتغل عندك الفيديو في الموقع نفسه، انتقل هنا ليشتغل بكل سلاسة كاملة.
            </p>
          </div>

          {rawUrl && (
            <button
              onClick={handleOpenExternal}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>انتقل للمشاهدة الآن</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
