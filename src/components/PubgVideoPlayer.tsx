import React, { useState } from 'react';
import { Play, CheckCircle2 } from 'lucide-react';
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
  const { type } = getEmbeddableVideoUrl(videoUrl);
  const hasVideo = type !== 'none';

  const defaultThumbnail = thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

  const handleCardClick = () => {
    soundEngine.playButtonClick();
    if (onExpand && videoUrl) {
      onExpand(videoUrl);
    }
  };

  return (
    <div
      className={`relative w-full aspect-video bg-[#0c0e17] overflow-hidden rounded-t-3xl border-b border-white/10 group cursor-pointer select-none ${className}`}
      onClick={handleCardClick}
    >
      {/* 1. Header Badges: Level & Badge only (No top-left button) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {level && (
            <span className="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono font-bold text-[10px] sm:text-xs border border-white/10 shadow-sm">
              {level}
            </span>
          )}
          {badge && (
            <span className="px-2.5 py-0.5 rounded-lg bg-red-600/90 backdrop-blur-md text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 shadow-sm border border-red-500/30">
              <CheckCircle2 className="w-3 h-3 text-white" />
              <span>{badge}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Video Thumbnail & Center Play Button */}
      <div className="w-full h-full relative">
        <img
          src={defaultThumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
          loading="lazy"
        />

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-black/25 to-black/35" />

        {/* Clear & Prominent Centered Play Button */}
        {hasVideo ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Outer Radiant Glow Rings */}
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600/25 animate-ping duration-1000" />
              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/30 blur-md" />

              {/* Main Play Button - Distinct, Clear, Responsive */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-2xl shadow-red-950/90 flex items-center justify-center border-2 border-white/40 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white translate-x-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/10">
              حساب موثق ومفحوص
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
