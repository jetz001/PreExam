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
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        currentValue === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {option.icon}
                    {option.label}
                </button>
            ))}
        </div>
    );

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
                    <Sparkles size={16} />
                    Animation Studio
                </div>
                <h3 className="text-xl font-bold">พรีวิวแอนิเมชันที่ผูกกับ flow สอบและหน้าผลสอบ</h3>
                <p className="mt-2 max-w-3xl text-sm text-blue-100/90">
                    ใช้ส่วนนี้เช็กว่าขนาดครึ่งจอหรือเต็มจอเหมาะกับหน้าไหน และทดลองทิศทางการเคลื่อนที่ก่อนนำไปใช้จริงในระบบสอบ
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-sm font-semibold text-slate-700">ขนาดแอนิเมชัน</div>
                    {renderSwitch(scaleOptions, scaleMode, setScaleMode)}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-sm font-semibold text-slate-700">ทิศทางเคลื่อนที่</div>
                    {renderSwitch(directionOptions, directionMode, setDirectionMode)}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {presets.map((preset) => (
                    <div key={preset.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <div className="mb-1 text-lg font-bold text-slate-800">{preset.name}</div>
                            <p className="text-sm leading-6 text-slate-500">{preset.description}</p>
                        </div>

                        <div className="bg-slate-50 p-5">
                            <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_35%,#f8fafc_100%)] p-4">
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

                        <div className="grid gap-3 border-t border-slate-100 p-5 text-sm text-slate-600 md:grid-cols-3">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preset scale</div>
                                <div className="mt-1 font-medium text-slate-700">{preset.scale}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preset direction</div>
                                <div className="mt-1 font-medium text-slate-700">{preset.direction}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Usage</div>
                                <div className="mt-1 font-medium text-slate-700">{preset.usage}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AnimationPresetManager;
