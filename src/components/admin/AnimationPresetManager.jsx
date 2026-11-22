import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, ArrowUpDown, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import AdaptiveLottie from '../common/AdaptiveLottie';
import { animationCatalog } from '../../config/animationRegistry';

const scaleOptions = [
    { value: 'inherit', label: 'ตาม preset', icon: <Sparkles size={14} /> },
    { value: 'half', label: 'ครึ่งจอ', icon: <Minimize2 size={14} /> },
    { value: 'full', label: 'เต็มจอ', icon: <Maximize2 size={14} /> }
];

const directionOptions = [
    { value: 'inherit', label: 'ตาม preset', icon: <Sparkles size={14} /> },
    { value: 'left', label: 'ซ้าย', icon: <ArrowLeftRight size={14} className="rotate-180" /> },
    { value: 'right', label: 'ขวา', icon: <ArrowLeftRight size={14} /> },
    { value: 'up', label: 'ขึ้น', icon: <ArrowUpDown size={14} className="-rotate-90" /> },
    { value: 'down', label: 'ลง', icon: <ArrowUpDown size={14} className="rotate-90" /> }
];

const AnimationPresetManager = () => {
    const [scaleMode, setScaleMode] = useState('inherit');
    const [directionMode, setDirectionMode] = useState('inherit');

    const presets = useMemo(
        () => animationCatalog.filter((item) => item.key !== 'adminPreview'),
        []
    );

    const resolveScale = (preset) => (scaleMode === 'inherit' ? preset.scale : scaleMode);
    const resolveDirection = (preset) => (directionMode === 'inherit' ? preset.direction : directionMode);

    const renderSwitch = (options, currentValue, onChange) => (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        currentValue === option.value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                    {option.icon}
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <section className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 sm:p-7 text-white shadow-xl">
                <div className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="relative z-10">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                        <Sparkles size={14} />
                        <span>ANIMATION STUDIO PRESETS</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                        พรีวิวแอนิเมชันที่ผูกกับ flow สอบและหน้าผลสอบ
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm text-slate-300 leading-relaxed">
                        ใช้ส่วนนี้เช็กว่าขนาดครึ่งจอหรือเต็มจอเหมาะกับหน้าไหน และทดลองทิศทางการเคลื่อนที่ก่อนนำไปใช้จริงในระบบสอบ
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">ขนาดแอนิเมชัน (Scale)</div>
                    {renderSwitch(scaleOptions, scaleMode, setScaleMode)}
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-5 shadow-sm">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">ทิศทางเคลื่อนที่ (Direction)</div>
                    {renderSwitch(directionOptions, directionMode, setDirectionMode)}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {presets.map((preset) => (
                    <div key={preset.key} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <div className="border-b border-slate-100 p-5">
                            <div className="mb-1 text-lg font-bold text-slate-900">{preset.name}</div>
                            <p className="text-sm leading-6 text-slate-600">{preset.description}</p>
                        </div>

                        <div className="bg-slate-50/80 p-5">
                            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-[radial-gradient(circle_at_top,#e0e7ff_0%,#eef2ff_38%,#f8fafc_100%)] p-4">
                                <AdaptiveLottie
                                    animationData={preset.animationData}
                                    scale={resolveScale(preset)}
                                    direction={resolveDirection(preset)}
                                    icon={preset.accent}
                                    speed={preset.speed}
                                    loop
                                    display="inline"
                                />
                            </div>
                        </div>

                        <div className="grid gap-3 border-t border-slate-100 bg-white p-5 text-sm text-slate-600 sm:grid-cols-3">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Preset scale</div>
                                <div className="mt-1 font-semibold text-slate-800">{preset.scale}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Preset direction</div>
                                <div className="mt-1 font-semibold text-slate-800">{preset.direction}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Usage</div>
                                <div className="mt-1 font-semibold text-slate-800">{preset.usage}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AnimationPresetManager;
