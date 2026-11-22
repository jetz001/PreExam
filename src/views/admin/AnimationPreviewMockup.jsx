import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    X,
    ArrowRight,
    MapPin,
    Play,
    RotateCcw,
    Film,
    BellOff,
    Trophy,
    AlertCircle,
    Package,
    Clock,
    Zap,
    Hourglass,
    Check,
    Sunrise,
    Trees,
    Building2,
    Mountain,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { getAnimationAsset, getAnimationPreset } from '../../config/animationRegistry';

// Journey scenes — same as ExamTaking
import mainSceneBAnimation from '../../assets/main-scene-b.json';
import mainSceneCAnimation from '../../assets/main-scene-c.json';
import mainSceneDAnimation from '../../assets/main-scene-d.json';
import runningAnimation from '../../assets/boy-running.json';

const JOURNEY_SCENES = [
    {
        id: 'dawn',
        name: 'รุ่งอรุณ',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #7c2d12 80%, #92400e 100%)',
        overlayTint: 'rgba(120, 40, 20, 0.25)',
        accentColor: '#f97316',
    },
    {
        id: 'forest',
        name: 'ป่าลึก',
        lottie: mainSceneCAnimation,
        bgGradient: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)',
        overlayTint: 'rgba(5, 46, 22, 0.35)',
        accentColor: '#4ade80',
    },
    {
        id: 'city',
        name: 'เมืองใหม่',
        lottie: mainSceneDAnimation,
        bgGradient: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e3a5f 80%, #1e40af 100%)',
        overlayTint: 'rgba(30, 64, 175, 0.2)',
        accentColor: '#60a5fa',
    },
    {
        id: 'summit',
        name: 'ยอดเขา',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #0c0a09 0%, #1c1917 30%, #292524 60%, #44403c 100%)',
        overlayTint: 'rgba(120, 113, 108, 0.2)',
        accentColor: '#e2e8f0',
    },
];

const renderSceneIcon = (sceneId, size = 15) => {
    switch (sceneId) {
        case 'dawn':
            return <Sunrise size={size} aria-hidden="true" />;
        case 'forest':
            return <Trees size={size} aria-hidden="true" />;
        case 'city':
            return <Building2 size={size} aria-hidden="true" />;
        case 'summit':
            return <Mountain size={size} aria-hidden="true" />;
        default:
            return <Sparkles size={size} aria-hidden="true" />;
    }
};

// ─── constants shared with AdaptiveLottie ────────────────────────────────────
const POSITION_COORDS = {
    center: { x: 0, y: 0 },
    left: { x: -220, y: 0 },
    right: { x: 220, y: 0 },
    up: { x: 0, y: -180 },
    down: { x: 0, y: 180 },
    'offscreen-left': { x: -1100, y: 0 },
    'offscreen-right': { x: 1100, y: 0 },
    'offscreen-top': { x: 0, y: -700 },
    'offscreen-bottom': { x: 0, y: 700 },
    'fade-offscreen-left': { x: -1100, y: 0 },
    'fade-offscreen-right': { x: 1100, y: 0 },
    'fade-offscreen-top': { x: 0, y: -700 },
    'fade-offscreen-bottom': { x: 0, y: 700 },
    'scale-up-center': { x: 0, y: 0 },
    'scale-down-center': { x: 0, y: 0 },
};

const ONSCREEN_POSITION_BY_OFFSCREEN = {
    'offscreen-left': 'left',
    'offscreen-right': 'right',
    'offscreen-top': 'up',
    'offscreen-bottom': 'down',
    'fade-offscreen-left': 'left',
    'fade-offscreen-right': 'right',
    'fade-offscreen-top': 'up',
    'fade-offscreen-bottom': 'down',
    'scale-up-center': 'center',
    'scale-down-center': 'center',
};

const POSITION_LABELS = {
    center: 'กลางจอ',
    left: 'ซ้ายในจอ',
    right: 'ขวาในจอ',
    up: 'บนในจอ',
    down: 'ล่างในจอ',
    'offscreen-left': 'นอกจอซ้าย',
    'offscreen-right': 'นอกจอขวา',
    'offscreen-top': 'นอกจอบน',
    'offscreen-bottom': 'นอกจอล่าง',
    'fade-offscreen-left': 'นอกจอซ้าย (Fade)',
    'fade-offscreen-right': 'นอกจอขวา (Fade)',
    'fade-offscreen-top': 'นอกจอบน (Fade)',
    'fade-offscreen-bottom': 'นอกจอล่าง (Fade)',
    'scale-up-center': 'ขยายออกจากกลาง',
    'scale-down-center': 'ยุบเข้ากลาง',
};

const DELAY_LABELS = {
    normal: 'ปกติ',
    start: 'หน่วงช่วงเริ่ม',
    middle: 'หน่วงช่วงกลาง',
    end: 'หน่วงช่วงปลาย',
};

// AAA easing curves (matching AdaptiveLottie)
const EASE_SPRING_IN = [0.22, 1.4, 0.36, 1];
const EASE_MOMENTUM  = [0.4, 0.0, 0.2, 1];
const EASE_SNAP_OUT  = [0.55, 0, 1, 0.45];
const EASE_SMOOTH    = [0.4, 0, 0.6, 1];

const parseDuration = (input) => {
    const parsed = Number.parseFloat(String(input || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.8;
};

const parseDelayPercent = (input) => {
    const parsed = Number.parseFloat(String(input || '').replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed)) return 0.2;
    return Math.min(Math.max(parsed, 0), 80) / 100;
};

const getVisibleHoldCoords = (positionKey, fallbackCoords) => {
    const mapped = ONSCREEN_POSITION_BY_OFFSCREEN[positionKey];
    return (mapped && POSITION_COORDS[mapped]) ? POSITION_COORDS[mapped] : fallbackCoords;
};

const buildPreviewMotionConfig = (startPosition, endPosition, startCoords, endCoords, delayMode, delayPercent) => {
    const hold = parseDelayPercent(delayPercent);
    const midPoint = { x: (startCoords.x + endCoords.x) / 2, y: (startCoords.y + endCoords.y) / 2 };

    const isStartFade    = String(startPosition).includes('fade');
    const isEndFade      = String(endPosition).includes('fade');
    const isStartScaleUp = startPosition === 'scale-up-center';
    const isEndScaleDown = endPosition   === 'scale-down-center';
    const isHorizontal   = ['left','right'].some(d => String(startPosition).includes(d) || String(endPosition).includes(d));

    if (delayMode === 'start') {
        const vis = getVisibleHoldCoords(startPosition, startCoords);
        const hasEntry = vis.x !== startCoords.x || vis.y !== startCoords.y || isStartScaleUp || isStartFade;
        const t0 = hasEntry ? 0.20 : 0;
        const t1 = Math.min(t0 + hold, 0.88);
        return {
            x: [startCoords.x, vis.x, vis.x, endCoords.x],
            y: [startCoords.y, vis.y, vis.y, endCoords.y],
            opacity: [isStartFade ? 0 : 1, 1, 1, isEndFade ? 0 : 1],
            scale: [isStartScaleUp ? 0 : 1, isStartScaleUp ? 1.08 : 1, 1, isEndScaleDown ? 0 : 1],
            times: [0, t0, t1, 1],
            ease: [EASE_SPRING_IN, EASE_SMOOTH, EASE_SNAP_OUT],
        };
    }
    if (delayMode === 'middle') {
        const s = Math.max(0.12, 0.5 - hold / 2);
        const e = Math.min(0.88, 0.5 + hold / 2);
        return {
            x: [startCoords.x, midPoint.x, midPoint.x, endCoords.x],
            y: [startCoords.y, midPoint.y, midPoint.y, endCoords.y],
            opacity: [isStartFade ? 0 : 1, 1, 1, isEndFade ? 0 : 1],
            scale: [isStartScaleUp ? 0 : 1, isStartScaleUp ? 1.06 : (isHorizontal ? 1.04 : 1), isHorizontal ? 1.04 : 1, isEndScaleDown ? 0 : 1],
            times: [0, s, e, 1],
            ease: [EASE_MOMENTUM, EASE_SMOOTH, EASE_SNAP_OUT],
        };
    }
    if (delayMode === 'end') {
        const vis = getVisibleHoldCoords(endPosition, endCoords);
        const hasExit = vis.x !== endCoords.x || vis.y !== endCoords.y || isEndScaleDown || isEndFade;
        const mo = hasExit ? 0.16 : 0;
        const hs = Math.max(0.08, 1 - hold - mo);
        const he = Math.min(0.94, hs + hold);
        return {
            x: [startCoords.x, vis.x, vis.x, endCoords.x],
            y: [startCoords.y, vis.y, vis.y, endCoords.y],
            opacity: [isStartFade ? 0 : 1, 1, 1, isEndFade ? 0 : 1],
            scale: [isStartScaleUp ? 0 : 1, 1, isEndScaleDown ? 1.05 : 1, isEndScaleDown ? 0 : 1],
            times: [0, hs, he, 1],
            ease: [EASE_SPRING_IN, EASE_SMOOTH, EASE_SNAP_OUT],
        };
    }
    return {
        x: [startCoords.x, endCoords.x],
        y: [startCoords.y, endCoords.y],
        opacity: [isStartFade ? 0 : 1, isEndFade ? 0 : 1],
        scale: [isStartScaleUp ? 0 : 1, isEndScaleDown ? 0 : 1],
        times: [0, 1],
        ease: EASE_MOMENTUM,
    };
};

// ─── Mock choice data ────────────────────────────────────────────────────────
const MOCK_CHOICES = [
    { key: 'A', label: 'ส่วนราชการสามารถอนุมัติเองได้ทันที', bg: '#e21b3c', shadow: '#b3152d', num: 'ก' },
    { key: 'B', label: 'ต้องรายงานให้ผู้บังคับบัญชาทราบภายหลัง', bg: '#1368ce', shadow: '#0e4e9c', num: 'ข' },
    { key: 'C', label: 'ต้องขอความเห็นชอบจากคณะรัฐมนตรีก่อน', bg: '#d89e00', shadow: '#a87b00', num: 'ค' },
    { key: 'D', label: 'ให้ผู้ว่าราชการจังหวัดอนุมัติแทนคณะรัฐมนตรี', bg: '#26890c', shadow: '#1a5e08', num: 'ง' },
];

// ─── BackgroundScene (identical to ExamTaking) ───────────────────────────────
const BackgroundScene = ({ scene }) => (
    <motion.div
        key={scene.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    >
        <div style={{ position: 'absolute', inset: 0, background: scene.bgGradient }} />
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.5 }}>
            {scene.animationUrl ? (
                <AdaptiveLottie
                    animationUrl={scene.animationUrl}
                    loop autoplay
                    scale="none"
                    className="w-full h-full object-cover"
                />
            ) : (
                <Lottie
                    animationData={scene.lottie}
                    loop autoplay
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMax slice' }}
                />
            )}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: scene.overlayTint }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
        {/* Particles */}
        {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{
                position: 'absolute',
                width: [2,3,2,4,2][i%5], height: [2,3,2,4,2][i%5],
                borderRadius: '50%',
                background: i%3===0?'#f0abfc':i%3===1?'#fde68a':'#fff',
                top: `${(i*31+5)%55}%`, left: `${(i*43+11)%95}%`,
                animation: `particle-twinkle-prev ${2.5+(i*0.41)%3.5}s ${(i*0.67)%4}s infinite ease-in-out`,
            }} />
        ))}
    </motion.div>
);

// ─── Animated layer that plays the configured animation ───────────────────────
const PreviewAnimatedLayer = ({ isAnimationDisabled, motionConfig, motionDuration, previewState, previewConfig, accentColor }) => {
    const [key, setKey] = React.useState(0);
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        setVisible(true);
        setKey(k => k + 1);
    }, [
        previewState.assetKey,
        previewState.startPosition,
        previewState.endPosition,
        previewState.durationText,
        previewState.delayMode,
        previewState.delayPercent,
        previewState.speedText,
    ]);

    if (isAnimationDisabled || (!previewConfig.animationData && !previewConfig.animationUrl)) return (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div
                className="inline-flex items-center gap-2 bg-slate-950/60 backdrop-blur-md rounded-2xl px-6 py-3.5 text-slate-200 text-sm font-bold"
                style={{ border: `1px solid ${accentColor}44` }}
            >
                <BellOff size={16} />
                <span>ไม่มีแอนิเมชัน</span>
            </div>
        </div>
    );

    if (!visible) return null;

    return (
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 20, overflow: 'hidden' }}>
            <motion.div
                key={key}
                style={{
                    position: 'absolute',
                    left: '50%', top: '60%',
                    translateX: '-50%', translateY: '-50%',
                }}
                initial={{
                    x: motionConfig.x[0],
                    y: motionConfig.y[0],
                    opacity: motionConfig.opacity ? motionConfig.opacity[0] : 1,
                    scale: motionConfig.scale ? motionConfig.scale[0] : 1,
                    filter: 'blur(3px)',
                }}
                animate={{
                    x: motionConfig.x,
                    y: motionConfig.y,
                    opacity: motionConfig.opacity || 1,
                    scale: motionConfig.scale || 1,
                    filter: ['blur(3px)', 'blur(0px)', 'blur(0px)', 'blur(2px)'],
                }}
                transition={{
                    duration: motionDuration,
                    ease: motionConfig.ease,
                    times: motionConfig.times,
                    filter: { duration: motionDuration, times: [0, 0.2, 0.85, 1], ease: 'linear' },
                }}
                onAnimationComplete={() => setVisible(false)}
            >
                <AdaptiveLottie
                    animationData={previewConfig.animationData}
                    animationUrl={previewConfig.animationUrl}
                    scale={previewConfig.scale}
                    direction={previewConfig.direction}
                    speed={previewConfig.speed}
                    forceLoop
                    display="inline"
                    className="mx-auto"
                />
            </motion.div>
        </div>
    );
};

// ─── Result preview (for exam-result presets) ────────────────────────────────
const ResultPreviewMockup = ({ isPassed, previewState, previewConfig, motionConfig, motionDuration, isAnimationDisabled, onClose, scene }) => (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <AnimatePresence mode="sync">
            <BackgroundScene key={scene.id} scene={scene} />
        </AnimatePresence>
        {/* Tint for result */}
        <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: isPassed ? 'rgba(22,163,74,0.45)' : 'rgba(220,38,38,0.45)',
        }} />

        <div className="relative z-10 flex items-center justify-between px-5 py-3.5">
            <span className="inline-flex items-center gap-2 bg-slate-950/50 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-bold text-white border border-white/15">
                <Film size={14} />
                <span>Result Preview</span>
            </span>
            <button
                type="button"
                onClick={onClose}
                aria-label="ปิดหน้าต่างพรีวิว"
                className="inline-flex items-center gap-1.5 bg-slate-950/50 hover:bg-slate-950/70 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white cursor-pointer text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                <X size={14} />
                <span>ปิด</span>
            </button>
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px 100px', minHeight: 'calc(100vh - 60px)' }}>
            <PreviewAnimatedLayer
                isAnimationDisabled={isAnimationDisabled}
                motionConfig={motionConfig}
                motionDuration={motionDuration}
                previewState={previewState}
                previewConfig={previewConfig}
                accentColor={isPassed ? '#4ade80' : '#f87171'}
            />

            <div className="text-center text-white mt-8 mb-5">
                <div className="inline-flex items-center justify-center gap-3 text-3xl sm:text-5xl font-black drop-shadow-lg">
                    {isPassed ? <Trophy size={38} className="text-amber-300" /> : <AlertCircle size={38} className="text-rose-200" />}
                    <span>{isPassed ? 'สอบผ่านแล้ว!' : 'ยังไม่ผ่านเกณฑ์'}</span>
                </div>
                <div className="text-base text-white/90 mt-2 font-semibold">
                    {isPassed ? 'ยอดเยี่ยมมาก ทำได้ดีแล้ว!' : 'ไม่เป็นไร ลองใหม่อีกครั้งนะ!'}
                </div>
            </div>

            <div className="bg-slate-950/55 backdrop-blur-xl border border-white/15 rounded-3xl p-6 w-full max-w-[360px] text-white text-center shadow-2xl">
                <div className="text-xs font-extrabold uppercase tracking-widest text-white/75 mb-1.5">คะแนนของคุณ</div>
                <div className="text-6xl font-black leading-none">
                    {isPassed ? '5' : '2'} <span className="text-2xl text-white/60">/ 5</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                    {[{ label: 'เวลาที่ใช้', value: '0 น. 25 วิ.' }, { label: 'ความแม่นยำ', value: isPassed ? '100%' : '40%' }].map(s => (
                        <div key={s.label} className="bg-white/10 rounded-2xl p-3 border border-white/10">
                            <div className="text-[11px] font-bold text-white/70 mb-1">{s.label}</div>
                            <div className="font-black text-base">{s.value}</div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <button type="button" className="bg-white/95 hover:bg-white text-slate-900 rounded-2xl py-3 px-2 font-extrabold text-sm cursor-pointer transition-colors">ทำอีกครั้ง</button>
                    <button type="button" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl py-3 px-2 font-extrabold text-sm cursor-pointer transition-colors">กลับหน้าหลัก</button>
                </div>
            </div>

            {/* Config pill */}
            <ConfigPill previewState={previewState} previewConfig={previewConfig} accentColor={isPassed ? '#4ade80' : '#f87171'} />
        </div>
    </div>
);

// ─── Config pill (bottom info bar) ──────────────────────────────────────────
const ConfigPill = ({ previewState, previewConfig, accentColor }) => (
    <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/75 backdrop-blur-xl px-4 py-2.5 flex flex-wrap items-center gap-1.5 justify-center"
        style={{ borderTop: `1px solid ${accentColor}33` }}
    >
        {[
            { icon: Package, value: previewState.assetKey ? (previewState.assetLabel || previewState.assetKey) : 'ปิด' },
            { icon: Clock, value: previewState.durationText || '0.8s' },
            { icon: Zap, value: `${previewState.speedText || previewConfig.speed || 1}x` },
            { icon: MapPin, value: `${POSITION_LABELS[previewState.startPosition] || 'กลาง'} → ${POSITION_LABELS[previewState.endPosition] || 'กลาง'}` },
            { icon: Hourglass, value: `${DELAY_LABELS[previewState.delayMode || 'normal']} ${previewState.delayPercent || 20}%` },
        ].map((item, i) => {
            const Icon = item.icon;
            return (
                <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs font-bold text-slate-100 whitespace-nowrap"
                    style={{ border: `1px solid ${accentColor}33` }}
                >
                    <Icon size={12} style={{ color: accentColor }} aria-hidden="true" />
                    <span>{item.value}</span>
                </span>
            );
        })}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AnimationPreviewMockup = ({ inlinePreviewState, onCloseHandler, activeScenes: externalActiveScenes }) => {
    const navigate  = useNavigate();
    const location  = useLocation();

    const previewState = inlinePreviewState || location.state || {};
    const preset = getAnimationPreset(previewState.presetKey || 'examSkipFirstAnswer');
    const asset  = previewState.assetKey ? getAnimationAsset(previewState.assetKey) : null;
    const isAnimationDisabled = !previewState.assetKey;

    const previewConfig = {
        ...preset,
        animationData: asset?.animationData || null,
        animationUrl:  previewState.animationUrl || asset?.animationUrl || null,
        scale:     previewState.scale || preset.scale,
        direction: 'center',
        speed:     Number.parseFloat(String(previewState.speedText || '').replace(/[^0-9.]/g, '')) || preset.speed || 1,
        loop: true,
    };

    const startCoords  = POSITION_COORDS[previewState.startPosition] || POSITION_COORDS.center;
    const endCoords    = POSITION_COORDS[previewState.endPosition]   || POSITION_COORDS.center;
    const motionDuration = parseDuration(previewState.durationText);
    const motionConfig = buildPreviewMotionConfig(
        previewState.startPosition, previewState.endPosition,
        startCoords, endCoords,
        previewState.delayMode, previewState.delayPercent,
    );

    // Scene cycling for demo
    const [sceneIdx, setSceneIdx] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showMilestone, setShowMilestone] = useState(null);
    const [questionIdx, setQuestionIdx] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [replayKey, setReplayKey] = useState(0);

    const activeScenes = externalActiveScenes || JOURNEY_SCENES;
    const scene = activeScenes[sceneIdx % activeScenes.length];
    const sceneAccent = scene.accentColor || scene.accent || '#818cf8';

    const onClose = useCallback(() => {
        if (onCloseHandler) onCloseHandler();
        else navigate('/admin/animations');
    }, [onCloseHandler, navigate]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleNextQuestion = useCallback(() => {
        const next = questionIdx + 1;
        const oldScene = Math.floor(questionIdx / 3);
        const newScene = Math.floor(next / 3);
        setQuestionIdx(next % 10);
        setSelectedChoice(null);
        if (newScene !== oldScene) {
            setIsRunning(true);
            setTimeout(() => {
                const ns = (sceneIdx + 1) % activeScenes.length;
                setSceneIdx(ns);
                setShowMilestone(activeScenes[ns].name);
                setTimeout(() => setShowMilestone(null), 2200);
            }, 750);
            setTimeout(() => setIsRunning(false), 1600);
        }
        setReplayKey(k => k + 1);
    }, [questionIdx, sceneIdx, activeScenes]);

    const isResultPreview = preset.usage === 'exam-result';
    const isPassedResult  = preset.key === 'examResultPass';
    const progressPct = ((questionIdx + 1) / 10) * 100;

    if (isResultPreview) {
        return (
            <ResultPreviewMockup
                isPassed={isPassedResult}
                previewState={previewState}
                previewConfig={previewConfig}
                motionConfig={motionConfig}
                motionDuration={motionDuration}
                isAnimationDisabled={isAnimationDisabled}
                onClose={onClose}
                scene={{ ...scene, accentColor: sceneAccent }}
            />
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', fontFamily: "'Nunito','Sarabun',sans-serif" }}>
            <style>{`
                @keyframes particle-twinkle-prev {
                    0%,100% { opacity:0.15; transform:scale(0.7); }
                    50%     { opacity:0.9;  transform:scale(1.4); }
                }
                @keyframes char-run-prev {
                    0%   { transform:translateX(-240px); opacity:0; }
                    8%   { opacity:1; }
                    92%  { opacity:1; }
                    100% { transform:translateX(240px); opacity:0; }
                }
                @keyframes shimmer-prev {
                    0%   { background-position:200% 0; }
                    100% { background-position:-200% 0; }
                }
                .progress-bar-fill-prev {
                    transition: width 0.5s cubic-bezier(0.34,1.3,0.64,1);
                    background: linear-gradient(90deg,#a855f7,#ec4899,#f59e0b,#a855f7);
                    background-size: 300% 100%;
                    animation: shimmer-prev 3s linear infinite;
                }
                .choice-pill { transition: filter 0.1s, transform 0.08s; }
                .choice-pill:hover { filter:brightness(1.15); transform:translateY(-2px); }
                .choice-pill:active { transform:translateY(4px) !important; filter:brightness(0.9); }
            `}</style>

            {/* ── Background journey scene ── */}
            <AnimatePresence mode="sync">
                <BackgroundScene key={scene.id} scene={scene} />
            </AnimatePresence>

            {/* ── Running character on scene change ── */}
            {isRunning && (
                <div style={{
                    position: 'absolute', bottom: '42%', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 20, width: 110, height: 110,
                    animation: 'char-run-prev 1.6s cubic-bezier(0.22,1,0.36,1) forwards',
                    pointerEvents: 'none',
                }}>
                    <Lottie animationData={runningAnimation} loop autoplay style={{ width: '100%', height: '100%' }} />
                </div>
            )}

            {/* ── Milestone badge ── */}
            <AnimatePresence>
                {showMilestone && (
                    <motion.div
                        key="ms"
                        initial={{ opacity: 0, y: -36, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -24, scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                        style={{
                            position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
                            zIndex: 100,
                            background: 'rgba(2,6,23,0.82)', backdropFilter: 'blur(16px)',
                            border: `1px solid ${sceneAccent}55`, borderRadius: 99,
                            padding: '9px 22px', color: sceneAccent,
                            fontWeight: 900, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: `0 4px 24px ${sceneAccent}44`,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <MapPin size={15} />
                        <span>มาถึง {showMilestone} แล้ว!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Lottie animation overlay (plays configured preset) ── */}
            <PreviewAnimatedLayer
                key={replayKey}
                isAnimationDisabled={isAnimationDisabled}
                motionConfig={motionConfig}
                motionDuration={motionDuration}
                previewState={previewState}
                previewConfig={previewConfig}
                accentColor={sceneAccent}
            />

            {/* ── Top bar ── */}
            <div className="relative z-30 flex items-center justify-between px-4 py-3 gap-2 flex-wrap">
                <span
                    className="inline-flex items-center gap-2 bg-slate-950/55 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white"
                    style={{ border: `1px solid ${sceneAccent}44` }}
                >
                    <Film size={14} style={{ color: sceneAccent }} />
                    <span>Preview — {preset.name}</span>
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setReplayKey(k => k + 1)}
                        title="เล่นอีกครั้ง"
                        aria-label="เล่นแอนิเมชันใหม่อีกครั้ง"
                        className="inline-flex items-center gap-1.5 bg-slate-950/55 hover:bg-slate-900/75 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        style={{ border: `1px solid ${sceneAccent}55`, color: sceneAccent }}
                    >
                        <RotateCcw size={13} />
                        <span>เล่นใหม่</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดหน้าต่างพรีวิว"
                        className="inline-flex items-center gap-1.5 bg-slate-950/55 hover:bg-slate-900/75 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 text-white cursor-pointer text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                        <X size={13} />
                        <span>ปิด</span>
                    </button>
                </div>
            </div>

            {/* ── Main mock exam content ── */}
            <div style={{ position: 'relative', zIndex: 10, padding: '0 16px 120px', maxWidth: 860, margin: '0 auto' }}>

                {/* Progress bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 99, overflow: 'hidden', marginBottom: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="progress-bar-fill-prev" style={{ height: '100%', width: `${progressPct}%`, borderRadius: 99 }} />
                </div>

                {/* Counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div
                        className="bg-slate-950/50 backdrop-blur-md rounded-full px-4 py-1.5 font-extrabold text-white text-sm inline-flex items-center gap-2"
                        style={{ border: `1px solid ${sceneAccent}44` }}
                    >
                        <span style={{ color: sceneAccent }}>{renderSceneIcon(scene.id, 15)}</span>
                        <span>{questionIdx + 1}</span>
                        <span className="opacity-55">/ 10</span>
                    </div>
                    {/* Scene dots */}
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {activeScenes.map((s, i) => (
                            <div
                                key={s.id}
                                style={{
                                    width: i === sceneIdx ? 20 : 6,
                                    height: 6,
                                    borderRadius: 99,
                                    background: i === sceneIdx ? sceneAccent : 'rgba(255,255,255,0.22)',
                                    transition: 'all 0.4s',
                                    boxShadow: i === sceneIdx ? `0 0 8px ${sceneAccent}` : 'none'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Question card */}
                <motion.div
                    key={`qcard-${questionIdx}`}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background: 'rgba(2,6,23,0.52)', backdropFilter: 'blur(24px)',
                        border: `1px solid ${sceneAccent}33`, borderRadius: '1.4rem',
                        padding: 'clamp(14px,4vw,24px)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                        marginBottom: 16,
                        transition: 'border-color 0.5s',
                    }}
                >
                    <div style={{ fontSize: 'clamp(0.9rem,2.5vw,1.15rem)', fontWeight: 800, color: 'white', lineHeight: 1.65, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        ข้อใดต่อไปนี้กล่าวถูกต้องเกี่ยวกับการโอนรับงบประมาณรายจ่ายระหว่างส่วนราชการ
                        <br /><span style={{ opacity: 0.65, fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>(ข้อที่ {questionIdx + 1} / ฉากปัจจุบัน: {scene.name})</span>
                    </div>
                </motion.div>

                {/* Choices */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 12 }}>
                    {MOCK_CHOICES.map((c, idx) => {
                        const sel = selectedChoice === c.key;
                        return (
                            <motion.button
                                key={`${questionIdx}-${c.key}`}
                                type="button"
                                className="choice-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                initial={{ opacity: 0, y: 18, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: idx * 0.06, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                                onClick={() => setSelectedChoice(c.key)}
                                style={{
                                    background: c.bg, border: 'none', borderRadius: '0.85rem',
                                    padding: 'clamp(12px,3vw,18px) clamp(14px,3vw,20px)',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    cursor: 'pointer', textAlign: 'left', width: '100%',
                                    boxShadow: sel
                                        ? `0 0 0 3px white, 0 0 0 6px rgba(255,255,255,0.22), 0 6px 0 ${c.shadow}`
                                        : `0 6px 0 ${c.shadow}`,
                                    transition: 'box-shadow 0.1s',
                                }}
                            >
                                <span style={{ minWidth: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.22)', border: '2px solid rgba(255,255,255,0.35)', fontWeight: 900, fontSize: '0.95rem', color: 'white', flexShrink: 0 }}>
                                    {c.num}
                                </span>
                                <span style={{ fontWeight: 800, color: 'white', fontSize: 'clamp(0.8rem,2vw,0.95rem)', lineHeight: 1.4, flexGrow: 1, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                                    {c.label}
                                </span>
                                {sel && (
                                    <span className="flex-shrink-0 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white">
                                        <Check size={14} />
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom nav ── */}
            <div
                className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/75 backdrop-blur-xl px-4 py-2.5 transition-colors"
                style={{ borderTop: `1px solid ${sceneAccent}33` }}
            >
                <div className="max-w-[860px] mx-auto flex justify-between items-center gap-2 flex-wrap">
                    {/* Config tags */}
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {[
                            { icon: Package, label: previewState.assetKey || 'ปิด' },
                            { icon: Clock, label: previewState.durationText || '0.8s' },
                            { icon: Zap, label: `${previewState.speedText || previewConfig.speed || 1}x` },
                        ].map((tag, i) => {
                            const Icon = tag.icon;
                            return (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-1 text-xs font-bold text-slate-200 whitespace-nowrap"
                                    style={{ border: `1px solid ${sceneAccent}33` }}
                                >
                                    <Icon size={12} style={{ color: sceneAccent }} aria-hidden="true" />
                                    <span>{tag.label}</span>
                                </span>
                            );
                        })}
                    </div>
                    {/* Next question button */}
                    <button
                        type="button"
                        onClick={handleNextQuestion}
                        style={{
                            background: sceneAccent, color: '#0f172a',
                            border: 'none', borderRadius: 99,
                            padding: '10px 22px', fontWeight: 900, fontSize: '0.9rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: `0 4px 0 rgba(0,0,0,0.3), 0 6px 18px ${sceneAccent}55`,
                            whiteSpace: 'nowrap', flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = `0 1px 0 rgba(0,0,0,0.3)`; }}
                        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 0 rgba(0,0,0,0.3), 0 6px 18px ${sceneAccent}55`; }}
                    >
                        <Play size={14} />
                        <span>ข้อถัดไป</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnimationPreviewMockup;
