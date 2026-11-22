import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckSquare,
    Save,
    Sparkles,
    Trash2,
    Upload,
    ChevronRight,
    RotateCcw,
    Eye,
    Film,
    Mountain,
    Globe,
    Sliders,
    Clock,
    Zap,
    Hourglass,
    Maximize2,
    Navigation,
    Flag,
    StickyNote,
    BellOff,
    Layers
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { animationAssetOptions, animationCatalog, getAnimationAsset, getAnimationPreset, getAnimationSourceFile } from '../../config/animationRegistry';
import adminApi from '../../services/adminApi';
import AnimationPreviewMockup from './AnimationPreviewMockup';
import JourneySceneManager from './JourneySceneManager';
import { createPortal } from 'react-dom';

// Journey scene assets for mini preview
import mainSceneBAnimation from '../../assets/main-scene-b.json';
import mainSceneCAnimation from '../../assets/main-scene-c.json';
import mainSceneDAnimation from '../../assets/main-scene-d.json';

const MINI_SCENES = [
    { id: 'dawn',   lottie: mainSceneBAnimation, bg: 'linear-gradient(160deg,#1a0533 0%,#3b0764 40%,#7c2d12 80%,#92400e 100%)', accent: '#f97316' },
    { id: 'forest', lottie: mainSceneCAnimation, bg: 'linear-gradient(160deg,#052e16 0%,#14532d 50%,#15803d 100%)',              accent: '#4ade80' },
    { id: 'city',   lottie: mainSceneDAnimation, bg: 'linear-gradient(160deg,#020617 0%,#0f172a 40%,#1e40af 100%)',              accent: '#60a5fa' },
];

// ─── Option lists ─────────────────────────────────────────────────────────────
const positionOptions = [
    { value: 'center',                label: 'กลางจอ (Center)' },
    { value: 'left',                  label: 'ซ้ายในจอ (Left)' },
    { value: 'right',                 label: 'ขวาในจอ (Right)' },
    { value: 'up',                    label: 'บนในจอ (Up)' },
    { value: 'down',                  label: 'ล่างในจอ (Down)' },
    { value: 'offscreen-left',        label: 'นอกจอซ้าย (Offscreen Left)' },
    { value: 'offscreen-right',       label: 'นอกจอขวา (Offscreen Right)' },
    { value: 'offscreen-top',         label: 'นอกจอบน (Offscreen Top)' },
    { value: 'offscreen-bottom',      label: 'นอกจอล่าง (Offscreen Bottom)' },
    { value: 'fade-offscreen-left',   label: 'นอกจอซ้าย - Fade' },
    { value: 'fade-offscreen-right',  label: 'นอกจอขวา - Fade' },
    { value: 'fade-offscreen-top',    label: 'นอกจอบน - Fade' },
    { value: 'fade-offscreen-bottom', label: 'นอกจอล่าง - Fade' },
    { value: 'scale-up-center',       label: 'ขยายออกจากกลาง (Scale Up)' },
    { value: 'scale-down-center',     label: 'ยุบเข้ากลาง (Scale Down)' },
];

const delayModeOptions = [
    { value: 'normal', label: 'ปกติ — เคลื่อนตรงจาก A -> B' },
    { value: 'start',  label: 'หน่วงต้น — หยุดที่ A แล้วไป B' },
    { value: 'middle', label: 'หน่วงกลาง — ไปกลาง หยุด แล้วไป B' },
    { value: 'end',    label: 'หน่วงปลาย — ไป B แล้วหยุดรอ' },
];

const usageOptions = animationCatalog
    .filter((item) => item.key !== 'adminPreview')
    .map((item) => ({ value: item.key, label: item.name, description: item.description }));

const getDefaultPresetForAsset = (assetFile) => (
    animationCatalog.find((item) => item.sourceFile === assetFile && item.key !== 'adminPreview')
    || animationCatalog.find((item) => item.key === 'adminPreview')
    || animationCatalog[0]
);

const getDefaultStartPosition = (preset) => {
    const m = { left:'offscreen-left', right:'offscreen-right', up:'offscreen-top', down:'offscreen-bottom' };
    return m[preset?.direction] || 'center';
};
const getDefaultEndPosition = (preset) => {
    const m = { left:'left', right:'right', up:'up', down:'down' };
    return m[preset?.direction] || 'center';
};

const buildAssetFormState = (assetFile, savedConfig = {}) => {
    const preset = getDefaultPresetForAsset(assetFile);
    return {
        assetKey: assetFile,
        scale:         savedConfig.scale         || preset.scale || 'half',
        startPosition: savedConfig.startPosition || getDefaultStartPosition(preset),
        endPosition:   savedConfig.endPosition   || getDefaultEndPosition(preset),
        durationText:  savedConfig.durationText  || '0.8s',
        speedText:     savedConfig.speedText     || String(savedConfig.speed || preset.speed || 1),
        delayMode:     savedConfig.delayMode     || 'normal',
        delayPercent:  savedConfig.delayPercent  || '20',
        noteText:      savedConfig.noteText      || 'บันทึก',
    };
};

const Field = ({ label, icon: Icon, children }) => (
    <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            {Icon && <Icon size={13} className="text-indigo-500 flex-shrink-0" aria-hidden="true" />}
            <span>{label}</span>
        </div>
        {children}
    </div>
);

const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

// ─── Mini Journey Preview Panel ───────────────────────────────────────────────
const MiniJourneyPreview = ({ previewConfig, selectedAssetKey, speedText, sceneIdx, activeScenes }) => {
    const scene = activeScenes[sceneIdx % activeScenes.length];
    const [replayKey, setReplayKey] = useState(0);

    useEffect(() => {
        setReplayKey(k => k + 1);
    }, [selectedAssetKey, speedText]);

    return (
        <div
            className="relative rounded-2xl overflow-hidden aspect-video min-h-[200px] border border-slate-200/80 shadow-inner"
            style={{ background: scene.bgGradient || scene.bg }}
        >
            {/* Lottie background scene */}
            <AnimatePresence mode="sync">
                <motion.div key={scene.id} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.8 }} className="absolute inset-0">
                    <div className="absolute inset-0 overflow-hidden opacity-60">
                        {scene.animationUrl ? (
                            <AdaptiveLottie animationUrl={scene.animationUrl} loop autoplay scale="none" className="w-full h-full object-cover" />
                        ) : (
                            <Lottie animationData={scene.lottie} loop autoplay style={{ width:'100%', height:'100%', objectFit:'cover' }} rendererSettings={{ preserveAspectRatio:'xMidYMax slice' }} />
                        )}
                    </div>
                    <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
                </motion.div>
            </AnimatePresence>

            {/* Character animation */}
            <div key={replayKey} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                {(previewConfig.animationData || previewConfig.animationUrl) ? (
                    <AdaptiveLottie
                        animationData={previewConfig.animationData}
                        animationUrl={previewConfig.animationUrl}
                        scale="card"
                        direction="center"
                        speed={previewConfig.speed}
                        loop
                        display="inline"
                    />
                ) : (
                    <div className="inline-flex items-center gap-2 text-slate-200 text-xs font-bold bg-slate-950/60 border border-white/15 rounded-xl px-4 py-2 backdrop-blur-md">
                        <BellOff size={14} />
                        <span>ไม่มี asset</span>
                    </div>
                )}
            </div>

            {/* Overlay badge */}
            <div className="absolute top-2.5 left-2.5 z-20 flex gap-1.5">
                <span
                    className="inline-flex items-center gap-1.5 bg-slate-950/65 backdrop-blur-md rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ color: scene.accent || '#a5b4fc', border: `1px solid ${scene.accent || '#6366f1'}55` }}
                >
                    <Film size={11} />
                    <span>Live Preview</span>
                </span>
            </div>
            <button
                type="button"
                onClick={() => setReplayKey(k => k + 1)}
                title="เล่นใหม่"
                aria-label="เล่นพรีวิวใหม่อีกครั้ง"
                className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 bg-slate-950/65 hover:bg-slate-900/80 backdrop-blur-md rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ color: scene.accent || '#a5b4fc', border: `1px solid ${scene.accent || '#6366f1'}55` }}
            >
                <RotateCcw size={11} />
                <span>เล่นใหม่</span>
            </button>

            {/* Asset label */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 bg-slate-950/65 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-200 whitespace-nowrap max-w-[90%] overflow-hidden text-ellipsis">
                {selectedAssetKey || 'ยังไม่ได้เลือก'}
            </div>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AnimationManager = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [miniSceneIdx, setMiniSceneIdx] = useState(0);
    const [activeTab, setActiveTab] = useState('animations');

    const { data: dbAssets = [] } = useQuery({ queryKey: ['assets'], queryFn: adminApi.getAssets });
    const assets = useMemo(() => {
        const custom = dbAssets.filter(a => a.type === 'animation').map(a => ({ value: a.id, label: a.name, isCustom: true, url: a.url }));
        return [...animationAssetOptions, ...custom];
    }, [dbAssets]);

    const { data: systemSettings } = useQuery({ queryKey: ['systemSettings'], queryFn: adminApi.getSystemSettings });

    const activeScenes = useMemo(() => {
        const custom = systemSettings?.settings?.journey_scenes;
        if (custom && Array.isArray(custom) && custom.length > 0) return custom;
        return MINI_SCENES;
    }, [systemSettings?.settings?.journey_scenes]);

    const savedLegacyAnimationSettings = useMemo(() => systemSettings?.settings?.animation_settings || {}, [systemSettings?.settings?.animation_settings]);
    const savedAssetConfigs = useMemo(() => systemSettings?.settings?.animation_asset_configs || {}, [systemSettings?.settings?.animation_asset_configs]);
    const savedUsageMap = useMemo(() => {
        if (systemSettings?.settings?.animation_usage_map && Object.keys(systemSettings.settings.animation_usage_map).length > 0) {
            return systemSettings.settings.animation_usage_map;
        }
        return usageOptions.reduce((acc, usage) => {
            const legacyConfig = savedLegacyAnimationSettings?.[usage.value];
            const sourceFile = getAnimationSourceFile(legacyConfig?.assetKey);
            acc[usage.value] = legacyConfig && !legacyConfig.disabled && sourceFile ? [sourceFile] : [];
            return acc;
        }, {});
    }, [savedLegacyAnimationSettings, systemSettings?.settings?.animation_usage_map]);

    const initialAsset = assets[0]?.value || '';
    const initialFormState = buildAssetFormState(initialAsset);

    const [selectedAssetKey, setSelectedAssetKey] = useState(initialAsset);
    const [scaleMode, setScaleMode]               = useState(initialFormState.scale);
    const [startPosition, setStartPosition]       = useState(initialFormState.startPosition);
    const [endPosition, setEndPosition]           = useState(initialFormState.endPosition);
    const [durationText, setDurationText]         = useState(initialFormState.durationText);
    const [speedText, setSpeedText]               = useState(initialFormState.speedText);
    const [delayMode, setDelayMode]               = useState(initialFormState.delayMode);
    const [delayPercent, setDelayPercent]         = useState(initialFormState.delayPercent);
    const [noteText, setNoteText]                 = useState(initialFormState.noteText);
    const [selectedUsageKeys, setSelectedUsageKeys] = useState([]);
    const [previewUsageKey, setPreviewUsageKey]   = useState(usageOptions[0]?.value || 'examSkipFirstAnswer');
    const [showPreview, setShowPreview]           = useState(false);
    const [isUploading, setIsUploading]           = useState(false);
    const [uploadForm, setUploadForm]             = useState({ name: '', url: '' });
    const [isUploadingFile, setIsUploadingFile]   = useState(false);
    const [showUploadPanel, setShowUploadPanel]   = useState(false);

    useEffect(() => {
        if (!showPreview) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setShowPreview(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showPreview]);

    const previewPreset = getAnimationPreset(previewUsageKey);
    const selectedAsset = useMemo(() => {
        if (!selectedAssetKey) return null;
        const custom = assets.find(a => a.value === selectedAssetKey && a.isCustom);
        if (custom) return { key: custom.value, sourceFile: custom.label, animationUrl: custom.url };
        return getAnimationAsset(selectedAssetKey);
    }, [selectedAssetKey, assets]);

    const parsedSpeed = Number.parseFloat(String(speedText || '').replace(/[^0-9.]/g, ''));
    const resolvedSpeed = Number.isFinite(parsedSpeed) && parsedSpeed > 0 ? parsedSpeed : (previewPreset.speed || 1);
    const previewConfig = {
        ...previewPreset,
        animationData: selectedAsset?.animationData || null,
        animationUrl:  selectedAsset?.animationUrl  || null,
        scale: 'card', direction: 'center',
        speed: resolvedSpeed, loop: true,
    };

    useEffect(() => {
        const next = buildAssetFormState(selectedAssetKey, savedAssetConfigs[selectedAssetKey]);
        setScaleMode(next.scale); setStartPosition(next.startPosition); setEndPosition(next.endPosition);
        setDurationText(next.durationText); setSpeedText(next.speedText);
        setDelayMode(next.delayMode); setDelayPercent(next.delayPercent); setNoteText(next.noteText);
        const nextKeys = usageOptions.filter(u => (savedUsageMap[u.value] || []).includes(selectedAssetKey)).map(u => u.value);
        setSelectedUsageKeys(nextKeys);
        if (!nextKeys.includes(previewUsageKey)) setPreviewUsageKey(nextKeys[0] || usageOptions[0]?.value || 'examSkipFirstAnswer');
    }, [selectedAssetKey, savedAssetConfigs, savedUsageMap, previewUsageKey]);

    const saveMutation = useMutation({
        mutationFn: async (payload) => adminApi.updateSystemSettings(payload),
        onSuccess: (data, payload) => {
            queryClient.setQueryData(['systemSettings'], (old) => ({
                ...old,
                settings: { ...old?.settings, ...payload }
            }));
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
            toast.success('บันทึกการตั้งค่าสำเร็จ');
        },
        onError: () => toast.error('บันทึกไม่สำเร็จ'),
    });

    const uploadMutation = useMutation({
        mutationFn: adminApi.uploadAsset,
        onSuccess: () => {
            toast.success('อัปโหลดแอนิเมชันสำเร็จ!');
            queryClient.invalidateQueries(['assets']);
            setIsUploading(false);
            setUploadForm({ name: '', url: '' });
            setShowUploadPanel(false);
        },
        onError: () => toast.error('อัปโหลดไม่สำเร็จ'),
    });

    const deleteAssetMutation = useMutation({
        mutationFn: adminApi.deleteAsset,
        onSuccess: () => {
            toast.success('ลบแอนิเมชันสำเร็จ');
            queryClient.invalidateQueries(['assets']);
            if (selectedAssetKey && assets.find(a => a.value === selectedAssetKey)?.isCustom) {
                setSelectedAssetKey(assets[0]?.value || '');
            }
        },
        onError: () => toast.error('ลบไม่สำเร็จ'),
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingFile(true);
        try {
            const result = await adminApi.uploadFileToR2(file);
            if (result?.url) {
                setUploadForm({ ...uploadForm, name: file.name.replace('.json', ''), url: result.url });
                toast.success('อัปโหลดไฟล์ไป R2 สำเร็จ กรุณากดปุ่มเพิ่ม');
            } else toast.error('อัปโหลดไฟล์ไม่สำเร็จ');
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setIsUploadingFile(false);
        }
    };

    const handleUploadAnimation = (e) => {
        e.preventDefault();
        if (!uploadForm.name || !uploadForm.url) return;
        let finalUrl = uploadForm.url;
        const driveMatch = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (driveMatch) finalUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
        if (finalUrl.includes('export=view')) finalUrl = finalUrl.replace('export=view', 'export=download');
        uploadMutation.mutate({ name: uploadForm.name, type: 'animation', url: finalUrl, is_premium: false });
    };

    const handleSave = () => {
        const nextUsageMap = usageOptions.reduce((acc, usage) => {
            const current = Array.isArray(savedUsageMap[usage.value]) ? savedUsageMap[usage.value] : [];
            const filtered = current.filter(f => f !== selectedAssetKey);
            acc[usage.value] = selectedUsageKeys.includes(usage.value) ? [...new Set([...filtered, selectedAssetKey])] : filtered;
            return acc;
        }, {});
        saveMutation.mutate({
            ...(systemSettings?.settings || {}),
            animation_asset_configs: {
                ...savedAssetConfigs,
                [selectedAssetKey]: { scale: scaleMode, startPosition, endPosition, durationText, speed: resolvedSpeed, speedText, delayMode, delayPercent, noteText, animationUrl: selectedAsset?.animationUrl || '', updatedAt: new Date().toISOString() }
            },
            animation_usage_map: nextUsageMap,
        });
    };

    const toggleUsage = (key) => setSelectedUsageKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

    return (
        <div className="space-y-6 pb-16">
            {/* ── Executive Header & Tabs ── */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl bg-white/90 backdrop-blur-sm p-5 sm:p-6 border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Film size={24} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                                Animation Studio
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                {assets.length} Assets
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            เลือก asset .json, ตั้งค่าเส้นทางและเวลา, กำหนดจุดใช้งานในระบบสอบ และจัดการฉากหลังการเดินทาง
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80" role="tablist">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'animations'}
                            onClick={() => setActiveTab('animations')}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'animations'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Sparkles size={15} />
                            <span>ตัวละคร &amp; ท่าทาง (Animations)</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'scenes'}
                            onClick={() => setActiveTab('scenes')}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                activeTab === 'scenes'
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Mountain size={15} />
                            <span>ฉากหลังการเดินทาง (Scenes)</span>
                        </button>
                    </div>

                    {activeTab === 'animations' && (
                        <button
                            type="button"
                            onClick={() => setMiniSceneIdx(i => (i + 1) % activeScenes.length)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <Globe size={15} className="text-indigo-600" />
                            <span>เปลี่ยนฉาก</span>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'scenes' && <JourneySceneManager systemSettings={systemSettings} />}

            {activeTab === 'animations' && (
                <>
                    {/* ── 3-column grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* ── COL 1: Asset list ── */}
                        <div className="lg:col-span-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                <Sparkles size={14} className="text-indigo-600" />
                                <span>รายการ Asset</span>
                            </div>
                            <div className="p-3.5 space-y-3">
                                <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                    {assets.map(asset => {
                                        const active = selectedAssetKey === asset.value;
                                        return (
                                            <div
                                                key={asset.value}
                                                className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                                                    active
                                                        ? 'border-indigo-500 bg-indigo-50/90'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAssetKey(asset.value)}
                                                    className={`flex-1 text-left text-xs font-semibold truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                                                        active ? 'text-indigo-700 font-bold' : 'text-slate-700'
                                                    }`}
                                                >
                                                    {asset.isCustom && (
                                                        <span className="inline-block text-[10px] bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 mr-1.5 font-bold">
                                                            custom
                                                        </span>
                                                    )}
                                                    {asset.label}
                                                </button>
                                                {asset.isCustom && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (window.confirm('ยืนยันการลบ?')) deleteAssetMutation.mutate(asset.value); }}
                                                        aria-label={`ลบ ${asset.label}`}
                                                        title="ลบ Asset"
                                                        className="ml-2 p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Upload toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowUploadPanel(v => !v)}
                                    className={`w-full rounded-xl border border-dashed px-3 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                        showUploadPanel
                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                            : 'border-indigo-300 bg-slate-50 text-indigo-700 hover:bg-indigo-50/60'
                                    }`}
                                >
                                    <Upload size={14} />
                                    <span>{showUploadPanel ? 'ซ่อนฟอร์มอัปโหลด' : 'อัปโหลด Asset ใหม่'}</span>
                                </button>

                                <AnimatePresence>
                                    {showUploadPanel && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <form onSubmit={handleUploadAnimation} className="pt-2 space-y-2.5">
                                                <input
                                                    type="text"
                                                    placeholder="ชื่อแอนิเมชัน"
                                                    value={uploadForm.name}
                                                    onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                                                    className={inputClassName}
                                                />
                                                <label className="relative flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 p-3.5 cursor-pointer text-xs font-bold text-indigo-700 transition-colors">
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        onChange={handleFileUpload}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <Upload size={14} />
                                                    <span>{isUploadingFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ .json'}</span>
                                                </label>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <div className="h-px flex-1 bg-slate-200" />
                                                    <span>หรือวางลิงก์</span>
                                                    <div className="h-px flex-1 bg-slate-200" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Lottie JSON URL (Google Drive)"
                                                    value={uploadForm.url}
                                                    onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                                                    className={inputClassName}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isUploadingFile || uploadMutation.isPending || !uploadForm.name || !uploadForm.url}
                                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                >
                                                    {uploadMutation.isPending ? 'กำลังเพิ่ม...' : 'เพิ่มแอนิเมชัน'}
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── COL 2: Settings ── */}
                        <div className="lg:col-span-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                <Sliders size={14} className="text-indigo-600" />
                                <span>ตั้งค่าแอนิเมชัน (Motion &amp; Timing)</span>
                            </div>
                            <div className="p-4 sm:p-5 space-y-4">
                                {/* Asset + Preview target */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <Field label="Asset ที่เลือก" icon={Layers}>
                                        <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 truncate">
                                            {selectedAssetKey || 'ยังไม่ได้เลือก'}
                                        </div>
                                    </Field>
                                    <Field label="Preview Target" icon={Eye}>
                                        <select
                                            value={previewUsageKey}
                                            onChange={e => setPreviewUsageKey(e.target.value)}
                                            className={inputClassName}
                                        >
                                            {usageOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* Duration + Speed */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <Field label="ระยะเวลา (วินาที)" icon={Clock}>
                                        <input
                                            value={durationText}
                                            onChange={e => setDurationText(e.target.value)}
                                            placeholder="เช่น 0.8s"
                                            className={inputClassName}
                                        />
                                        <p className="mt-1 text-xs text-slate-500">เวลาเดินทาง Start → End</p>
                                    </Field>
                                    <Field label="ความเร็ว Lottie" icon={Zap}>
                                        <input
                                            value={speedText}
                                            onChange={e => setSpeedText(e.target.value)}
                                            placeholder="เช่น 1, 1.5"
                                            className={inputClassName}
                                        />
                                        <p className="mt-1 text-xs text-slate-500">1=ปกติ | &lt;1=ช้า | &gt;1=เร็ว</p>
                                    </Field>
                                </div>

                                {/* Delay mode + percent */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="sm:col-span-2">
                                        <Field label="โหมดหน่วงเวลา" icon={Hourglass}>
                                            <select
                                                value={delayMode}
                                                onChange={e => setDelayMode(e.target.value)}
                                                className={inputClassName}
                                            >
                                                {delayModeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </Field>
                                    </div>
                                    <Field label="% หน่วง">
                                        <div className="relative">
                                            <input
                                                value={delayPercent}
                                                onChange={e => setDelayPercent(e.target.value)}
                                                placeholder="20"
                                                className={`${inputClassName} pr-8`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">%</span>
                                        </div>
                                    </Field>
                                </div>

                                {/* Scale + Start */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <Field label="ขนาด (Scale)" icon={Maximize2}>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {['half','full','card'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setScaleMode(s)}
                                                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                                        scaleMode === s
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Start Point" icon={Navigation}>
                                        <select
                                            value={startPosition}
                                            onChange={e => setStartPosition(e.target.value)}
                                            className={inputClassName}
                                        >
                                            {positionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                {/* End position */}
                                <Field label="End Point" icon={Flag}>
                                    <select
                                        value={endPosition}
                                        onChange={e => setEndPosition(e.target.value)}
                                        className={inputClassName}
                                    >
                                        {positionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </Field>

                                {/* Journey path visualizer */}
                                <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200/80">
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/70 rounded-lg px-2.5 py-1">
                                        {startPosition}
                                    </span>
                                    <ChevronRight size={14} className="text-slate-500" aria-hidden="true" />
                                    <span className="text-slate-600 font-semibold">{durationText} · {delayMode}</span>
                                    <ChevronRight size={14} className="text-slate-500" aria-hidden="true" />
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-lg px-2.5 py-1">
                                        {endPosition}
                                    </span>
                                </div>

                                {/* Note + Preview button */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                                    <div className="flex-1">
                                        <Field label="โน้ต" icon={StickyNote}>
                                            <input
                                                value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                placeholder="บันทึก"
                                                className={inputClassName}
                                            />
                                        </Field>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(true)}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-sm font-bold shadow-md transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <Eye size={16} />
                                        <span>Preview เต็มจอ</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── COL 3: Mini preview + Usage checkboxes + Save ── */}
                        <div className="lg:col-span-4 space-y-5">
                            {/* Mini journey preview */}
                            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                                <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                    <Globe size={14} className="text-indigo-600" />
                                    <span>Journey Preview</span>
                                </div>
                                <div className="p-3.5">
                                    <MiniJourneyPreview
                                        previewConfig={previewConfig}
                                        selectedAssetKey={selectedAssetKey}
                                        speedText={speedText}
                                        sceneIdx={miniSceneIdx}
                                        activeScenes={activeScenes}
                                    />
                                    <p className="mt-2.5 text-xs text-slate-500 text-center">
                                        กด &ldquo;เปลี่ยนฉาก&rdquo; เพื่อทดสอบบนฉากต่างๆ
                                    </p>
                                </div>
                            </div>

                            {/* Usage checkboxes */}
                            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-sm overflow-hidden">
                                <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/90 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                                    <CheckSquare size={14} className="text-indigo-600" />
                                    <span>asset นี้จะใช้ที่ไหน</span>
                                </div>
                                <div className="p-3.5 space-y-2">
                                    {usageOptions.map(usage => {
                                        const checked = selectedUsageKeys.includes(usage.value);
                                        return (
                                            <label
                                                key={usage.value}
                                                className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${
                                                    checked
                                                        ? 'border-indigo-500 bg-indigo-50/90'
                                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleUsage(usage.value)}
                                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div>
                                                    <div className={`text-xs font-bold ${checked ? 'text-indigo-800' : 'text-slate-800'}`}>
                                                        {usage.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                        {usage.description}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Save button */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3.5 px-5 text-sm font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-60 transition-all active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Save size={18} />
                                <span>{saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Full Preview Modal ── */}
                    {showPreview && createPortal(
                        <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="พรีวิวแอนิเมชันเต็มหน้าจอ">
                            <AnimationPreviewMockup
                                inlinePreviewState={{
                                    presetKey: previewUsageKey,
                                    assetKey: selectedAssetKey,
                                    assetLabel: selectedAsset?.sourceFile,
                                    animationUrl: previewConfig.animationUrl,
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
                                activeScenes={activeScenes}
                            />
                        </div>,
                        document.body
                    )}
                </>
            )}
        </div>
    );
};

export default AnimationManager;
