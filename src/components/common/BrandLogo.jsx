'use client';

import React from 'react';

const SIZE_MAP = {
  sm: {
    iconWrap: 'w-8 h-8 rounded-xl',
    iconPad: 'p-1',
    logoImg: 'h-7 w-auto',
    platePad: 'px-2.5 py-1',
    gap: 'gap-2',
    glassPad: 'p-1.5',
    glassBadgePad: 'p-1.5 pr-3',
    glassSubtitlePad: 'p-2 pr-3.5',
    glassIconOnlyPad: 'p-1.5',
    badge: 'text-[9px] px-1.5 py-0.5 leading-none',
    subtitle: 'text-[10px] mt-1 pl-1.5',
  },
  md: {
    iconWrap: 'w-10 h-10 rounded-xl',
    iconPad: 'p-1',
    logoImg: 'h-9 sm:h-10 w-auto',
    platePad: 'px-3.5 py-1.5',
    gap: 'gap-2.5',
    glassPad: 'p-1.5',
    glassBadgePad: 'p-1.5 pr-3.5',
    glassSubtitlePad: 'px-3 py-2',
    glassIconOnlyPad: 'p-1.5',
    badge: 'text-[10px] px-2 py-0.5 leading-none',
    subtitle: 'text-[11px] mt-1 pl-2',
  },
  lg: {
    iconWrap: 'w-12 h-12 rounded-2xl',
    iconPad: 'p-1.5',
    logoImg: 'h-11 sm:h-12 w-auto',
    platePad: 'px-4 py-1.5',
    gap: 'gap-3',
    glassPad: 'p-2',
    glassBadgePad: 'p-2 pr-4',
    glassSubtitlePad: 'px-3.5 py-2.5',
    glassIconOnlyPad: 'p-2',
    badge: 'text-[11px] px-2.5 py-0.5 leading-none',
    subtitle: 'text-xs mt-1.5 pl-2.5',
  },
  xl: {
    iconWrap: 'w-16 h-16 sm:w-20 sm:h-20 rounded-[1.35rem]',
    iconPad: 'p-2',
    logoImg: 'h-14 sm:h-16 w-auto',
    platePad: 'px-5 py-2',
    gap: 'gap-3.5',
    glassPad: 'p-2.5',
    glassBadgePad: 'p-2.5 pr-5',
    glassSubtitlePad: 'px-4 py-3',
    glassIconOnlyPad: 'p-2.5',
    badge: 'text-xs px-2.5 py-1 leading-none',
    subtitle: 'text-xs sm:text-sm mt-1.5 pl-3',
  },
};

const VARIANT_MAP = {
  dark: {
    container: '',
    logoPlate:
      'rounded-full bg-white/95 shadow-[0_6px_22px_rgba(15,23,42,0.34),0_0_18px_rgba(96,165,250,0.2)] ring-1 ring-white/85',
    iconPlate:
      'bg-white/95 shadow-[0_6px_18px_rgba(15,23,42,0.36),0_0_16px_rgba(56,189,248,0.26)] ring-1 ring-white/85',
    badge: 'bg-amber-400/20 text-amber-200 border border-amber-300/35',
    subtitle: 'text-white/80',
  },
  light: {
    container: '',
    logoPlate:
      'dark:rounded-full dark:bg-white/95 dark:px-2.5 dark:py-1 dark:shadow-sm dark:ring-1 dark:ring-white/25',
    iconPlate:
      'bg-transparent dark:bg-white/95 dark:ring-1 dark:ring-white/25 dark:shadow-[0_4px_14px_rgba(15,23,42,0.28)]',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/90',
    subtitle: 'text-slate-500',
  },
  glass: {
    container:
      'rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_8px_24px_rgba(15,23,42,0.22)] hover:bg-white/20 hover:border-white/35',
    containerWithSubtitle:
      'rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_8px_24px_rgba(15,23,42,0.22)] hover:bg-white/20 hover:border-white/35',
    containerIconOnly:
      'rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_8px_24px_rgba(15,23,42,0.22)] hover:bg-white/20 hover:border-white/35',
    logoPlate:
      'rounded-full bg-white/95 shadow-[0_3px_14px_rgba(15,23,42,0.18)] ring-1 ring-white/90',
    iconPlate:
      'bg-white/95 shadow-[0_4px_14px_rgba(15,23,42,0.24)] ring-1 ring-white/85',
    badge: 'bg-white/20 text-amber-200 border border-white/30',
    subtitle: 'text-white/85',
  },
  admin: {
    container: '',
    logoPlate:
      'rounded-full bg-white/95 shadow-[0_6px_20px_rgba(79,70,229,0.34)] ring-1 ring-amber-400/45',
    iconPlate:
      'bg-white/95 shadow-[0_6px_18px_rgba(79,70,229,0.42)] ring-1 ring-amber-400/45',
    badge:
      'bg-amber-400/15 text-amber-300 border border-amber-400/35 uppercase tracking-wider',
    subtitle: 'text-slate-400 uppercase tracking-wider font-semibold',
  },
};

/**
 * Reusable PreExam Brand Logo rendering the official `/logo.png` wordmark
 * or `/logo-mark.png` emblem across dark, light, glass, and admin surfaces
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
  const isGlass = variant === 'glass';

  const glassSurfaceClass = isGlass
    ? showText
      ? subtitle
        ? `${themeCfg.containerWithSubtitle} ${sizeCfg.glassSubtitlePad}`
        : badge
          ? `${themeCfg.container} ${sizeCfg.glassBadgePad}`
          : `${themeCfg.container} ${sizeCfg.glassPad}`
      : `${themeCfg.containerIconOnly} ${sizeCfg.glassIconOnlyPad}`
    : themeCfg.container;

  if (!showText) {
    const iconPadClass = variant === 'light' ? 'dark:p-1' : sizeCfg.iconPad;
    return (
      <span
        className={`group inline-flex items-center justify-center select-none transition-all duration-200 ${glassSurfaceClass} ${className}`.trim()}
        {...(!isDecorative ? { role: 'img', 'aria-label': 'PreExam!' } : {})}
        {...rest}
      >
        <span
          className={`relative inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 ${sizeCfg.iconWrap} ${iconPadClass} ${themeCfg.iconPlate}`.trim()}
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

  const platePadClass = variant === 'light' ? '' : sizeCfg.platePad;

  return (
    <span
      className={`group inline-flex items-center select-none transition-all duration-200 ${glassSurfaceClass} ${className}`.trim()}
      {...rest}
    >
      <span className="flex flex-col items-start">
        <span className={`inline-flex items-center ${sizeCfg.gap}`.trim()}>
          <span
            className={`inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] ${platePadClass} ${themeCfg.logoPlate}`.trim()}
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
