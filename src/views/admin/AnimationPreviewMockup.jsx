import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronLeft, MapPin, Play, RotateCcw } from 'lucide-react';
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
        emoji: '🌅',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #1a0533 0%, #3b0764 40%, #7c2d12 80%, #92400e 100%)',
        overlayTint: 'rgba(120, 40, 20, 0.25)',
        accentColor: '#f97316',
    },
    {
        id: 'forest',
        name: 'ป่าลึก',
        emoji: '🌲',
        lottie: mainSceneCAnimation,
        bgGradient: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 70%, #15803d 100%)',
        overlayTint: 'rgba(5, 46, 22, 0.35)',
        accentColor: '#4ade80',
    },
    {
        id: 'city',
        name: 'เมืองใหม่',
        emoji: '🏙️',
        lottie: mainSceneDAnimation,
        bgGradient: 'linear-gradient(160deg, #020617 0%, #0f172a 40%, #1e3a5f 80%, #1e40af 100%)',
        overlayTint: 'rgba(30, 64, 175, 0.2)',
        accentColor: '#60a5fa',
    },
    {
        id: 'summit',
        name: 'ยอดเขา',
        emoji: '🏔️',
        lottie: mainSceneBAnimation,
        bgGradient: 'linear-gradient(160deg, #0c0a09 0%, #1c1917 30%, #292524 60%, #44403c 100%)',
        overlayTint: 'rgba(120, 113, 108, 0.2)',
        accentColor: '#e2e8f0',
    },
];

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
    { key: 'A', label: 'ส่วนราชการสามารถอนุมัติเองได้ทันที', bg: '#e21b3c', shadow: '#b3152d', num: '1' },
    { key: 'B', label: 'ต้องรายงานให้ผู้บังคับบัญชาทราบภายหลัง', bg: '#1368ce', shadow: '#0e4e9c', num: '2' },
    { key: 'C', label: 'ต้องขอความเห็นชอบจากคณะรัฐมนตรีก่อน', bg: '#d89e00', shadow: '#a87b00', num: '3' },
    { key: 'D', label: 'ให้ผู้ว่าราชการจังหวัดอนุมัติแทนคณะรัฐมนตรี', bg: '#26890c', shadow: '#1a5e08', num: '4' },
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
        <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
        }}>
            <div style={{
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
                border: `1px solid ${accentColor}44`, borderRadius: 16,
                padding: '14px 24px', color: 'rgba(255,255,255,0.5)',
                fontSize: '0.85rem', fontWeight: 700,
            }}>
                🔕 ไม่มีแอนนิเมชัน
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

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <span style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderRadius: 99, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                🎬 Result Preview
            </span>
            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '8px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700 }}>
                <X size={14} /> ปิด
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

            <div style={{ textAlign: 'center', color: 'white', marginTop: 32, marginBottom: 20 }}>
                <div style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {isPassed ? '🎉 สอบผ่านแล้ว!' : '😓 ยังไม่ผ่านเกณฑ์'}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.85, marginTop: 6, fontWeight: 600 }}>
                    {isPassed ? 'ยอดเยี่ยมมาก ทำได้ดีแล้ว!' : 'ไม่เป็นไร ลองใหม่อีกครั้งนะ!'}
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360, color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: 6 }}>คะแนนของคุณ</div>
                <div style={{ fontSize: 'clamp(3rem,10vw,5rem)', fontWeight: 900, lineHeight: 1 }}>
                    {isPassed ? '5' : '2'} <span style={{ fontSize: '1.5rem', opacity: 0.55 }}>/ 5</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                    {[{ label: 'เวลาที่ใช้', value: '0 น. 25 วิ.' }, { label: 'ความแม่นยำ', value: isPassed ? '100%' : '40%' }].map(s => (
                        <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.6, marginBottom: 4 }}>{s.label}</div>
                            <div style={{ fontWeight: 900, fontSize: '1rem' }}>{s.value}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    <button style={{ background: 'rgba(255,255,255,0.95)', color: '#111', border: 'none', borderRadius: 14, padding: '12px 8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>ทำอีกครั้ง</button>
                    <button style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '12px 8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>กลับหน้าหลัก</button>
                </div>
            </div>

            {/* Config pill */}
            <ConfigPill previewState={previewState} previewConfig={previewConfig} accentColor={isPassed ? '#4ade80' : '#f87171'} />
        </div>
    </div>
);

// ─── Config pill (bottom info bar) ──────────────────────────────────────────
const ConfigPill = ({ previewState, previewConfig, accentColor }) => (
    <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${accentColor}33`,
        padding: '10px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: 6, justifyContent: 'center',
    }}>
        {[
            { label: '📦', value: previewState.assetKey ? (previewState.assetLabel || previewState.assetKey) : 'ปิด' },
            { label: '⏱', value: previewState.durationText || '0.8s' },
            { label: '⚡', value: `${previewState.speedText || previewConfig.speed || 1}x` },
            { label: '📍', value: `${POSITION_LABELS[previewState.startPosition] || 'กลาง'} → ${POSITION_LABELS[previewState.endPosition] || 'กลาง'}` },
            { label: '⏳', value: `${DELAY_LABELS[previewState.delayMode || 'normal']} ${previewState.delayPercent || 20}%` },
        ].map((item, i) => (
            <span key={i} style={{
                background: 'rgba(255,255,255,0.1)', border: `1px solid ${accentColor}33`,
                borderRadius: 99, padding: '4px 10px',
                fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
            }}>
                {item.label} {item.value}
            </span>
        ))}
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
                setShowMilestone(activeScenes[ns].emoji + ' ' + activeScenes[ns].name);
                setTimeout(() => setShowMilestone(null), 2200);
            }, 750);
            setTimeout(() => setIsRunning(false), 1600);
        }
        setReplayKey(k => k + 1);
    }, [questionIdx, sceneIdx]);

    const isResultPreview = preset.usage === 'exam-result';
    const isPassedResult  = preset.key === 'examResultPass';
    const onClose = () => onCloseHandler ? onCloseHandler() : navigate('/admin/animations');
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
                scene={scene}
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
                            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)',
                            border: `1px solid ${scene.accentColor}55`, borderRadius: 99,
                            padding: '9px 22px', color: scene.accentColor,
                            fontWeight: 900, fontSize: '1rem',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: `0 4px 24px ${scene.accentColor}44`,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <MapPin size={14} /> มาถึง {showMilestone} แล้ว!
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
                accentColor={scene.accentColor}
            />

            {/* ── Top bar ── */}
            <div style={{ position: 'relative', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', borderRadius: 99, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, color: 'white', border: `1px solid ${scene.accentColor}44`, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🎬 Preview — {preset.name}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setReplayKey(k => k + 1)} title="เล่นอีกครั้ง" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: `1px solid ${scene.accentColor}55`, borderRadius: 99, padding: '7px 14px', color: scene.accentColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 700 }}>
                        <RotateCcw size={13} /> เล่นใหม่
                    </button>
                    <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '7px 14px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 700 }}>
                        <X size={13} /> ปิด
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
                    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', borderRadius: 99, padding: '5px 16px', fontWeight: 800, color: 'white', fontSize: '0.9rem', border: `1px solid ${scene.accentColor}44`, display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: scene.accentColor }}>{scene.emoji}</span>
                        <span>{questionIdx + 1}</span>
                        <span style={{ opacity: 0.4 }}>/ 10</span>
                    </div>
                    {/* Scene dots */}
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {activeScenes.map((s, i) => (
                            <div key={s.id} style={{ width: i === sceneIdx ? 20 : 6, height: 6, borderRadius: 99, background: i === sceneIdx ? scene.accentColor : 'rgba(255,255,255,0.22)', transition: 'all 0.4s', boxShadow: i === sceneIdx ? `0 0 8px ${scene.accentColor}` : 'none' }} />
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
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(24px)',
                        border: `1px solid ${scene.accentColor}33`, borderRadius: '1.4rem',
                        padding: 'clamp(14px,4vw,24px)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                        marginBottom: 16,
                        transition: 'border-color 0.5s',
                    }}
                >
                    <div style={{ fontSize: 'clamp(0.9rem,2.5vw,1.15rem)', fontWeight: 800, color: 'white', lineHeight: 1.65, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        ข้อใดต่อไปนี้กล่าวถูกต้องเกี่ยวกับการโอนรับงบประมาณรายจ่ายระหว่างส่วนราชการ
                        <br /><span style={{ opacity: 0.4, fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace' }}>(ข้อที่ {questionIdx + 1} / ฉากปัจจุบัน: {scene.name})</span>
                    </div>
                </motion.div>

                {/* Choices */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 12 }}>
                    {MOCK_CHOICES.map((c, idx) => {
                        const sel = selectedChoice === c.key;
                        return (
                            <motion.button
                                key={`${questionIdx}-${c.key}`}
                                className="choice-pill"
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
                                {sel && <span style={{ flexShrink: 0, width: 24, height: 24, background: 'rgba(255,255,255,0.28)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span>}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom nav ── */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${scene.accentColor}33`,
                padding: '10px 16px', transition: 'border-color 0.5s',
            }}>
                <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Config tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
                        {[
                            `📦 ${previewState.assetKey || 'ปิด'}`,
                            `⏱ ${previewState.durationText || '0.8s'}`,
                            `⚡ ${previewState.speedText || previewConfig.speed || 1}x`,
                        ].map((tag, i) => (
                            <span key={i} style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${scene.accentColor}33`, borderRadius: 99, padding: '3px 9px', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                    {/* Next question button */}
                    <button
                        onClick={handleNextQuestion}
                        style={{
                            background: scene.accentColor, color: '#111',
                            border: 'none', borderRadius: 99,
                            padding: '10px 22px', fontWeight: 900, fontSize: '0.9rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: `0 4px 0 rgba(0,0,0,0.3), 0 6px 18px ${scene.accentColor}55`,
                            whiteSpace: 'nowrap', flexShrink: 0,
                            transition: 'all 0.15s',
                        }}
                        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = `0 1px 0 rgba(0,0,0,0.3)`; }}
                        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 0 rgba(0,0,0,0.3), 0 6px 18px ${scene.accentColor}55`; }}
                    >
                        <Play size={14} /> ข้อถัดไป <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnimationPreviewMockup;
