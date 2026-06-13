import React, { useEffect, useMemo, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { ArrowRightCircle, CheckCircle2, CircleX } from 'lucide-react';

const SCALE_MAP = {
    badge: { width: 'min(24vw, 180px)', height: 'min(24vw, 180px)' },
    card: { width: 'min(100%, 260px)', height: 'min(60vw, 260px)' },
    half: { width: 'min(52vw, 560px)', height: 'min(52vw, 560px)' },
    full: { width: 'min(88vw, 960px)', height: 'min(88vw, 960px)' }
};

const OFFSET_MAP = {
    center: { x: 0, y: 0 },
    up: { x: 0, y: -14 },
    down: { x: 0, y: 14 },
    left: { x: -18, y: 0 },
    right: { x: 18, y: 0 }
};

const ICON_MAP = {
    check: CheckCircle2,
    close: CircleX,
    next: ArrowRightCircle
};

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

const parseDuration = (input) => {
    const parsed = Number.parseFloat(String(input || '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0.8;
};

const getAnimationDurationSeconds = (animationData) => {
    const frameRate = Number(animationData?.fr);
    const inPoint = Number(animationData?.ip);
    const outPoint = Number(animationData?.op);

    if (!Number.isFinite(frameRate) || frameRate <= 0) return null;
    if (!Number.isFinite(inPoint) || !Number.isFinite(outPoint) || outPoint <= inPoint) return null;

    return (outPoint - inPoint) / frameRate;
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

const buildMotionConfig = (startPosition, endPosition, delayMode, delayPercent) => {
    const startCoords = POSITION_COORDS[startPosition] || POSITION_COORDS.center;
    const endCoords = POSITION_COORDS[endPosition] || POSITION_COORDS.center;
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

const AdaptiveLottie = ({
    animationData,
    scale = 'half',
    direction = 'center',
    display = 'inline',
    loop = false,
    autoplay = true,
    speed = 1,
    icon,
    title,
    onComplete,
    className = '',
    showBackdrop = false,
    startPosition = 'center',
    endPosition = 'center',
    durationText = '0.8s',
    delayMode = 'normal',
    delayPercent = '20',
    useMotionPath = false,
    hideAfterDuration = false,
    forceLoop = false,
    overlayOffsetY = 0
}) => {
    const lottieRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    const sizeStyle = SCALE_MAP[scale] || SCALE_MAP.half;
    const offset = OFFSET_MAP[direction] || OFFSET_MAP.center;
    const Icon = icon ? ICON_MAP[icon] : null;

    const frameStyle = useMemo(() => ({
        ...sizeStyle,
        maxWidth: '100%',
        maxHeight: '100%',
        transform: `translate(${offset.x}px, ${offset.y}px)`
    }), [offset.x, offset.y, sizeStyle]);

    const motionConfig = useMemo(() => {
        const config = buildMotionConfig(startPosition, endPosition, delayMode, delayPercent);
        return {
            ...config,
            duration: parseDuration(durationText)
        };
    }, [startPosition, endPosition, delayMode, delayPercent, durationText]);

    const effectiveLoop = useMemo(() => {
        if (loop || forceLoop) return true;

        const animationDurationSeconds = getAnimationDurationSeconds(animationData);
        if (!animationDurationSeconds || !useMotionPath) return false;

        const playbackDurationSeconds = animationDurationSeconds / (speed > 0 ? speed : 1);
        return playbackDurationSeconds < motionConfig.duration;
    }, [animationData, forceLoop, loop, motionConfig.duration, speed, useMotionPath]);

    useEffect(() => {
        if (!lottieRef.current) return undefined;
        lottieRef.current.loop = effectiveLoop;
        lottieRef.current.setSpeed?.(speed);
        if (autoplay) {
            lottieRef.current.play?.();
        } else {
            lottieRef.current.stop?.();
        }
    }, [animationData, autoplay, effectiveLoop, speed]);

    useEffect(() => () => {
        lottieRef.current?.stop?.();
        lottieRef.current?.destroy?.();
    }, []);

    useEffect(() => {
        setIsVisible(true);
    }, [animationData, startPosition, endPosition, durationText, delayMode, delayPercent, speed]);

    useEffect(() => {
        if (!hideAfterDuration) {
            setIsVisible(true);
            return undefined;
        }

        if (useMotionPath) {
            return undefined;
        }

        const timeoutMs = parseDuration(durationText) * 1000;
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, timeoutMs);

        return () => clearTimeout(timer);
    }, [durationText, hideAfterDuration, animationData, startPosition, endPosition, delayMode, delayPercent, speed]);

    if (!animationData || !isVisible) return null;

    const frame = (
        <div className={`relative flex flex-col items-center justify-center ${display === 'inline' ? className : ''}`}>
            {title && (
                <div className="mb-2 rounded-full bg-slate-900/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm">
                    {title}
                </div>
            )}
            <div
                className="relative flex items-center justify-center rounded-[2rem]"
                style={frameStyle}
            >
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={effectiveLoop}
                    autoplay={autoplay}
                    onComplete={() => {
                        if (effectiveLoop) {
                            lottieRef.current?.goToAndPlay?.(0, true);
                            return;
                        }

                        onComplete?.();
                    }}
                    style={{ width: '100%', height: '100%' }}
                    rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
                {Icon && (
                    <div className="absolute right-[8%] top-[8%] rounded-full bg-white/92 p-2 text-emerald-600 shadow-xl ring-4 ring-white/40">
                        <Icon className="h-8 w-8" />
                    </div>
                )}
            </div>
        </div>
    );

    if (display === 'overlay') {
        return (
            <div className={`pointer-events-none fixed inset-0 z-[80] flex items-center justify-center ${showBackdrop ? 'bg-black/10 backdrop-blur-[1px]' : ''}`}>
                {useMotionPath ? (
                    <motion.div
                        className="absolute left-1/2 top-1/2"
                        initial={{ x: motionConfig.x[0], y: motionConfig.y[0] }}
                        animate={{ x: motionConfig.x, y: motionConfig.y }}
                        transition={{ duration: motionConfig.duration, ease: motionConfig.ease, times: motionConfig.times }}
                        onAnimationComplete={() => {
                            if (hideAfterDuration) {
                                setIsVisible(false);
                            }
                        }}
                        style={{ translateX: '-50%', translateY: `calc(-50% + ${overlayOffsetY}px)` }}
                    >
                        {frame}
                    </motion.div>
                ) : frame}
            </div>
        );
    }

    if (useMotionPath) {
        return (
            <motion.div
                className={className}
                initial={{ x: motionConfig.x[0], y: motionConfig.y[0] }}
                animate={{ x: motionConfig.x, y: motionConfig.y }}
                transition={{ duration: motionConfig.duration, ease: motionConfig.ease, times: motionConfig.times }}
                onAnimationComplete={() => {
                    if (hideAfterDuration) {
                        setIsVisible(false);
                    }
                }}
            >
                {frame}
            </motion.div>
        );
    }

    return frame;
};

export default AdaptiveLottie;
