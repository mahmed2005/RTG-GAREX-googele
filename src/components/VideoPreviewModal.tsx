import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getEmbeddableVideoUrl } from './PubgVideoPlayer';
import { soundEngine } from '../utils/soundEngine';
import { X, Play, ExternalLink, RotateCw, Sparkles, Smartphone, ShieldCheck, Download } from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();
  const [isRotatedLandscape, setIsRotatedLandscape] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!previewVideoUrl) return null;

  const { type, embedUrl, rawUrl, fileId, directDownloadUrl } = getEmbeddableVideoUrl(previewVideoUrl);

  const handleClose = () => {
    soundEngine.playButtonClick();
    setIsRotatedLandscape(false);
    setPreviewVideoUrl(null);
  };

  const handleToggleRotate = () => {
    soundEngine.playButtonClick();
    setIsRotatedLandscape(!isRotatedLandscape);

    // Attempt browser orientation lock or fullscreen if supported
    if (typeof window !== 'undefined' && !isRotatedLandscape) {
      const el = document.getElementById('video-preview-card');
      if (el) {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
      if (screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    }
  };

  const handleOpenDirect = () => {
    soundEngine.playButtonClick();
    if (rawUrl) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        id="video-modal-backdrop"
        onClick={handleClose}
        className="fixed inset-0 bg-black/95 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="video-preview-card"
        className={`relative w-full ${
          isRotatedLandscape
            ? 'max-w-6xl h-[92vh] flex flex-col'
            : 'max-w-4xl'
        } bg-[#0c0e17] border border-white/15 rounded-3xl shadow-2xl p-3 sm:p-5 text-right z-10 overflow-hidden transition-all duration-300`}
      >
        {/* Header Controls Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-wrap gap-2">
          {/* Action Buttons: Close, Rotate, External Link */}
          <div className="flex items-center gap-2">
            <button
              id="close-video-modal-btn"
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
              <span>إغلاق</span>
            </button>

            {/* Mobile / Desktop Landscape Toggle */}
            <button
              id="rotate-video-modal-btn"
              onClick={handleToggleRotate}
              className={`p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 ${
                isRotatedLandscape
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/60'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-slate-200'
              }`}
              title="تدوير الشاشة أفقياً"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span>{isRotatedLandscape ? 'الوضع العادي' : 'تدوير أفقي 90°'}</span>
            </button>

            {/* Instant Google Drive App / Browser Opener */}
            {rawUrl && (
              <button
                type="button"
                onClick={handleOpenDirect}
                className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-bold"
                title="فتح في Google Drive أو تطبيق الفيديو"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>فتح بجودة أصلية</span>
              </button>
            )}
          </div>

          {/* Title and Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>فيديو معتمد ومفحوص</span>
            </span>
          </div>
        </div>

        {/* Video Player Container */}
        <div
          className={`relative rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center ${
            isRotatedLandscape ? 'flex-1 w-full h-full min-h-[70vh]' : 'aspect-video w-full'
          }`}
        >
          {type === 'drive' || type === 'youtube' ? (
            <iframe
              src={embedUrl}
              title="استعراض حساب ببجي"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 object-contain"
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <video
              src={embedUrl}
              controls
              playsInline
              autoPlay
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Bottom Hint & Fast Action Bar */}
        <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>نصيحة: يمكنك تدوير الهاتف أو الضغط على "تدوير أفقي 90°" لمشاهدة جميع أسلحة وسكنات الحساب بملء الشاشة</span>
          </div>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 underline underline-offset-4"
            >
              <span>إذا واجهتك مشكلة في المشغل، اضغط هنا للمشاهدة المباشرة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
