export const isGuestUser = (user) => {
    if (!user) return true;

    if (user.guest_device_id) return true;

    const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    return email.startsWith('guest_');
};

export const isPremiumUser = (user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.plan_type !== 'premium') return false;

    if (!user.premium_expiry) return true;

    const expiryDate = new Date(user.premium_expiry);
    if (Number.isNaN(expiryDate.getTime())) return true;

    return expiryDate > new Date();
};

export const getUserFeatures = (user) => {
    const featureSources = [
        user?.features,
        user?.plan_features,
        user?.package_features,
        user?.payment_plan_features,
    ];

    return featureSources.find(Array.isArray) || [];
};

export const hasPackageFeature = (user, featureKey) => {
    return getUserFeatures(user).includes(featureKey);
};

export const canCreateRooms = (user) => {
    if (!user) return false;
    if (!isGuestUser(user)) return true;

    return isPremiumUser(user) || hasPackageFeature(user, 'create_rooms');
};
