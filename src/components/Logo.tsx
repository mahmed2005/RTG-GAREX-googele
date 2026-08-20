import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  const subSizes = {
    sm: 'text-[6.5px] tracking-[0.16em]',
    md: 'text-[7.5px] tracking-[0.18em]',
    lg: 'text-[9.5px] tracking-[0.2em]',
    xl: 'text-[11px] tracking-[0.22em]',
  };

  return (
    <div
      id="brand-logo"
      dir="ltr"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none group ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
      } ${className}`}
    >
      {/* 3D Geometric Vector Hexagon Emblem exactly matching the real EDE.jpg logo */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] drop-shadow-[0_0_12px_rgba(239,68,68,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          {/* Ambient 3D Shadow Plate behind the emblem */}
          <path
            d="M50 8L86 32V78L50 106L14 78V32L50 8Z"
            fill="rgba(0,0,0,0.35)"
            className="blur-[2px]"
          />

          {/* 1. LEFT METALLIC CHROME PILLAR & BEVELS (Matching EDE.jpg) */}
          {/* Left Dark Outer Bevel */}
          <path
            d="M34 26L18 38V76L34 88V78L26 72V42L34 36V26Z"
            fill="url(#leftPillarDarkBevel)"
          />
          {/* Left Main Chrome Face */}
          <path
            d="M34 26V88L44 80V60L38 64V40L44 34V26L34 26Z"
            fill="url(#leftPillarMainFace)"
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />

          {/* 2. RIGHT METALLIC CHROME PILLAR (Bright specular sheen) */}
          {/* Right Main Front Chrome Face */}
          <path
            d="M66 26L82 38V76L66 88V78L74 72V42L66 36V26Z"
            fill="url(#rightPillarFace)"
            stroke="#ffffff"
            strokeWidth="0.6"
          />
          {/* Right Pillar Inner Edge */}
          <path
            d="M66 26V36L58 42V72L66 78V88L56 80V34L66 26Z"
            fill="url(#rightPillarInner)"
            opacity="0.9"
          />

          {/* 3. BOTTOM CHROME V-SHIELD & INNER ANCHOR HOOK */}
          {/* Bottom Center V Point Base */}
          <path
            d="M34 88L50 102L66 88L50 78L34 88Z"
            fill="url(#bottomVBase)"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />
          {/* Bottom Right Highlight Facet */}
          <path
            d="M50 78L66 88L50 102V78Z"
            fill="url(#bottomVRightHighlight)"
          />
          {/* Inner Hook / Shelf below the red gem */}
          <path
            d="M40 56L40 74L50 82L60 74L50 68L46 72L46 60L40 56Z"
            fill="url(#innerMetallicHook)"
            stroke="#64748b"
            strokeWidth="0.5"
          />

          {/* 4. CENTRAL CRIMSON FOLDED ORIGAMI EMBLEM (Exact geometry from EDE.jpg) */}
          {/* Left Darker Red Angle Facet */}
          <path
            d="M50 10L36 32V52L50 64V42L42 34L50 20V10Z"
            fill="url(#redLeftDarkFacet)"
            stroke="#b91c1c"
            strokeWidth="0.5"
          />
          {/* Right Main Vivid Red Polygonal Gem */}
          <path
            d="M50 10L68 28V56L50 74V42L50 10Z"
            fill="url(#redRightMainFacet)"
            stroke="#fca5a5"
            strokeWidth="0.6"
          />
          {/* Center Specular Glint Highlight on Red Polygon */}
          <path
            d="M50 10L54 18L54 44L50 42V10Z"
            fill="#ffffff"
            opacity="0.4"
          />

          {/* Specular White Light Reflex on the Top Right Crest */}
          <path
            d="M68 28L50 10L53 9L70 27L68 28Z"
            fill="#ffffff"
            opacity="0.8"
          />

          {/* Gradients Definition */}
          <defs>
            {/* Left Pillar Gradients */}
            <linearGradient id="leftPillarDarkBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="leftPillarMainFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="35%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Right Pillar Gradients (Mirror Sheen) */}
            <linearGradient id="rightPillarFace" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="rightPillarInner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Bottom Shield Gradients */}
            <linearGradient id="bottomVBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="bottomVRightHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="innerMetallicHook" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Red Gem Origami Gradients */}
            <linearGradient id="redLeftDarkFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            <linearGradient id="redRightMainFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d5e" />
              <stop offset="30%" stopColor="#ef4444" />
              <stop offset="75%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography (Exact reproduction of RTG GEARX from EDE.jpg) */}
      <div className="flex flex-col justify-center text-left font-sans select-none" dir="ltr">
        <div
          className={`font-black tracking-tight flex items-center leading-none ${textSizes[size]}`}
          dir="ltr"
          style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
        >
          {/* RT in 3D Silver Metallic Chrome */}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-extrabold tracking-tighter">
            RT
          </span>
          {/* First G in Red 3D Chrome */}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-rose-400 via-red-500 to-red-700 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] font-black">
            G
          </span>
          {/* Second G in Red 3D Chrome */}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-rose-400 via-red-500 to-red-700 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] font-black">
            G
          </span>
          {/* EARX in 3D Silver Metallic Chrome */}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-extrabold tracking-tighter">
            EARX
          </span>
        </div>

        {/* Subtitle: MOBILE & GAMING ACCESSORIES (Exact match to EDE.jpg) */}
        {showSubtitle && (
          <span
            className={`text-slate-300 font-bold uppercase mt-1 tracking-[0.2em] opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${subSizes[size]}`}
            dir="ltr"
          >
            MOBILE & GAMING ACCESSORIES
          </span>
        )}
      </div>
    </div>
  );
};

