import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, PlayCircle, ArrowRight, Triangle, Diamond, Circle, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import AdaptiveLottie from '../../components/common/AdaptiveLottie';
import { getAnimationAsset, getAnimationPreset } from '../../config/animationRegistry';

const choiceCards = [
    { key: 'A', label: 'ส่วนราชการสามารถอนุมัติเองได้ทันที', color: 'bg-[#e21b3c]', icon: Triangle },
    { key: 'B', label: 'ต้องรายงานให้ใครทราบภายหลังการดำเนินงานก่อน', color: 'bg-[#1368ce]', icon: Diamond },
    { key: 'C', label: 'ต้องขอความเห็นชอบจากคณะรัฐมนตรีก่อนดำเนินการ', color: 'bg-[#d89e00]', icon: Circle },
    { key: 'D', label: 'ให้ผู้ว่าราชการจังหวัดอนุมัติแทนคณะรัฐมนตรี', color: 'bg-[#26890c]', icon: Square }
];

const POSITION_COORDS = {
    center: { x: 0, y: 0 },
    left: { x: -220, y: 0 },
    right: { x: 220, y: 0 },
    up: { x: 0, y: -180 },
    down: { x: 0, y: 180 },
    'offscreen-left': { x: -900, y: 0 },
    'offscreen-right': { x: 900, y: 0 },
    'offscreen-top': { x: 0, y: -560 },
    'offscreen-bottom': { x: 0, y: 560 }
};

const ONSCREEN_POSITION_BY_OFFSCREEN = {
    'offscreen-left': 'left',
    'offscreen-right': 'right',
    'offscreen-top': 'up',
    'offscreen-bottom': 'down'
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
    'offscreen-bottom': 'นอกจอล่าง'
};

const DELAY_LABELS = {
    normal: 'ปกติ',
    start: 'หน่วงช่วงเริ่ม',
    middle: 'หน่วงช่วงกลาง',
    end: 'หน่วงช่วงปลาย'
};

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
    const mappedPosition = ONSCREEN_POSITION_BY_OFFSCREEN[positionKey];
    if (mappedPosition && POSITION_COORDS[mappedPosition]) {
        return POSITION_COORDS[mappedPosition];
    }

    return fallbackCoords;
};

const buildPreviewMotionConfig = (startPosition, endPosition, startCoords, endCoords, delayMode, delayPercent) => {
    const hold = parseDelayPercent(delayPercent);
    const midPoint = {
        x: (startCoords.x + endCoords.x) / 2,
        y: (startCoords.y + endCoords.y) / 2
    };

    if (delayMode === 'start') {
        const visibleStart = getVisibleHoldCoords(startPosition, startCoords);
        const moveInTime = (visibleStart.x !== startCoords.x || visibleStart.y !== startCoords.y) ? 0.18 : 0;
        return {
            x: [startCoords.x, visibleStart.x, visibleStart.x, endCoords.x],
            y: [startCoords.y, visibleStart.y, visibleStart.y, endCoords.y],
            times: [0, moveInTime, Math.min(moveInTime + hold, 0.92), 1],
            ease: 'linear'
        };
    }

    if (delayMode === 'middle') {
        const startMoveEnd = Math.max(0.1, 0.5 - hold / 2);
        const endMoveStart = Math.min(0.9, 0.5 + hold / 2);
        return {
            x: [startCoords.x, midPoint.x, midPoint.x, endCoords.x],
            y: [startCoords.y, midPoint.y, midPoint.y, endCoords.y],
            times: [0, startMoveEnd, endMoveStart, 1],
            ease: 'linear'
        };
    }

    if (delayMode === 'end') {
        const visibleEnd = getVisibleHoldCoords(endPosition, endCoords);
        const moveOutTime = (visibleEnd.x !== endCoords.x || visibleEnd.y !== endCoords.y) ? 0.18 : 0;
        const holdStart = Math.max(0.08, 1 - hold - moveOutTime);
        const holdEnd = Math.min(0.96, holdStart + hold);
        return {
            x: [startCoords.x, visibleEnd.x, visibleEnd.x, endCoords.x],
            y: [startCoords.y, visibleEnd.y, visibleEnd.y, endCoords.y],
            times: [0, holdStart, holdEnd, 1],
            ease: 'linear'
        };
    }

    return {
        x: [startCoords.x, endCoords.x],
        y: [startCoords.y, endCoords.y],
        times: [0, 1],
        ease: 'easeInOut'
    };
};

const PreviewAnimatedLayer = ({ isAnimationDisabled, motionConfig, motionDuration, previewState, previewConfig }) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        setIsVisible(true);
    }, [
        previewState.assetKey,
        previewState.startPosition,
        previewState.endPosition,
        previewState.durationText,
        previewState.delayMode,
        previewState.delayPercent,
        previewState.speedText
    ]);

    if (isAnimationDisabled || !isVisible) return null;

    return (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
            <motion.div
                className="absolute left-1/2 top-[60%]"
                initial={{ x: motionConfig.x[0], y: motionConfig.y[0] }}
                animate={{ x: motionConfig.x, y: motionConfig.y }}
                transition={{ duration: motionDuration, ease: motionConfig.ease, times: motionConfig.times }}
                onAnimationComplete={() => setIsVisible(false)}
                style={{ translateX: '-50%', translateY: '-50%' }}
            >
                <AdaptiveLottie
                    key={`${previewState.presetKey || 'preset'}-${previewState.assetKey || 'disabled'}-${previewState.speedText || previewConfig.speed || 1}`}
                    animationData={previewConfig.animationData}
                    scale={previewConfig.scale}
                    direction={previewConfig.direction}
                    speed={previewConfig.speed}
                    forceLoop
                    overlayOffsetY={170}
                    display="inline"
                    className="mx-auto"
                />
            </motion.div>
        </div>
    );
};

const ResultPreviewMockup = ({ isPassed, previewState, previewConfig, motionConfig, motionDuration, isAnimationDisabled, onClose }) => (
    <div className={`relative min-h-screen overflow-hidden ${isPassed ? 'bg-[#16a34a]' : 'bg-[#ef5350]'}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute left-[-8%] top-[-10%] h-[38vw] w-[38vw] max-h-[420px] max-w-[420px] rounded-full ${isPassed ? 'bg-[#15803d]/70' : 'bg-[#c62828]/70'}`} />
            <div className={`absolute bottom-[-14%] right-[-10%] h-[42vw] w-[42vw] max-h-[500px] max-w-[500px] rounded-full ${isPassed ? 'bg-[#22c55e]/40' : 'bg-[#ef9a9a]/35'}`} />
        </div>

        <div className="relative z-10 flex items-center justify-between px-6 py-4 text-white">
            <div className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                Mockup Preview
            </div>
            <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
            >
                <X size={16} />
                Close
            </button>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col items-center px-4 pb-10 pt-2">
            <PreviewAnimatedLayer
                isAnimationDisabled={isAnimationDisabled}
                motionConfig={motionConfig}
                motionDuration={motionDuration}
                previewState={previewState}
                previewConfig={previewConfig}
            />

            <div className="mt-6 flex w-full max-w-3xl flex-col items-center">
                <div className="mb-4 h-3 w-24 rounded-full bg-white/60" />
                <div className="text-center text-4xl font-black text-white drop-shadow-md md:text-5xl">
                    {isPassed ? 'สอบผ่านแล้ว!' : 'ยังไม่ผ่านเกณฑ์'}
                </div>
                <div className="mt-2 text-center text-sm font-semibold text-white/90 md:text-base">
                    {isPassed ? 'ยอดเยี่ยมมาก ทำได้ดีแล้วลุยต่อไป!' : 'ไม่เป็นไร ลองใหม่อีกครั้งนะ คุณทำได้แน่!'}
                </div>

                <div className="mt-5 w-full max-w-sm rounded-[2rem] border border-white/20 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-white/80">คะแนนของคุณ</div>
                    <div className="text-6xl font-black">
                        {isPassed ? '5' : '2'} <span className="text-2xl text-white/65">/ 5</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-[1.2rem] border border-white/20 bg-white/10 p-3">
                            <div className="text-[11px] font-bold text-white/70">เวลาที่ใช้</div>
                            <div className="mt-1 text-base font-extrabold">0 น. 25 วิ.</div>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/20 bg-white/10 p-3">
                            <div className="text-[11px] font-bold text-white/70">ความแม่นยำ</div>
                            <div className="mt-1 text-base font-extrabold">{isPassed ? '100.0%' : '40.0%'}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 h-[56px] w-full max-w-sm rounded-xl bg-white/95 shadow-md" />

                <div className="mt-4 grid w-full max-w-sm grid-cols-1 gap-3 sm:grid-cols-2">
                    <button type="button" className="rounded-2xl bg-white px-5 py-4 text-sm font-extrabold text-slate-800 shadow-lg">
                        ทำข้อสอบอีกครั้ง
                    </button>
                    <button type="button" className="rounded-2xl border border-white/20 bg-white/20 px-5 py-4 text-sm font-extrabold text-white shadow-lg backdrop-blur-sm">
                        กลับสู่แดชบอร์ด
                    </button>
                </div>
            </div>

            <div className="mt-auto flex w-full items-center justify-between border-t border-white/20 bg-white/10 px-6 py-4 text-white backdrop-blur-md">
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                    asset: {previewState.assetKey ? `${previewState.assetKey}.json` : 'ปิดแอนิเมชัน'}
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium md:block">
                        เวลา: {previewState.durationText || '0.8s'}
                    </div>
                    <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium md:block">
                        speed: {previewState.speedText || previewConfig.speed || 1}x
                    </div>
                    <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium lg:block">
                        {DELAY_LABELS[previewState.delayMode || 'normal'] || 'ปกติ'} {previewState.delayPercent || '20'}%
                    </div>
                    <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium lg:block">
                        {POSITION_LABELS[previewState.startPosition || 'center'] || 'กลางจอ'} → {POSITION_LABELS[previewState.endPosition || 'center'] || 'กลางจอ'}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AnimationPreviewMockup = ({ inlinePreviewState, onCloseHandler }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const previewState = inlinePreviewState || location.state || {};
    const preset = getAnimationPreset(previewState.presetKey || 'examSkipFirstAnswer');
    const asset = previewState.assetKey ? getAnimationAsset(previewState.assetKey) : null;
    const isAnimationDisabled = !previewState.assetKey;

    const previewConfig = {
        ...preset,
        animationData: asset?.animationData || null,
        scale: previewState.scale || preset.scale,
        direction: 'center',
        speed: Number.parseFloat(String(previewState.speedText || '').replace(/[^0-9.]/g, '')) || preset.speed || 1,
        loop: true
    };
    const startCoords = POSITION_COORDS[previewState.startPosition] || POSITION_COORDS.center;
    const endCoords = POSITION_COORDS[previewState.endPosition] || POSITION_COORDS.center;
    const motionDuration = parseDuration(previewState.durationText);
    const motionConfig = buildPreviewMotionConfig(
        previewState.startPosition,
        previewState.endPosition,
        startCoords,
        endCoords,
        previewState.delayMode,
        previewState.delayPercent
    );
    const isResultPreview = preset.usage === 'exam-result';
    const isPassedResult = preset.key === 'examResultPass';

    if (isResultPreview) {
        return (
            <ResultPreviewMockup
                isPassed={isPassedResult}
                previewState={previewState}
                previewConfig={previewConfig}
                motionConfig={motionConfig}
                motionDuration={motionDuration}
                isAnimationDisabled={isAnimationDisabled}
                onClose={() => onCloseHandler ? onCloseHandler() : navigate('/admin/animations')}
            />
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#5b21b6]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute left-[-2%] top-[18%] h-48 w-48 rotate-12 rounded-3xl bg-white/8" />
                <div className="absolute right-[6%] top-[20%] h-32 w-32 rotate-12 rounded-3xl bg-white/8" />
                <div className="absolute left-[10%] bottom-[8%] h-44 w-44 rounded-full bg-white/7" />
                <div className="absolute right-[14%] bottom-[20%] h-28 w-28 rotate-45 rounded-2xl bg-white/8" />
            </div>

            <div className="relative z-10 flex items-center justify-between px-6 py-4 text-white">
                <div className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    Mockup Preview
                </div>
                <button
                    type="button"
                    onClick={() => onCloseHandler ? onCloseHandler() : navigate('/admin/animations')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                    <X size={16} />
                    Close
                </button>
            </div>

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl flex-col items-center px-4 pb-10 pt-4">
                <div className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                    1 / 10
                </div>

                <div className="mb-6 w-full max-w-4xl rounded-[2rem] border border-white/20 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-md">
                    <div className="text-lg font-extrabold md:text-2xl">
                        ข้อใดต่อไปนี้กล่าวถูกต้องเกี่ยวกับการโอนรับงบประมาณรายจ่ายระหว่างส่วนราชการ
                    </div>
                </div>

                <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                    {choiceCards.map((choice) => {
                        const Icon = choice.icon;
                        return (
                            <div
                                key={choice.key}
                                className={`flex min-h-[92px] items-center gap-4 rounded-[1.3rem] border border-white/15 px-5 py-4 text-white shadow-xl ${choice.color}`}
                            >
                                <div className="rounded-full bg-white/15 p-2">
                                    <Icon size={18} />
                                </div>
                                <div className="text-sm font-bold leading-6 md:text-base">{choice.label}</div>
                            </div>
                        );
                    })}
                </div>

                <PreviewAnimatedLayer
                    isAnimationDisabled={isAnimationDisabled}
                    motionConfig={motionConfig}
                    motionDuration={motionDuration}
                    previewState={previewState}
                    previewConfig={previewConfig}
                />

                <div className="mt-auto flex w-full items-center justify-between border-t border-white/20 bg-white/10 px-6 py-4 text-white backdrop-blur-md">
                    <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                        asset: {previewState.assetKey ? `${previewState.assetKey}.json` : 'ปิดแอนิเมชัน'}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium md:block">
                            เวลา: {previewState.durationText || '0.8s'}
                        </div>
                        <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium md:block">
                            speed: {previewState.speedText || previewConfig.speed || 1}x
                        </div>
                        <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium lg:block">
                            {DELAY_LABELS[previewState.delayMode || 'normal'] || 'ปกติ'} {previewState.delayPercent || '20'}%
                        </div>
                        <div className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium lg:block">
                            {POSITION_LABELS[previewState.startPosition || 'center'] || 'กลางจอ'} → {POSITION_LABELS[previewState.endPosition || 'center'] || 'กลางจอ'}
                        </div>
                        <button
                            type="button"
                            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#5b21b6] shadow-xl"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    <span className="mr-2 inline-flex align-middle"><PlayCircle size={15} /></span>
                    โน้ต: {previewState.noteText || 'บันทึก'}
                </div>
            </div>
        </div>
    );
};

export default AnimationPreviewMockup;
