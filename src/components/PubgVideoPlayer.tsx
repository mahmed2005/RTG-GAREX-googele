import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  RotateCw, 
  CheckCircle2,
  ExternalLink,
  Film
} from 'lucide-react';
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

  // If not starting with valid web protocols
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
  const videoInfo = getEmbeddableVideoUrl(videoUrl);
  const hasVideo = videoInfo.type !== 'none';

  const defaultThumbnail = thumbnailUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const isDirectVideo = videoInfo.type === 'direct';

  // Toggle Play / Pause or Open Modal
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playButtonClick();

    if (onExpand && videoUrl) {
      onExpand(videoUrl);
      return;
    }

    if (isDirectVideo && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Seek forward +10s
  const handleSeekForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
    }
  };

  // Seek backward -10s
  const handleSeekBackward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  // Toggle Mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        if (onExpand && videoUrl) onExpand(videoUrl);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  // Sync Video Time Updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying) setShowControls(false);
      }}
      onMouseMove={handleMouseMove}
      className={`relative w-full aspect-video bg-[#0a0b12] overflow-hidden rounded-t-3xl border-b border-white/10 group select-none ${className}`}
    >
      {/* 1. Header Badges: Level & Verified */}
      <div className="absolute top-3 right-3 left-3 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-300">
        <div className="flex items-center gap-2 pointer-events-auto">
          {level && (
            <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white font-mono font-bold text-xs border border-white/10 shadow-sm">
              {level}
            </span>
          )}
          {badge && (
            <span className="px-2.5 py-1 rounded-xl bg-red-600/90 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1 shadow-sm border border-red-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {hasVideo && (
          <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-slate-300 text-[11px] font-bold border border-white/10 flex items-center gap-1">
            <Film className="w-3 h-3 text-red-400" />
            <span>فيديو الحساب</span>
          </span>
        )}
      </div>

      {/* 2. Video Player Content */}
      {hasVideo ? (
        <div className="w-full h-full relative flex items-center justify-center bg-black">
          {/* A: DIRECT VIDEO PLAYER (MP4, WEBM, BLOB) */}
          {isDirectVideo ? (
            <video
              ref={videoRef}
              src={videoInfo.embedUrl}
              poster={defaultThumbnail}
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />
          ) : (
            /* B: IFRAME EMBED (GOOGLE DRIVE / YOUTUBE) */
            isPlaying ? (
              <iframe
                src={videoInfo.embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              /* Thumbnail Before Play */
              <div 
                onClick={togglePlay}
                className="w-full h-full relative cursor-pointer group"
              >
                <img
                  src={defaultThumbnail}
                  alt={title}
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
              </div>
            )
          )}

          {/* 3. Center Play Button (Shown when paused or for iframes before play) */}
          {(!isPlaying || !isDirectVideo) && !isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            >
              <div className="relative flex items-center justify-center group/btn">
                <div className="absolute w-20 h-20 rounded-full bg-red-600/30 animate-ping duration-1000" />
                <div className="absolute w-16 h-16 rounded-full bg-red-500/40 blur-md" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-2xl shadow-red-950/90 flex items-center justify-center border-2 border-white/50 group-hover/btn:scale-110 group-active/btn:scale-95 transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white translate-x-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* 4. Rich Floating Player Controls Bar (For Direct Videos) */}
          {isDirectVideo && (
            <div 
              className={`absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Progress Bar */}
              <div 
                onClick={handleProgressBarClick}
                className="w-full h-2 bg-white/20 hover:h-2.5 rounded-full mb-3 cursor-pointer relative overflow-hidden transition-all"
              >
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Controls Buttons */}
              <div className="flex items-center justify-between text-white text-xs">
                {/* Right / Left Side Controls (Play/Pause, -10s, +10s, Time) */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={handleSeekBackward}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-0.5"
                    title="تأخير 10 ثوانٍ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">10-</span>
                  </button>

                  <button
                    onClick={handleSeekForward}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-0.5"
                    title="تقديم 10 ثوانٍ"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">10+</span>
                  </button>

                  <div className="hidden sm:block text-[11px] font-mono text-slate-300">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 text-slate-500">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Side Controls (Mute, Fullscreen) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* If Iframe (Google Drive / YouTube) and playing, show a small Fullscreen Helper Button in corner */}
          {!isDirectVideo && isPlaying && (
            <button
              onClick={toggleFullscreen}
              className="absolute bottom-3 left-3 z-30 p-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs border border-white/20 flex items-center gap-1.5 shadow-lg"
              title="تكبير ملء الشاشة"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="text-[11px]">ملء الشاشة</span>
            </button>
          )}
        </div>
      ) : (
        /* Fallback when no video is attached */
        <div className="w-full h-full relative">
          <img
            src={defaultThumbnail}
            alt={title}
            className="w-full h-full object-cover brightness-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 flex items-center justify-center">
            <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/15">
              حساب موثق ومفحوص من الإدارة
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
