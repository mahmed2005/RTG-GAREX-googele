import React, { useState } from 'react';
import { Play, Maximize2, ExternalLink, Video, Film, Eye } from 'lucide-react';
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

export const getEmbeddableVideoUrl = (rawUrl?: string): { type: 'drive' | 'youtube' | 'direct' | 'none'; embedUrl: string; rawUrl: string } => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  const url = rawUrl.trim();

  // 1. Google Drive Links (Supports: /file/d/ID, ?id=ID, /open?id=ID, /view, /preview)
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    // Match /file/d/{FILE_ID}
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`,
        rawUrl: url
      };
    }
    // Match ?id={FILE_ID} or &id={FILE_ID} or /open?id={FILE_ID}
    const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${idParamMatch[1]}/preview`,
        rawUrl: url
      };
    }
    // Match /view
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
    // Match youtu.be/{ID}
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch && shortMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`,
        rawUrl: url
      };
    }
    // Match youtube.com/shorts/{ID}
    const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && shortsMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`,
        rawUrl: url
      };
    }
    // Match youtube.com/watch?v={ID}
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch && watchMatch[1]) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`,
        rawUrl: url
      };
    }
    // Direct embed link
    if (url.includes('/embed/')) {
      return {
        type: 'youtube',
        embedUrl: url,
        rawUrl: url
      };
    }
  }

  // If it's a short text or digit without http, it's not a video URL
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:') && !url.startsWith('blob:')) {
    return { type: 'none', embedUrl: '', rawUrl: '' };
  }

  // 3. Direct Video URLs (.mp4, .webm, .mov, data:, blob:)
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
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { type, embedUrl } = getEmbeddableVideoUrl(videoUrl);
  const hasVideo = type !== 'none' && !hasError;

  const defaultThumbnail = thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`relative w-full aspect-video bg-[#0c0e17] overflow-hidden rounded-t-3xl border-b border-white/10 ${className}`}>
      {/* 1. Header Badges: Level, Badge, Video Indicator */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {badge && (
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs shadow-lg shadow-red-950/50">
              {badge}
            </span>
          )}
          {level && (
            <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white font-mono font-bold text-xs border border-white/15">
              {level}
            </span>
          )}
        </div>

        {hasVideo && (
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-xl bg-red-600/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>فيديو الحساب</span>
            </span>
            {onExpand && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playButtonClick();
                  onExpand(videoUrl!);
                }}
                className="p-1.5 rounded-xl bg-black/70 hover:bg-red-600 text-white backdrop-blur-md border border-white/15 transition-colors"
                title="تكبير الفيديو"
                aria-label="تكبير الفيديو"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Video Player Content */}
      {hasVideo ? (
        type === 'drive' || type === 'youtube' ? (
          <div className="w-full h-full relative">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0 object-cover"
              onError={() => setHasError(true)}
            />
          </div>
        ) : (
          /* Direct HTML5 Video */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              src={embedUrl}
              controls
              playsInline
              preload="metadata"
              poster={defaultThumbnail}
              autoPlay={autoPlay}
              className="w-full h-full object-cover"
              onError={() => setHasError(true)}
            />
          </div>
        )
      ) : (
        /* Fallback Static Gaming Image with Video Request Link */
        <div className="w-full h-full relative group">
          <img
            src={defaultThumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-black/40 to-transparent flex flex-col items-center justify-end p-4 text-center">
            <div className="flex items-center gap-2 text-slate-300 text-xs bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <Film className="w-4 h-4 text-red-500" />
              <span>استعراض موثق من RTG GEAR X</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
