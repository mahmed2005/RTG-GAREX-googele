import React, { useState } from 'react';
import { Play, Maximize2, ExternalLink, Video, Film, CheckCircle2, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface PubgVideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  badge?: string;
  level?: string;
  onExpand?: (url: string) => void;
  autoPlay?: boolean;
  className?: string;
}

export const getEmbeddableVideoUrl = (rawUrl?: string): {
  type: 'drive' | 'youtube' | 'direct' | 'none';
  embedUrl: string;
  directDownloadUrl?: string;
  rawUrl: string;
  fileId?: string;
} => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  const url = rawUrl.trim();

  // 1. Google Drive Links
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    let fileId = '';
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      fileId = fileIdMatch[1];
    } else {
      const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        fileId = idParamMatch[1];
      }
    }

    if (fileId) {
      return {
        type: 'drive',
        fileId,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        directDownloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        rawUrl: url
      };
    }

    if (url.includes('/view')) {
      return {
        type: 'drive',
        embedUrl: url.replace(/\/view(\?.*)?$/, '/preview'),
        rawUrl: url
      };
    }

    return {
      type: 'drive',
      embedUrl: url,
      rawUrl: url
    };
  }

  // 2. YouTube Links
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch && shortMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        rawUrl: url
      };
    }
    const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        rawUrl: url
      };
    }
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch && watchMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        rawUrl: url
      };
    }
    if (url.includes('/embed/')) {
      return {
        type: 'youtube',
        embedUrl: url,
        rawUrl: url
      };
    }
  }

  // If text doesn't look like a URL
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:') && !url.startsWith('blob:')) {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  // 3. Direct Video URLs
  return {
    type: 'direct',
    embedUrl: url,
    rawUrl: url
  };
};

export const PubgVideoPlayer: React.FC<PubgVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  title = 'فيديو الحساب',
  badge,
  level,
  onExpand,
  autoPlay = false,
  className = '',
}) => {
  const [isInlinePlaying, setIsInlinePlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { type, embedUrl, rawUrl } = getEmbeddableVideoUrl(videoUrl);
  const hasVideo = type !== 'none' && !hasError;

  const defaultThumbnail = thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

  const handleCardClick = () => {
    soundEngine.playButtonClick();
    if (onExpand && videoUrl) {
      onExpand(videoUrl);
    } else if (hasVideo) {
      setIsInlinePlaying(true);
    }
  };

  return (
    <div
      className={`relative w-full aspect-video bg-[#0c0e17] overflow-hidden rounded-t-3xl border-b border-white/10 group cursor-pointer select-none ${className}`}
      onClick={handleCardClick}
    >
      {/* 1. Header Badges: Level, Badge, Video Action */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        {/* Level and Verified Badge */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {level && (
            <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono font-bold text-[10px] sm:text-xs border border-white/10 shadow-sm">
              {level}
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded-lg bg-red-600/90 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-sm border border-red-500/30">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {/* Video Fullscreen Action Badge */}
        {hasVideo && (
          <div className="flex items-center gap-1 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-red-600 text-white backdrop-blur-md border border-white/15 transition-all text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
              title="تشغيل وتكبير الفيديو"
            >
              <Maximize2 className="w-3 h-3 text-red-400 group-hover:text-white" />
              <span>تشغيل الفيديو</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Video Thumbnail & Interactive Play Overlay */}
      <div className="w-full h-full relative">
        <img
          src={defaultThumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
          loading="lazy"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-black/30 to-black/40" />

        {/* Pulsing Futuristic Play Center Button */}
        {hasVideo ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Radiant Glow Rings */}
              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/30 animate-ping duration-1000" />
              <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/20 blur-md" />

              {/* Main Play Icon Button */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-950/80 flex items-center justify-center border border-white/30 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white translate-x-0.5" />
              </div>
            </div>

            {/* Label Under Button */}
            <div className="mt-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg group-hover:bg-red-600/90 group-hover:border-red-500/40 transition-colors">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>اضغط لمشاهدة استعراض الحساب</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
            <div className="flex items-center gap-2 text-slate-300 text-xs bg-black/70 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Film className="w-4 h-4 text-red-500" />
              <span>حساب موثق ومفحوص من متجر RTG</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
