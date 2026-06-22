import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Save, Sparkles, PlayCircle, Trash2, Upload, Link2, ChevronRight, RotateCcw, Eye } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { animationAssetOptions, animationCatalog, getAnimationAsset, getAnimationPreset, getAnimationSourceFile } from '../../config/animationRegistry';
import adminApi from '../../services/adminApi';
import AnimationPreviewMockup from './AnimationPreviewMockup';
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
    { value: 'center',              label: '🎯 กลางจอ' },
    { value: 'left',                label: '⬅️ ซ้ายในจอ' },
    { value: 'right',               label: '➡️ ขวาในจอ' },
    { value: 'up',                  label: '⬆️ บนในจอ' },
    { value: 'down',                label: '⬇️ ล่างในจอ' },
    { value: 'offscreen-left',      label: '💨 นอกจอซ้าย' },
    { value: 'offscreen-right',     label: '💨 นอกจอขวา' },
    { value: 'offscreen-top',       label: '💨 นอกจอบน' },
    { value: 'offscreen-bottom',    label: '💨 นอกจอล่าง' },
    { value: 'fade-offscreen-left', label: '🌫️ นอกจอซ้าย (Fade)' },
    { value: 'fade-offscreen-right',label: '🌫️ นอกจอขวา (Fade)' },
    { value: 'fade-offscreen-top',  label: '🌫️ นอกจอบน (Fade)' },
    { value: 'fade-offscreen-bottom',label:'🌫️ นอกจอล่าง (Fade)' },
    { value: 'scale-up-center',     label: '🔭 ขยายออกจากกลาง' },
    { value: 'scale-down-center',   label: '🔬 ยุบเข้ากลาง' },
];

const delayModeOptions = [
    { value: 'normal', label: 'ปกติ — เคลื่อนตรงจาก A → B' },
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

// ─── Styled helpers ──────────────────────────────────────────────────────────
const Label = ({ children }) => (
    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div>
        <Label>{label}</Label>
        {children}
    </div>
);

const inputStyle = {
    width:'100%', borderRadius:10, border:'1px solid #e2e8f0',
    background:'#f8fafc', padding:'9px 14px', fontSize:'0.875rem',
    color:'#1e293b', outline:'none', boxSizing:'border-box',
    transition:'border-color 0.15s',
    fontFamily:'inherit',
};

const selectStyle = { ...inputStyle, cursor:'pointer' };

// ─── Mini Journey Preview Panel ───────────────────────────────────────────────
const MiniJourneyPreview = ({ previewConfig, selectedAssetKey, speedText, sceneIdx }) => {
    const scene = MINI_SCENES[sceneIdx % MINI_SCENES.length];
    const [replayKey, setReplayKey] = useState(0);

    useEffect(() => {
        setReplayKey(k => k + 1);
    }, [selectedAssetKey, speedText]);

    return (
        <div style={{ position:'relative', borderRadius:20, overflow:'hidden', aspectRatio:'16/9', minHeight:200, background: scene.bg }}>
            {/* Lottie background scene */}
            <AnimatePresence mode="sync">
                <motion.div key={scene.id} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.8 }} style={{ position:'absolute', inset:0 }}>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'55%', overflow:'hidden', opacity:0.6 }}>
                        <Lottie animationData={scene.lottie} loop autoplay style={{ width:'100%', height:'100%' }} rendererSettings={{ preserveAspectRatio:'xMidYMax slice' }} />
                    </div>
                    <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />
                </motion.div>
            </AnimatePresence>

            {/* Character animation */}
            <div key={replayKey} style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, pointerEvents:'none' }}>
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
                    <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem', fontWeight:700, background:'rgba(0,0,0,0.4)', borderRadius:10, padding:'8px 16px', backdropFilter:'blur(8px)' }}>
                        🔕 ไม่มี asset
                    </div>
                )}
            </div>

            {/* Overlay badge */}
            <div style={{ position:'absolute', top:10, left:10, zIndex:20, display:'flex', gap:6 }}>
                <span style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', borderRadius:99, padding:'3px 10px', fontSize:'0.65rem', fontWeight:800, color:scene.accent, border:`1px solid ${scene.accent}55` }}>
                    🎬 Live Preview
                </span>
            </div>
            <button
                onClick={() => setReplayKey(k => k + 1)}
                title="เล่นใหม่"
                style={{ position:'absolute', top:10, right:10, zIndex:20, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', border:`1px solid ${scene.accent}55`, borderRadius:99, padding:'4px 10px', color:scene.accent, cursor:'pointer', fontSize:'0.65rem', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                <RotateCcw size={10} /> เล่นใหม่
            </button>

            {/* Asset label */}
            <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', zIndex:20, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)', borderRadius:99, padding:'3px 12px', fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.7)', whiteSpace:'nowrap', maxWidth:'90%', overflow:'hidden', textOverflow:'ellipsis' }}>
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

    const { data: dbAssets = [] } = useQuery({ queryKey: ['assets'], queryFn: adminApi.getAssets });
    const assets = useMemo(() => {
        const custom = dbAssets.filter(a => a.type === 'animation').map(a => ({ value: a.id, label: a.name, isCustom: true, url: a.url }));
        return [...animationAssetOptions, ...custom];
    }, [dbAssets]);

    const { data: systemSettings } = useQuery({ queryKey: ['systemSettings'], queryFn: adminApi.getSystemSettings });
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
                settings: { ...old?.settings, animation_asset_configs: payload.animation_asset_configs, animation_usage_map: payload.animation_usage_map }
            }));
            queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
            toast.success('บันทึก animation ลง Firebase แล้ว ✅');
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
            animation_asset_configs: {
                ...savedAssetConfigs,
                [selectedAssetKey]: { scale: scaleMode, startPosition, endPosition, durationText, speed: resolvedSpeed, speedText, delayMode, delayPercent, noteText, animationUrl: selectedAsset?.animationUrl || '', updatedAt: new Date().toISOString() }
            },
            animation_usage_map: nextUsageMap,
        });
    };

    const toggleUsage = (key) => setSelectedUsageKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

    const cardStyle = {
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    };

    const sectionHead = {
        padding: '14px 18px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: '0.8rem', fontWeight: 800,
        color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase',
        background: '#f8fafc',
    };

    return (
        <div style={{ paddingBottom: 80, fontFamily:"'Inter','Sarabun',sans-serif" }}>
            <style>{`
                .anim-input:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
                .asset-row { transition: background 0.12s, border-color 0.12s; }
                .asset-row:hover { background:#f8fafc; }
                .usage-chip { transition: all 0.15s; }
                .usage-chip:hover { filter:brightness(0.97); }
                .btn-primary { transition: filter 0.12s, transform 0.08s, box-shadow 0.12s; }
                .btn-primary:hover { filter:brightness(1.08); transform:translateY(-1px); }
                .btn-primary:active { transform:translateY(1px); filter:brightness(0.96); }
            `}</style>

            {/* ── Page header ── */}
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:24 }}>
                <div>
                    <h2 style={{ fontSize:'1.4rem', fontWeight:900, color:'#0f172a', margin:0 }}>🎬 Animation Studio</h2>
                    <p style={{ margin:'4px 0 0', fontSize:'0.82rem', color:'#64748b' }}>
                        เลือก asset .json → ตั้งค่าเส้นทาง/เวลา → กำหนดว่าจะใช้ที่ไหน → บันทึก
                    </p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                    <button
                        onClick={() => setMiniSceneIdx(i => (i + 1) % MINI_SCENES.length)}
                        style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 14px', fontSize:'0.8rem', fontWeight:700, cursor:'pointer', color:'#475569', display:'flex', alignItems:'center', gap:6 }}
                    >
                        🌍 เปลี่ยนฉาก
                    </button>
                </div>
            </div>

            {/* ── 3-column grid ── */}
            <div style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))', alignItems:'start' }}>

                {/* ── COL 1: Asset list ── */}
                <div style={cardStyle}>
                    <div style={sectionHead}>
                        <Sparkles size={14} color="#6366f1" /> รายการ Asset
                    </div>
                    <div style={{ padding:12 }}>
                        <div style={{ maxHeight:340, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                            {assets.map(asset => {
                                const active = selectedAssetKey === asset.value;
                                return (
                                    <div key={asset.value} className="asset-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderRadius:10, border:`1px solid ${active ? '#6366f1' : '#e2e8f0'}`, background: active ? '#eef2ff' : 'white', padding:'8px 10px 8px 14px' }}>
                                        <button type="button" onClick={() => setSelectedAssetKey(asset.value)} style={{ flexGrow:1, textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight: active ? 800 : 600, color: active ? '#4338ca' : '#475569', padding:0 }}>
                                            {asset.isCustom && <span style={{ fontSize:'0.6rem', background:'#fef3c7', color:'#92400e', borderRadius:4, padding:'1px 5px', marginRight:5, fontWeight:800 }}>custom</span>}
                                            {asset.label}
                                        </button>
                                        {asset.isCustom && (
                                            <button type="button" onClick={() => { if (window.confirm('ยืนยันการลบ?')) deleteAssetMutation.mutate(asset.value); }} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 6px', borderRadius:6, color:'#ef4444' }}>
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
                            style={{ marginTop:12, width:'100%', background: showUploadPanel ? '#eef2ff' : '#f8fafc', border:'1px dashed #c7d2fe', borderRadius:10, padding:'9px', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', color:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                        >
                            <Upload size={13} /> {showUploadPanel ? 'ซ่อนฟอร์มอัปโหลด' : 'อัปโหลด Asset ใหม่'}
                        </button>

                        <AnimatePresence>
                            {showUploadPanel && (
                                <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} style={{ overflow:'hidden' }}>
                                    <form onSubmit={handleUploadAnimation} style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
                                        <input
                                            type="text" placeholder="ชื่อแอนิเมชัน" value={uploadForm.name}
                                            onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                                            className="anim-input" style={inputStyle}
                                        />
                                        <label style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:10, border:'2px dashed #c7d2fe', background:'#f5f7ff', padding:'14px', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, color:'#6366f1', gap:6 }}>
                                            <input type="file" accept=".json" onChange={handleFileUpload} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                                            <Upload size={13} /> {isUploadingFile ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ .json'}
                                        </label>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, color:'#94a3b8', fontSize:'0.7rem' }}>
                                            <hr style={{ flex:1, border:'none', borderTop:'1px solid #e2e8f0' }} /> หรือวางลิงก์ <hr style={{ flex:1, border:'none', borderTop:'1px solid #e2e8f0' }} />
                                        </div>
                                        <input
                                            type="text" placeholder="Lottie JSON URL (Google Drive)" value={uploadForm.url}
                                            onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                                            className="anim-input" style={{ ...inputStyle, fontSize:'0.75rem' }}
                                        />
                                        <button type="submit" disabled={isUploadingFile || uploadMutation.isLoading || !uploadForm.name || !uploadForm.url}
                                            className="btn-primary"
                                            style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'white', border:'none', borderRadius:10, padding:'10px', fontSize:'0.8rem', fontWeight:800, cursor:'pointer', boxShadow:'0 4px 12px rgba(99,102,241,0.3)', opacity: (!uploadForm.name || !uploadForm.url) ? 0.5 : 1 }}>
                                            {uploadMutation.isLoading ? 'กำลังเพิ่ม...' : 'เพิ่มแอนิเมชัน'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── COL 2: Settings ── */}
                <div style={cardStyle}>
                    <div style={sectionHead}>
                        ⚙️ ตั้งค่าแอนิเมชัน
                    </div>
                    <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
                        {/* Asset + Preview target */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <Field label="Asset ที่เลือก">
                                <div style={{ ...inputStyle, background:'#f1f5f9', color:'#475569', fontSize:'0.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                    {selectedAssetKey || 'ยังไม่ได้เลือก'}
                                </div>
                            </Field>
                            <Field label="Preview Target">
                                <select value={previewUsageKey} onChange={e => setPreviewUsageKey(e.target.value)} className="anim-input" style={selectStyle}>
                                    {usageOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Duration + Speed */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <Field label="⏱ ระยะเวลา (วินาที)">
                                <input value={durationText} onChange={e => setDurationText(e.target.value)} placeholder="เช่น 0.8s" className="anim-input" style={inputStyle} />
                                <p style={{ marginTop:4, fontSize:'0.68rem', color:'#94a3b8' }}>เวลาเดินทาง Start → End</p>
                            </Field>
                            <Field label="⚡ ความเร็ว Lottie">
                                <input value={speedText} onChange={e => setSpeedText(e.target.value)} placeholder="เช่น 1, 1.5" className="anim-input" style={inputStyle} />
                                <p style={{ marginTop:4, fontSize:'0.68rem', color:'#94a3b8' }}>1=ปกติ | &lt;1=ช้า | &gt;1=เร็ว</p>
                            </Field>
                        </div>

                        {/* Delay mode + percent */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:12 }}>
                            <Field label="⏳ โหมดหน่วงเวลา">
                                <select value={delayMode} onChange={e => setDelayMode(e.target.value)} className="anim-input" style={selectStyle}>
                                    {delayModeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                            <Field label="% หน่วง">
                                <div style={{ position:'relative' }}>
                                    <input value={delayPercent} onChange={e => setDelayPercent(e.target.value)} placeholder="20" className="anim-input" style={{ ...inputStyle, paddingRight:28 }} />
                                    <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:'0.78rem', color:'#94a3b8', pointerEvents:'none' }}>%</span>
                                </div>
                            </Field>
                        </div>

                        {/* Scale + Start */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <Field label="📐 ขนาด">
                                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                    {['half','full','card'].map(s => (
                                        <button key={s} type="button" onClick={() => setScaleMode(s)}
                                            style={{ borderRadius:8, border:`1px solid ${scaleMode===s?'#6366f1':'#e2e8f0'}`, background: scaleMode===s?'#eef2ff':'white', color: scaleMode===s?'#4338ca':'#64748b', padding:'6px 12px', fontSize:'0.78rem', fontWeight: scaleMode===s?800:600, cursor:'pointer', transition:'all 0.12s' }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                            <Field label="🚀 Start Point">
                                <select value={startPosition} onChange={e => setStartPosition(e.target.value)} className="anim-input" style={selectStyle}>
                                    {positionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* End position */}
                        <Field label="🏁 End Point">
                            <select value={endPosition} onChange={e => setEndPosition(e.target.value)} className="anim-input" style={selectStyle}>
                                {positionOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </Field>

                        {/* Journey path visualizer */}
                        <div style={{ background:'#f8fafc', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:8, fontSize:'0.78rem', fontWeight:700, color:'#475569', border:'1px solid #e2e8f0' }}>
                            <span style={{ background:'#eef2ff', color:'#6366f1', borderRadius:6, padding:'3px 8px', fontSize:'0.72rem' }}>{startPosition}</span>
                            <ChevronRight size={14} color="#94a3b8" />
                            <span style={{ fontSize:'0.68rem', color:'#94a3b8' }}>{durationText} · {delayMode}</span>
                            <ChevronRight size={14} color="#94a3b8" />
                            <span style={{ background:'#f0fdf4', color:'#16a34a', borderRadius:6, padding:'3px 8px', fontSize:'0.72rem' }}>{endPosition}</span>
                        </div>

                        {/* Note + Preview button */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'end' }}>
                            <Field label="📝 โน้ต">
                                <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="บันทึก" className="anim-input" style={inputStyle} />
                            </Field>
                            <button type="button" onClick={() => setShowPreview(true)} className="btn-primary"
                                style={{ background:'#0f172a', color:'white', border:'none', borderRadius:10, padding:'10px 16px', fontSize:'0.8rem', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(0,0,0,0.2)' }}>
                                <Eye size={14} /> Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── COL 3: Mini preview + Usage checkboxes + Save ── */}
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {/* Mini journey preview */}
                    <div style={cardStyle}>
                        <div style={sectionHead}>
                            🌍 Journey Preview
                        </div>
                        <div style={{ padding:12 }}>
                            <MiniJourneyPreview
                                previewConfig={previewConfig}
                                selectedAssetKey={selectedAssetKey}
                                speedText={speedText}
                                sceneIdx={miniSceneIdx}
                            />
                            <p style={{ marginTop:8, fontSize:'0.68rem', color:'#94a3b8', textAlign:'center' }}>
                                กด "เปลี่ยนฉาก" เพื่อทดสอบบนฉากต่างๆ
                            </p>
                        </div>
                    </div>

                    {/* Usage checkboxes */}
                    <div style={cardStyle}>
                        <div style={sectionHead}>
                            <CheckSquare size={14} color="#6366f1" /> asset นี้จะใช้ที่ไหน
                        </div>
                        <div style={{ padding:12, display:'flex', flexDirection:'column', gap:6 }}>
                            {usageOptions.map(usage => {
                                const checked = selectedUsageKeys.includes(usage.value);
                                return (
                                    <label key={usage.value} className="usage-chip" style={{ display:'flex', alignItems:'flex-start', gap:10, borderRadius:10, border:`1px solid ${checked?'#6366f1':'#e2e8f0'}`, background: checked?'#eef2ff':'white', padding:'10px 12px', cursor:'pointer' }}>
                                        <input type="checkbox" checked={checked} onChange={() => toggleUsage(usage.value)} style={{ marginTop:2, accentColor:'#6366f1' }} />
                                        <div>
                                            <div style={{ fontSize:'0.82rem', fontWeight:800, color: checked?'#4338ca':'#334155' }}>{usage.label}</div>
                                            <div style={{ fontSize:'0.68rem', color:'#94a3b8', marginTop:2, lineHeight:1.4 }}>{usage.description}</div>
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
                        className="btn-primary"
                        style={{
                            width:'100%', background:'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
                            color:'white', border:'none', borderRadius:14, padding:'14px',
                            fontSize:'0.9rem', fontWeight:900, cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                            boxShadow:'0 6px 0 #3730a3, 0 8px 24px rgba(99,102,241,0.35)',
                            opacity: saveMutation.isPending ? 0.7 : 1,
                        }}
                        onMouseDown={e => { e.currentTarget.style.transform='translateY(5px)'; e.currentTarget.style.boxShadow='0 1px 0 #3730a3'; }}
                        onMouseUp={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 0 #3730a3, 0 8px 24px rgba(99,102,241,0.35)'; }}
                    >
                        <Save size={16} />
                        {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกลง Firebase'}
                    </button>
                </div>
            </div>

            {/* ── Full Preview Modal ── */}
            {showPreview && createPortal(
                <div style={{ position:'fixed', inset:0, zIndex:9999 }}>
                    <AnimationPreviewMockup
                        inlinePreviewState={{ presetKey: previewUsageKey, assetKey: selectedAssetKey, assetLabel: selectedAsset?.sourceFile, animationUrl: previewConfig.animationUrl, scale: scaleMode, startPosition, endPosition, durationText, speedText, delayMode, delayPercent, noteText }}
                        onCloseHandler={() => setShowPreview(false)}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default AnimationManager;
