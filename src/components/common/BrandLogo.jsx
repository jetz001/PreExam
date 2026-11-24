'use client';

import React from 'react';

const SIZE_MAP = {
  sm: {
    iconWrap: 'w-8 h-8',
    logoImg: 'h-7 w-auto',
    gap: 'gap-2',
    badge: 'text-[9px] px-1.5 py-0.5 leading-none',
    subtitle: 'text-[10px] mt-1 pl-1.5',
  },
  md: {
    iconWrap: 'w-10 h-10',
    logoImg: 'h-9 sm:h-10 w-auto',
    gap: 'gap-2.5',
    badge: 'text-[10px] px-2 py-0.5 leading-none',
    subtitle: 'text-[11px] mt-1 pl-2',
  },
  lg: {
    iconWrap: 'w-12 h-12',
    logoImg: 'h-11 sm:h-12 w-auto',
    gap: 'gap-3',
    badge: 'text-[11px] px-2.5 py-0.5 leading-none',
    subtitle: 'text-xs mt-1.5 pl-2.5',
  },
  xl: {
    iconWrap: 'w-16 h-16 sm:w-20 sm:h-20',
    logoImg: 'h-14 sm:h-16 w-auto',
    gap: 'gap-3.5',
    badge: 'text-xs px-2.5 py-1 leading-none',
    subtitle: 'text-xs sm:text-sm mt-1.5 pl-3',
  },
};

const VARIANT_MAP = {
  dark: {
    logoShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    iconShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    badge: 'bg-amber-400/20 text-amber-200 border border-amber-300/35',
    subtitle: 'text-white/80',
  },
  light: {
    logoShadow: '',
    iconShadow: '',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/90',
    subtitle: 'text-slate-500',
  },
  glass: {
    logoShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    iconShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    badge: 'bg-white/20 text-amber-200 border border-white/30',
    subtitle: 'text-white/85',
  },
  admin: {
    logoShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    iconShadow: 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.28)]',
    badge:
      'bg-amber-400/15 text-amber-300 border border-amber-400/35 uppercase tracking-wider',
    subtitle: 'text-slate-400 uppercase tracking-wider font-semibold',
  },
};

/**
 * Reusable PreExam Brand Logo rendering the official `/logo.png` wordmark
 * or `/logo-mark.png` emblem transparently across dark, light, glass, and admin surfaces
 * with optional badge pill and subtitle.
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
  const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;
  const themeCfg = VARIANT_MAP[variant] || VARIANT_MAP.dark;
  const isDecorative = Boolean(rest['aria-hidden']);

  if (!showText) {
    return (
      <span
        className={`group inline-flex items-center justify-center select-none transition-all duration-200 ${className}`.trim()}
        {...(!isDecorative ? { role: 'img', 'aria-label': 'PreExam!' } : {})}
        {...rest}
      >
        <span
          className={`relative inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 ${sizeCfg.iconWrap} ${themeCfg.iconShadow}`.trim()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt=""
            width={512}
            height={512}
            draggable={false}
            className="h-full w-full object-contain"
            aria-hidden="true"
          />
        </span>
        {!isDecorative ? <span className="sr-only">PreExam!</span> : null}
      </span>
    );
  }

  return (
    <span
      className={`group inline-flex items-center select-none transition-all duration-200 ${className}`.trim()}
      {...rest}
    >
      <span className="flex flex-col items-start">
        <span className={`inline-flex items-center ${sizeCfg.gap}`.trim()}>
          <span
            className={`inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] ${themeCfg.logoShadow}`.trim()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={isDecorative ? '' : 'PreExam'}
              width={1006}
              height={329}
              draggable={false}
              className={`${sizeCfg.logoImg} max-w-none object-contain`}
            />
          </span>

          {badge ? (
            <span
              className={`inline-flex shrink-0 items-center rounded-full font-extrabold ${sizeCfg.badge} ${themeCfg.badge}`}
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
    </span>
  );
};

export default BrandLogo;
