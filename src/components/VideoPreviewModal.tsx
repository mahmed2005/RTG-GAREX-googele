import React from 'react';
import { useStore } from '../context/StoreContext';
import { getEmbeddableVideoUrl } from './PubgVideoPlayer';
import { soundEngine } from '../utils/soundEngine';
import { X, ShieldCheck } from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();

  if (!previewVideoUrl) return null;

  const { type, embedUrl } = getEmbeddableVideoUrl(previewVideoUrl);

  const handleClose = () => {
    soundEngine.playButtonClick();
    setPreviewVideoUrl(null);
  };

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
        className="relative w-full max-w-4xl bg-[#0c0e17] border border-white/15 rounded-3xl shadow-2xl p-4 sm:p-5 text-right z-10 overflow-hidden transition-all duration-300"
      >
        {/* Header Controls Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          {/* Close Button */}
          <button
            id="close-video-modal-btn"
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
            <span>إغلاق</span>
          </button>

          {/* Title & Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>فيديو استعراض الحساب</span>
            </span>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-video w-full flex items-center justify-center shadow-inner">
          {type === 'drive' || type === 'youtube' ? (
            <iframe
              src={embedUrl}
              title="استعراض حساب ببجي"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 object-contain"
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
      </div>
    </div>
  );
};
