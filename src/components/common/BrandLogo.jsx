'use client';

import React, { useId } from 'react';

const SIZE_MAP = {
  sm: {
    iconWrap: 'w-8 h-8 rounded-xl',
    gap: 'gap-2',
    glassPad: 'pl-1.5 pr-3 py-1',
    glassIconOnlyPad: 'p-1.5',
    title: 'text-lg leading-none',
    bang: 'text-lg leading-none',
    badge: 'text-[9px] px-1.5 py-0.5 leading-none',
    subtitle: 'text-[10px] mt-0.5',
  },
  md: {
    iconWrap: 'w-10 h-10 rounded-xl',
    gap: 'gap-2.5',
    glassPad: 'pl-2 pr-3.5 py-1.5',
    glassIconOnlyPad: 'p-1.5',
    title: 'text-xl sm:text-2xl leading-none',
    bang: 'text-xl sm:text-2xl leading-none',
    badge: 'text-[10px] px-2 py-0.5 leading-none',
    subtitle: 'text-[11px] mt-1',
  },
  lg: {
    iconWrap: 'w-12 h-12 rounded-2xl',
    gap: 'gap-3',
    glassPad: 'pl-2.5 pr-4 py-2',
    glassIconOnlyPad: 'p-2',
    title: 'text-2xl sm:text-3xl leading-none',
    bang: 'text-2xl sm:text-3xl leading-none',
    badge: 'text-[11px] px-2.5 py-0.5 leading-none',
    subtitle: 'text-xs mt-1',
  },
  xl: {
    iconWrap: 'w-16 h-16 sm:w-20 sm:h-20 rounded-[1.35rem]',
    gap: 'gap-3.5',
    glassPad: 'pl-3 pr-5 py-2.5',
    glassIconOnlyPad: 'p-2.5',
    title: 'text-4xl sm:text-5xl leading-none',
    bang: 'text-4xl sm:text-5xl leading-none',
    badge: 'text-xs px-2.5 py-1 leading-none',
    subtitle: 'text-xs sm:text-sm mt-1.5',
  },
};

const VARIANT_MAP = {
  dark: {
    container: '',
    iconGlow: 'drop-shadow-[0_6px_18px_rgba(124,58,237,0.48)]',
    iconRing: '',
    text: 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)]',
    bang: 'text-[#ffcc00] drop-shadow-[0_0_10px_rgba(255,204,0,0.5)]',
    badge: 'bg-amber-400/20 text-amber-200 border border-amber-300/35',
    subtitle: 'text-white/75',
    bgStops: ['#4f46e5', '#7c3aed', '#d946ef'],
    goldStops: ['#fef08a', '#fde047', '#ffcc00'],
  },
  light: {
    container: '',
    iconGlow: 'drop-shadow-[0_6px_14px_rgba(79,70,229,0.26)]',
    iconRing: '',
    text: 'text-[#2e1065]',
    bang: 'text-[#e21b3c]',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/90',
    subtitle: 'text-slate-500',
    bgStops: ['#4f46e5', '#7c3aed', '#d946ef'],
    goldStops: ['#fef08a', '#fde047', '#ffcc00'],
  },
  glass: {
    container:
      'rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_8px_24px_rgba(15,23,42,0.22)] hover:bg-white/20 hover:border-white/35',
    containerIconOnly:
      'rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_8px_24px_rgba(15,23,42,0.22)] hover:bg-white/20 hover:border-white/35',
    iconGlow: 'drop-shadow-[0_4px_12px_rgba(124,58,237,0.4)]',
    iconRing: '',
    text: 'text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]',
    bang: 'text-[#fde047] drop-shadow-[0_0_8px_rgba(253,224,71,0.45)]',
    badge: 'bg-white/20 text-amber-200 border border-white/30',
    subtitle: 'text-white/80',
    bgStops: ['#4f46e5', '#7c3aed', '#d946ef'],
    goldStops: ['#fef08a', '#fde047', '#ffcc00'],
  },
  admin: {
    container: '',
    iconGlow: 'drop-shadow-[0_6px_18px_rgba(79,70,229,0.45)]',
    iconRing: 'ring-1 ring-amber-400/35',
    text: 'text-slate-50',
    bang: 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]',
    badge:
      'bg-amber-400/15 text-amber-300 border border-amber-400/35 uppercase tracking-wider',
    subtitle: 'text-slate-400 uppercase tracking-wider font-semibold',
    bgStops: ['#312e81', '#5b21b6', '#9333ea'],
    goldStops: ['#fef08a', '#fde047', '#f59e0b'],
  },
};

/**
 * Reusable PreExam Brand Logo combining the custom SVG emblem (squircle/shield
 * gradient + target ring + graduation crown + golden spark) and the "PreExam!"
 * logotype with optional badge pill and subtitle.
 */
const BrandLogo = ({
  variant = 'dark',
  size = 'md',
  showText = true,
  badge,
  subtitle,
  className = '',
  ...rest
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;
  const themeCfg = VARIANT_MAP[variant] || VARIANT_MAP.dark;

  const isGlass = variant === 'glass';
  const glassSurfaceClass = isGlass
    ? showText
      ? `${themeCfg.container} ${sizeCfg.glassPad}`
      : `${themeCfg.containerIconOnly} ${sizeCfg.glassIconOnlyPad}`
    : themeCfg.container;

  const bgGradId = `pe-bg-${uid}`;
  const sheenGradId = `pe-sheen-${uid}`;
  const rimGradId = `pe-rim-${uid}`;
  const goldGradId = `pe-gold-${uid}`;
  const glowFilterId = `pe-glow-${uid}`;

  return (
    <span
      className={`group inline-flex items-center select-none transition-all duration-200 ${sizeCfg.gap} ${glassSurfaceClass} ${className}`.trim()}
      {...(!showText ? { role: 'img', 'aria-label': 'PreExam!' } : {})}
      {...rest}
    >
      <span
        className={`relative inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 ${sizeCfg.iconWrap} ${themeCfg.iconGlow} ${themeCfg.iconRing}`.trim()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          className="h-full w-full"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={bgGradId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={themeCfg.bgStops[0]} />
              <stop offset="52%" stopColor={themeCfg.bgStops[1]} />
              <stop offset="100%" stopColor={themeCfg.bgStops[2]} />
            </linearGradient>

            <radialGradient
              id={sheenGradId}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(18 12) rotate(48) scale(44)"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={rimGradId} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor={themeCfg.goldStops[1]} stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id={goldGradId} x1="38" y1="10" x2="54" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={themeCfg.goldStops[0]} />
              <stop offset="48%" stopColor={themeCfg.goldStops[1]} />
              <stop offset="100%" stopColor={themeCfg.goldStops[2]} />
            </linearGradient>

            <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.4"
                floodColor={themeCfg.goldStops[1]}
                floodOpacity="0.55"
              />
            </filter>
          </defs>

          {/* Rounded squircle emblem base */}
          <rect x="3" y="3" width="58" height="58" rx="16" fill={`url(#${bgGradId})`} />
          <rect x="3" y="3" width="58" height="58" rx="16" fill={`url(#${sheenGradId})`} />

          {/* Subtle inner shield contour */}
          <path
            d="M32 9.5H43.5C49.3 9.5 54 14.2 54 20V32.5C54 44.2 44.6 51.8 32 54.8C19.4 51.8 10 44.2 10 32.5V20C10 14.2 14.7 9.5 20.5 9.5H32Z"
            stroke="#ffffff"
            strokeOpacity="0.16"
            strokeWidth="1.25"
          />

          {/* Outer glass bevel */}
          <rect
            x="3.75"
            y="3.75"
            width="56.5"
            height="56.5"
            rx="15.25"
            stroke={`url(#${rimGradId})`}
            strokeWidth="1.5"
          />

          {/* Precision target ring */}
          <path
            d="M35.91 16.86A17.5 17.5 0 1 0 47.14 28.09"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Inner concentric target ring */}
          <path
            d="M35.98 22.27A12.5 12.5 0 1 0 41.73 28.02"
            stroke="#ffffff"
            strokeOpacity="0.34"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="2.4 2.8"
          />

          {/* Graduation crown / mortarboard centerpiece */}
          <path d="M30.5 23.5L42 29.5L30.5 35.5L19 29.5L30.5 23.5Z" fill="#ffffff" />
          <path
            d="M24.2 33.6V38.5C24.2 40.9 27 42.8 30.5 42.8C34 42.8 36.8 40.9 36.8 38.5V33.6L30.5 36.9L24.2 33.6Z"
            fill="#ffffff"
            fillOpacity="0.94"
          />

          {/* Golden tassel & target center */}
          <path
            d="M21 30.6V37.4"
            stroke={themeCfg.goldStops[1]}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="21" cy="38.7" r="1.65" fill={themeCfg.goldStops[2]} />
          <circle cx="30.5" cy="29.5" r="2.1" fill={themeCfg.goldStops[1]} />
          <circle cx="30.5" cy="29.5" r="0.85" fill="#ffffff" />

          {/* Golden 4-point spark */}
          <path
            d="M46.5 9.7Q48.2 15.8 54.3 17.5Q48.2 19.2 46.5 25.3Q44.8 19.2 38.7 17.5Q44.8 15.8 46.5 9.7Z"
            fill={`url(#${goldGradId})`}
            filter={`url(#${glowFilterId})`}
          />
        </svg>
      </span>

      {showText ? (
        <span className="flex flex-col">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${sizeCfg.title} ${themeCfg.text}`}
              style={{ fontFamily: "'Nunito', 'Sarabun', sans-serif" }}
            >
              PreExam
              <span className={`inline-block font-black ${sizeCfg.bang} ${themeCfg.bang}`}>!</span>
            </span>

            {badge ? (
              <span
                className={`inline-flex items-center rounded-full font-extrabold ${sizeCfg.badge} ${themeCfg.badge}`}
              >
                {badge}
              </span>
            ) : null}
          </span>

          {subtitle ? (
            <span className={`font-medium leading-tight ${sizeCfg.subtitle} ${themeCfg.subtitle}`}>
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : (
        <span className="sr-only">PreExam!</span>
      )}
    </span>
  );
};

export default BrandLogo;
