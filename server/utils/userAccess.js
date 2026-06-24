const isGuestUser = (user) => {
    if (!user) return true;
    if (user.guest_device_id) return true;

    const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    return email.startsWith('guest_');
};

const isPremiumUser = (user) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.plan_type !== 'premium') return false;

    if (!user.premium_expiry) return true;

    const expiryDate = new Date(user.premium_expiry);
    if (Number.isNaN(expiryDate.getTime())) return true;

    return expiryDate > new Date();
};

const getUserFeatures = (user) => {
    const featureSources = [
        user && user.features,
        user && user.plan_features,
        user && user.package_features,
        user && user.payment_plan_features,
    ];

    return featureSources.find(Array.isArray) || [];
};

const hasPackageFeature = (user, featureKey) => {
    return getUserFeatures(user).includes(featureKey);
};

const canCreateRooms = (user) => {
    if (!user) return false;
    if (!isGuestUser(user)) return true;

    return isPremiumUser(user) || hasPackageFeature(user, 'create_rooms');
};

module.exports = {
    isGuestUser,
    isPremiumUser,
    hasPackageFeature,
    canCreateRooms
};
