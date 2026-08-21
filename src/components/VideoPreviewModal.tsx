import React from 'react';
import { useStore } from '../context/StoreContext';
import { getEmbeddableVideoUrl } from './PubgVideoPlayer';
import { X, Play, ExternalLink } from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();

  if (!previewVideoUrl) return null;

  const { type, embedUrl, rawUrl } = getEmbeddableVideoUrl(previewVideoUrl);
  const isGoogleDrive = type === 'drive';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="video-modal-backdrop"
        onClick={() => setPreviewVideoUrl(null)}
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        id="video-preview-card"
        className="relative w-full max-w-3xl bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 text-right z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              id="close-video-modal-btn"
              onClick={() => setPreviewVideoUrl(null)}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            {rawUrl && (
              <a
                href={rawUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 font-medium"
                title="فتح الرابط في نافذة جديدة"
              >
                <ExternalLink className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">فتح في نافذة مستقلة</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-red-500 fill-red-500" />
            <h4 className="text-sm font-bold text-white">معاينة استعراض الحساب</h4>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center">
          {type === 'drive' || type === 'youtube' ? (
            <iframe
              src={embedUrl}
              title="Account Video Preview"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
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
      </div>
    </div>
  );
};

