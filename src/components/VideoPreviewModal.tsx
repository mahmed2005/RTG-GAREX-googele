import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getEmbeddableVideoUrl } from './PubgVideoPlayer';
import { soundEngine } from '../utils/soundEngine';
import { X, Play, ExternalLink, RotateCw, Maximize2, Sparkles, Smartphone } from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();
  const [isRotatedLandscape, setIsRotatedLandscape] = useState(false);

  if (!previewVideoUrl) return null;

  const { type, embedUrl, rawUrl } = getEmbeddableVideoUrl(previewVideoUrl);

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
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
        } bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl p-3 sm:p-5 text-right z-10 overflow-hidden transition-all duration-300`}
      >
        {/* Header Controls Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-wrap gap-2">
          {/* Action Buttons: Close, Rotate, External Link */}
          <div className="flex items-center gap-2">
            <button
              id="close-video-modal-btn"
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors flex items-center gap-1 text-xs font-bold"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">إغلاق</span>
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
              title="تدوير الشاشة بالكامل للوضع الأفقي"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span>{isRotatedLandscape ? 'الوضع العادي' : 'تدوير أفقي 90°'}</span>
            </button>

            {rawUrl && (
              <a
                href={rawUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium"
                title="فتح الرابط المباشر في نافذة مستقلة"
              >
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">فتح الرابط المباشر</span>
              </a>
            )}
          </div>

          {/* Title and Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>أعلى دقة 1080p</span>
            </span>
            <div className="flex items-center gap-1.5">
              <Play className="w-4 h-4 text-red-500 fill-red-500" />
              <h4 className="text-sm font-bold text-white">استعراض تفاصيل الحساب</h4>
            </div>
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
              title="Account Video Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 object-contain"
            />
          ) : (
            <video
              src={embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Bottom Hint */}
        <div className="pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            <span>يمكنك تدوير هاتفك بالعرض لمشاهدة جميع أسلحة وسكنات الحساب بحجم الشاشة الكامل</span>
          </span>
          <span className="font-mono text-slate-500 text-[10px]">RTG GEAR X AUTHENTIC</span>
        </div>
      </div>
    </div>
  );
};

