import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Play } from 'lucide-react';

export const VideoPreviewModal: React.FC = () => {
  const { previewVideoUrl, setPreviewVideoUrl } = useStore();

  if (!previewVideoUrl) return null;

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
        className="relative w-full max-w-2xl bg-[#11131c] border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-6 text-right z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <button
            id="close-video-modal-btn"
            onClick={() => setPreviewVideoUrl(null)}
            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-red-500 fill-red-500" />
            <h4 className="text-sm font-bold text-white">معاينة استعراض الحساب</h4>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10">
          <video
            src={previewVideoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
