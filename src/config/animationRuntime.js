import { getAnimationPreset } from './animationRegistry';

const parseSpeed = (value, fallback = 1) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const resolveAnimationPreset = (presetKey, animationSettings = {}) => {
    const basePreset = getAnimationPreset(presetKey);
    const savedConfig = animationSettings?.[presetKey] || {};

    if (savedConfig.disabled || savedConfig.assetKey === '') {
        return {
            ...basePreset,
            disabled: true,
            animationData: null
        };
    }

    const assetPreset = savedConfig.assetKey ? getAnimationPreset(savedConfig.assetKey) : basePreset;

    return {
        ...basePreset,
        ...savedConfig,
        disabled: false,
        animationData: assetPreset?.animationData || basePreset.animationData,
        scale: savedConfig.scale || basePreset.scale,
        direction: savedConfig.direction || basePreset.direction,
        speed: parseSpeed(savedConfig.speedText ?? savedConfig.speed, basePreset.speed || 1)
    };
};
