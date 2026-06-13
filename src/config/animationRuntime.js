import { getAnimationAsset, getAnimationPreset } from './animationRegistry';

const parseSpeed = (value, fallback = 1) => {
    const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const resolveAnimationPreset = (presetKey, animationSettings = {}) => {
    const basePreset = getAnimationPreset(presetKey);
    const usageMap = animationSettings?.animation_usage_map || null;
    const assetConfigs = animationSettings?.animation_asset_configs || {};
    const hasAssetCentricConfig = usageMap && typeof usageMap === 'object';

    if (hasAssetCentricConfig) {
        const assetPool = Array.isArray(usageMap[presetKey]) ? usageMap[presetKey].filter(Boolean) : [];

        if (assetPool.length === 0) {
            return {
                ...basePreset,
                disabled: true,
                animationData: null
            };
        }

        const randomAssetFile = assetPool[Math.floor(Math.random() * assetPool.length)];
        const assetPreset = getAnimationAsset(randomAssetFile);
        const savedAssetConfig = assetConfigs?.[randomAssetFile] || {};

        if (!assetPreset?.animationData) {
            return {
                ...basePreset,
                disabled: true,
                animationData: null
            };
        }

        return {
            ...basePreset,
            ...savedAssetConfig,
            assetKey: randomAssetFile,
            sourceFile: randomAssetFile,
            disabled: false,
            animationData: assetPreset.animationData,
            scale: savedAssetConfig.scale || basePreset.scale,
            direction: savedAssetConfig.direction || basePreset.direction,
            speed: parseSpeed(savedAssetConfig.speedText ?? savedAssetConfig.speed, basePreset.speed || 1)
        };
    }

    const legacySettings = animationSettings?.animation_settings || animationSettings;
    const savedConfig = legacySettings?.[presetKey] || {};

    if (savedConfig.disabled || savedConfig.assetKey === '') {
        return {
            ...basePreset,
            disabled: true,
            animationData: null
        };
    }

    const assetPreset = savedConfig.assetKey ? getAnimationAsset(savedConfig.assetKey) : null;

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
