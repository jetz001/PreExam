import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Save, Sparkles, PlayCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { animationAssetOptions, animationCatalog, getAnimationAsset, getAnimationPreset, getAnimationSourceFile } from '../../config/animationRegistry';
import adminApi from '../../services/adminApi';
import AnimationPreviewMockup from './AnimationPreviewMockup';
import { createPortal } from 'react-dom';

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

const usageOptions = animationCatalog
    .filter((item) => item.key !== 'adminPreview')
    .map((item) => ({
        value: item.key,
        label: item.name
    }));

const getDefaultPresetForAsset = (assetFile) => (
    animationCatalog.find((item) => item.sourceFile === assetFile && item.key !== 'adminPreview')
    || animationCatalog.find((item) => item.key === 'adminPreview')
    || animationCatalog[0]
);

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

const buildAssetFormState = (assetFile, savedConfig = {}) => {
    const preset = getDefaultPresetForAsset(assetFile);

    return {
        assetKey: assetFile,
        scale: savedConfig.scale || preset.scale || 'half',
        startPosition: savedConfig.startPosition || getDefaultStartPosition(preset),
        endPosition: savedConfig.endPosition || getDefaultEndPosition(preset),
        durationText: savedConfig.durationText || '0.8s',
        speedText: savedConfig.speedText || String(savedConfig.speed || preset.speed || 1),
        delayMode: savedConfig.delayMode || 'normal',
        delayPercent: savedConfig.delayPercent || '20',
        noteText: savedConfig.noteText || 'บันทึก'
    };
};

const AnimationManager = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const assets = useMemo(() => animationAssetOptions, []);
    const { data: systemSettings } = useQuery({
        queryKey: ['systemSettings'],
        queryFn: adminApi.getSystemSettings
    });

    const savedLegacyAnimationSettings = useMemo(() => systemSettings?.animation_settings || {}, [systemSettings?.animation_settings]);
    const savedAssetConfigs = useMemo(() => systemSettings?.animation_asset_configs || {}, [systemSettings?.animation_asset_configs]);
    const savedUsageMap = useMemo(() => {
        if (systemSettings?.animation_usage_map && Object.keys(systemSettings.animation_usage_map).length > 0) {
            return systemSettings.animation_usage_map;
        }

        return usageOptions.reduce((acc, usage) => {
            const legacyConfig = savedLegacyAnimationSettings?.[usage.value];
            const sourceFile = getAnimationSourceFile(legacyConfig?.assetKey);
            acc[usage.value] = legacyConfig && !legacyConfig.disabled && sourceFile ? [sourceFile] : [];
            return acc;
        }, {});
    }, [savedLegacyAnimationSettings, systemSettings?.animation_usage_map]);

    const initialAsset = assets[0]?.value || '';
    const initialFormState = buildAssetFormState(initialAsset);

    const [selectedAssetKey, setSelectedAssetKey] = useState(initialAsset);
    const [scaleMode, setScaleMode] = useState(initialFormState.scale);
    const [startPosition, setStartPosition] = useState(initialFormState.startPosition);
    const [endPosition, setEndPosition] = useState(initialFormState.endPosition);
    const [durationText, setDurationText] = useState(initialFormState.durationText);
    const [speedText, setSpeedText] = useState(initialFormState.speedText);
    const [delayMode, setDelayMode] = useState(initialFormState.delayMode);
    const [delayPercent, setDelayPercent] = useState(initialFormState.delayPercent);
    const [noteText, setNoteText] = useState(initialFormState.noteText);
    const [selectedUsageKeys, setSelectedUsageKeys] = useState([]);
    const [previewUsageKey, setPreviewUsageKey] = useState(usageOptions[0]?.value || 'examSkipFirstAnswer');
    const [showPreview, setShowPreview] = useState(false);

    const previewPreset = getAnimationPreset(previewUsageKey);
    const selectedAsset = selectedAssetKey ? getAnimationAsset(selectedAssetKey) : null;
    const parsedSpeed = Number.parseFloat(String(speedText || '').replace(/[^0-9.]/g, ''));
    const resolvedSpeed = Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : (previewPreset.speed || 1);
    const previewConfig = {
        ...previewPreset,
        animationData: selectedAsset?.animationData || null,
        scale: 'card',
        direction: 'center',
        speed: resolvedSpeed,
        loop: true
    };

    const scaleOptions = ['half', 'full', 'card'];

    useEffect(() => {
        const nextState = buildAssetFormState(selectedAssetKey, savedAssetConfigs[selectedAssetKey]);
        setScaleMode(nextState.scale);
        setStartPosition(nextState.startPosition);
        setEndPosition(nextState.endPosition);
        setDurationText(nextState.durationText);
        setSpeedText(nextState.speedText);
        setDelayMode(nextState.delayMode);
        setDelayPercent(nextState.delayPercent);
        setNoteText(nextState.noteText);

        const nextUsageKeys = usageOptions
            .filter((usage) => (savedUsageMap[usage.value] || []).includes(selectedAssetKey))
            .map((usage) => usage.value);

        setSelectedUsageKeys(nextUsageKeys);

        if (!nextUsageKeys.includes(previewUsageKey)) {
            setPreviewUsageKey(nextUsageKeys[0] || usageOptions[0]?.value || 'examSkipFirstAnswer');
        }
    }, [selectedAssetKey, savedAssetConfigs, savedUsageMap, previewUsageKey]);

    const saveMutation = useMutation({
        mutationFn: async (payload) => adminApi.updateSystemSettings(payload),
        onSuccess: (data, payload) => {
            queryClient.setQueryData(['systemSettings'], (old) => ({
                ...old,
                animation_asset_configs: payload.animation_asset_configs,
                animation_usage_map: payload.animation_usage_map
            }));
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
            toast.success('บันทึก animation ลง Firebase แล้ว');
        },
        onError: () => {
            toast.error('บันทึก animation ไม่สำเร็จ');
        }
    });

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleSave = () => {
        const nextUsageMap = usageOptions.reduce((acc, usage) => {
            const currentFiles = Array.isArray(savedUsageMap[usage.value]) ? savedUsageMap[usage.value] : [];
            const filteredFiles = currentFiles.filter((fileName) => fileName !== selectedAssetKey);

            acc[usage.value] = selectedUsageKeys.includes(usage.value)
                ? [...new Set([...filteredFiles, selectedAssetKey])]
                : filteredFiles;

            return acc;
        }, {});

        const payload = {
            animation_asset_configs: {
                ...savedAssetConfigs,
                [selectedAssetKey]: {
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
            },
            animation_usage_map: nextUsageMap
        };

        saveMutation.mutate(payload);
    };

    const toggleUsage = (usageKey) => {
        setSelectedUsageKeys((prev) => (
            prev.includes(usageKey)
                ? prev.filter((key) => key !== usageKey)
                : [...prev, usageKey]
        ));
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Animation Studio</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        เริ่มจากเลือก asset `.json` แล้วค่อยกำหนดว่า asset นี้จะถูกใช้กับส่วนไหนของระบบบ้าง
                    </p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[280px_minmax(320px,1fr)_320px]">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Sparkles size={16} className="text-blue-600" />
                        รายการ asset .json
                    </div>

                    <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                        {assets.map((asset) => (
                            <button
                                key={asset.value}
                                type="button"
                                onClick={() => setSelectedAssetKey(asset.value)}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                    selectedAssetKey === asset.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {asset.label}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Asset ที่เลือก</label>
                            <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                                {selectedAssetKey || 'ยังไม่ได้เลือก asset'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Preview Target</label>
                            <select
                                value={previewUsageKey}
                                onChange={(e) => setPreviewUsageKey(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                            >
                                {usageOptions.map((usage) => (
                                    <option key={usage.value} value={usage.value}>
                                        {usage.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">การตั้งค่าระยะเวลา</label>
                            <input
                                value={durationText}
                                onChange={(e) => setDurationText(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                                placeholder="เช่น 0.8s"
                            />
                            <p className="text-xs text-slate-500">
                                ระยะเวลาคือเวลาที่แอนิเมชันเคลื่อนจาก `Start Point` ไป `End Point`
                            </p>
                        </div>

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
                            key={`${previewUsageKey}-${selectedAssetKey || 'disabled'}-${speedText}`}
                            animationData={previewConfig.animationData}
                            scale={previewConfig.scale}
                            direction={previewConfig.direction}
                            speed={previewConfig.speed}
                            loop
                            display="inline"
                        />
                    </div>

                    <div className="mt-4 text-center text-sm font-medium text-slate-600">
                        {selectedAssetKey}
                    </div>

                    <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <CheckSquare size={16} className="text-blue-600" />
                            asset นี้จะไปแสดงที่ไหนบ้าง
                        </div>

                        <div className="space-y-2">
                            {usageOptions.map((usage) => (
                                <label
                                    key={usage.value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                                        selectedUsageKeys.includes(usage.value)
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-300 bg-white text-slate-700'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsageKeys.includes(usage.value)}
                                        onChange={() => toggleUsage(usage.value)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                                    />
                                    <span className="font-medium">{usage.label}</span>
                                </label>
                            ))}
                        </div>
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

            {showPreview && createPortal(
                <div className="fixed inset-0 z-[9999]">
                    <AnimationPreviewMockup
                        inlinePreviewState={{
                            presetKey: previewUsageKey,
                            assetKey: selectedAssetKey,
                            scale: scaleMode,
                            startPosition,
                            endPosition,
                            durationText,
                            speedText,
                            delayMode,
                            delayPercent,
                            noteText
                        }}
                        onCloseHandler={() => setShowPreview(false)}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default AnimationManager;
