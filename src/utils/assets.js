export const STATIC_BACKGROUNDS = [
    { id: 'static-bg-1', type: 'background', name: 'Lo-Fi Study Room', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80', is_premium: true },
    { id: 'static-bg-2', type: 'background', name: 'Cozy Cafe', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80', is_premium: true },
    { id: 'static-bg-3', type: 'background', name: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=500&q=80', is_premium: true },
    { id: 'static-bg-4', type: 'background', name: 'Nature Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', is_premium: true }
];

export const STATIC_FRAMES = [
    { id: 'static-frm-1', type: 'frame', name: 'Gold Vintage', url: 'https://img.freepik.com/free-vector/golden-frame-transparent-background_1048-11111.jpg?w=500', is_premium: true },
    { id: 'static-frm-2', type: 'frame', name: 'Neon Cyber', url: 'https://img.freepik.com/free-vector/neon-frame-transparent-background-vector_53876-167232.jpg?w=500', is_premium: true },
    { id: 'static-frm-3', type: 'frame', name: 'Wooden Classic', url: 'https://img.freepik.com/free-vector/wood-frame-transparent-background_1048-11114.jpg?w=500', is_premium: true }
];

export const getAssetUrl = (id, type) => {
    if (!id) return null;
    const list = type === 'background' ? STATIC_BACKGROUNDS : STATIC_FRAMES;
    const asset = list.find(a => a.id === id);
    return asset ? asset.url : null;
};
