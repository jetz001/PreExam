import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, Sparkles, PlayCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { animationCatalog, getAnimationPreset } from '../../config/animationRegistry';
import adminApi from '../../services/adminApi';

const positionOptions = [
    { value: 'center', label: 'กลางจอ' },
    { value: 'left', label: 'ซ้ายในจอ' },
    { value: 'right', label: 'ขวาในจอ' },
    { value: 'up', label: 'บนในจอ' },
    { value: 'down', label: 'ล่างในจอ' },
    { value: 'offscreen-left', label: 'นอกจอซ้าย' },
    { value: 'offscreen-right', label: 'นอกจอขวา' },
    { value: 'offscreen-top', label: 'นอกจอบน' },
    { value: 'offscreen-bottom', label: 'นอกจอล่าง' }
];

const delayModeOptions = [
    { value: 'normal', label: 'ปกติ' },
    { value: 'start', label: 'หน่วงช่วงเริ่ม' },
    { value: 'middle', label: 'หน่วงช่วงกลาง' },
    { value: 'end', label: 'หน่วงช่วงปลาย' }
];

const getDefaultStartPosition = (preset) => {
    switch (preset?.direction) {
        case 'left':
            return 'offscreen-left';
        case 'right':
            return 'offscreen-right';
        case 'up':
            return 'offscreen-top';
        case 'down':
            return 'offscreen-bottom';
        default:
            return 'center';
    }
};

const getDefaultEndPosition = (preset) => {
    switch (preset?.direction) {
        case 'left':
            return 'left';
        case 'right':
            return 'right';
        case 'up':
            return 'up';
        case 'down':
            return 'down';
        default:
            return 'center';
    }
};

const buildPresetFormState = (preset, savedConfig = {}) => ({
    assetKey: savedConfig.assetKey ?? preset.key,
    scale: savedConfig.scale || preset.scale || 'half',
    startPosition: savedConfig.startPosition || getDefaultStartPosition(preset),
    endPosition: savedConfig.endPosition || getDefaultEndPosition(preset),
    durationText: savedConfig.durationText || '0.8s',
    speedText: savedConfig.speedText || String(savedConfig.speed || preset.speed || 1),
    delayMode: savedConfig.delayMode || 'normal',
    delayPercent: savedConfig.delayPercent || '20',
    noteText: savedConfig.noteText || 'บันทึก'
});

const AnimationManager = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const presets = useMemo(
        () => animationCatalog.filter((item) => item.key !== 'adminPreview'),
        []
    );

    const assetOptions = useMemo(
        () => [
            { value: '', label: 'ไม่ใช้แอนิเมชัน' },
            ...animationCatalog.map((item) => ({
                value: item.key,
                label: `${item.key}.json`
            }))
        ],
        []
    );

    const initialPreset = getAnimationPreset(presets[0]?.key || 'examSkipFirstAnswer');
    const { data: systemSettings } = useQuery({
        queryKey: ['systemSettings'],
        queryFn: adminApi.getSystemSettings
    });
    const savedAnimationSettings = systemSettings?.animation_settings || {};
    const [selectedPresetKey, setSelectedPresetKey] = useState(presets[0]?.key || 'examSkipFirstAnswer');
    const initialFormState = buildPresetFormState(initialPreset);
    const [selectedAssetKey, setSelectedAssetKey] = useState(initialFormState.assetKey);
    const [scaleMode, setScaleMode] = useState(initialFormState.scale);
    const [startPosition, setStartPosition] = useState(initialFormState.startPosition);
    const [endPosition, setEndPosition] = useState(initialFormState.endPosition);
    const [durationText, setDurationText] = useState(initialFormState.durationText);
    const [speedText, setSpeedText] = useState(initialFormState.speedText);
    const [delayMode, setDelayMode] = useState(initialFormState.delayMode);
    const [delayPercent, setDelayPercent] = useState(initialFormState.delayPercent);
    const [noteText, setNoteText] = useState(initialFormState.noteText);

    const selectedPreset = getAnimationPreset(selectedPresetKey);
    const selectedAsset = selectedAssetKey ? getAnimationPreset(selectedAssetKey) : null;
    const parsedSpeed = Number.parseFloat(String(speedText || '').replace(/[^0-9.]/g, ''));
    const resolvedSpeed = Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : (selectedPreset.speed || 1);
    const previewConfig = {
        ...selectedPreset,
        animationData: selectedAsset?.animationData || null,
        scale: 'card',
        direction: 'center',
        speed: resolvedSpeed,
        loop: true
    };

    const scaleOptions = ['half', 'full', 'card'];

    useEffect(() => {
        const preset = getAnimationPreset(selectedPresetKey);
        const nextState = buildPresetFormState(preset, savedAnimationSettings[selectedPresetKey]);
        setSelectedAssetKey(nextState.assetKey);
        setScaleMode(nextState.scale);
        setStartPosition(nextState.startPosition);
        setEndPosition(nextState.endPosition);
        setDurationText(nextState.durationText);
        setSpeedText(nextState.speedText);
        setDelayMode(nextState.delayMode);
        setDelayPercent(nextState.delayPercent);
        setNoteText(nextState.noteText);
    }, [selectedPresetKey, savedAnimationSettings]);

    const saveMutation = useMutation({
        mutationFn: async (payload) => adminApi.updateSystemSettings(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
            toast.success('บันทึก animation ลง Firebase แล้ว');
        },
        onError: () => {
            toast.error('บันทึก animation ไม่สำเร็จ');
        }
    });

    const handlePreview = () => {
        navigate('/admin/animations/preview', {
            state: {
                presetKey: selectedPresetKey,
                assetKey: selectedAssetKey,
                scale: scaleMode,
                startPosition,
                endPosition,
                durationText,
                speedText,
                delayMode,
                delayPercent,
                noteText
            }
        });
    };

    const handleSave = () => {
        const payload = {
            animation_settings: {
                ...savedAnimationSettings,
                [selectedPresetKey]: {
                    assetKey: selectedAssetKey,
                    disabled: !selectedAssetKey,
                    scale: scaleMode,
                    startPosition,
                    endPosition,
                    durationText,
                    speed: resolvedSpeed,
                    speedText,
                    delayMode,
                    delayPercent,
                    noteText,
                    updatedAt: new Date().toISOString()
                }
            }
        };

        saveMutation.mutate(payload);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Animation Studio</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        จัดโครงแอนิเมชันสำหรับข้อสอบ ผลสอบ และงานแอดมินแบบง่ายก่อน ตาม mockup ที่ต้องการ
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <Upload size={16} />
                    upload
                </button>
            </div>

            <div className="grid gap-6 xl:grid-cols-[280px_minmax(320px,1fr)_320px]">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Sparkles size={16} className="text-blue-600" />
                        ส่วนที่มีแอนิเมชันในตอนนี้
                    </div>

                    <div className="space-y-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.key}
                                type="button"
                                onClick={() => setSelectedPresetKey(preset.key)}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                    selectedPresetKey === preset.key
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">เลือก asset</label>
                            <select
                                value={selectedAssetKey}
                                onChange={(e) => setSelectedAssetKey(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                            >
                                {assetOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">การตั้งค่าระยะเวลา</label>
                            <input
                                value={durationText}
                                onChange={(e) => setDurationText(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="เช่น 0.8s"
                            />
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Animation Speed</label>
                            <input
                                value={speedText}
                                onChange={(e) => setSpeedText(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="เช่น 1, 0.8, 1.5"
                            />
                            <p className="text-xs text-slate-500">
                                `1` คือปกติ, น้อยกว่า `1` คือช้าลง, มากกว่า `1` คือเร็วขึ้น
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(220px,1fr)_180px]">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">การหน่วงเวลา</label>
                            <select
                                value={delayMode}
                                onChange={(e) => setDelayMode(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                            >
                                {delayModeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">เปอร์เซ็นการหน่วง</label>
                            <div className="relative">
                                <input
                                    value={delayPercent}
                                    onChange={(e) => setDelayPercent(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500"
                                    placeholder="เช่น 20"
                                />
                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div>
                            <div className="mb-2 text-sm font-semibold text-slate-700">ขนาดแอนิเมชัน</div>
                            <div className="flex flex-wrap gap-2">
                                {scaleOptions.map((scale) => (
                                    <button
                                        key={scale}
                                        type="button"
                                        onClick={() => setScaleMode(scale)}
                                        className={`rounded-full border px-3 py-1.5 text-sm ${
                                            scaleMode === scale
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-300 bg-white text-slate-600'
                                        }`}
                                    >
                                        {scale}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Start Point</label>
                            <select
                                value={startPosition}
                                onChange={(e) => setStartPosition(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                            >
                                {positionOptions.map((position) => (
                                    <option key={position.value} value={position.value}>
                                        {position.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">End Point</label>
                        <select
                            value={endPosition}
                            onChange={(e) => setEndPosition(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                        >
                            {positionOptions.map((position) => (
                                <option key={position.value} value={position.value}>
                                    {position.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs text-slate-500">
                            ระยะเวลาจะใช้สำหรับการเคลื่อนที่จากตำแหน่งเริ่มไปยังตำแหน่งจบในหน้า Preview
                        </p>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">โน้ต</label>
                            <input
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="เช่น บันทึก"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handlePreview}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        >
                            <PlayCircle size={16} />
                            Preview
                        </button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_50%,#f8fafc_100%)] p-4">
                        <AdaptiveLottie
                            key={`${selectedPresetKey}-${selectedAssetKey || 'disabled'}-${speedText}`}
                            animationData={previewConfig.animationData}
                            scale={previewConfig.scale}
                            direction={previewConfig.direction}
                            speed={previewConfig.speed}
                            loop
                            display="inline"
                        />
                    </div>

                    <div className="mt-4 text-center text-sm font-medium text-slate-600">
                        {selectedAssetKey}.json
                    </div>

                    <div className="mt-6 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        >
                            <Save size={16} />
                            {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกลง Firebase'}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AnimationManager;
