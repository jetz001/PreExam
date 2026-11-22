import React from 'react';
import { Type } from 'lucide-react';

const SIZE_OPTIONS = [
    { scale: 1, label: 'A', ariaLabel: 'ขนาดตัวอักษรปกติ', textClass: 'text-xs' },
    { scale: 1.25, label: 'A+', ariaLabel: 'ขนาดตัวอักษรใหญ่', textClass: 'text-sm' },
    { scale: 1.5, label: 'A++', ariaLabel: 'ขนาดตัวอักษรใหญ่พิเศษ', textClass: 'text-base' },
];

const FontResizer = ({ onResize, currentSize }) => {
    return (
        <div
            role="group"
            aria-label="ปรับขนาดตัวอักษร"
            className="fixed top-28 right-3 sm:right-4 z-50 bg-slate-900/85 backdrop-blur-xl p-2.5 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center gap-2 font-['Sarabun','Nunito',sans-serif]"
        >
            <div className="flex items-center gap-1 text-[10px] text-indigo-200/80 font-bold tracking-wider uppercase px-1">
                <Type size={12} className="text-indigo-300" aria-hidden="true" />
                <span>ขนาด</span>
            </div>

            <div className="flex flex-col gap-1.5">
                {SIZE_OPTIONS.map((opt) => {
                    const isActive = currentSize === opt.scale;
                    return (
                        <button
                            key={opt.scale}
                            type="button"
                            onClick={() => onResize(opt.scale)}
                            aria-label={opt.ariaLabel}
                            aria-pressed={isActive}
                            className={`w-10 h-9 rounded-xl flex items-center justify-center font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer ${opt.textClass} ${
                                isActive
                                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/35 border border-white/30 scale-105'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10'
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FontResizer;
