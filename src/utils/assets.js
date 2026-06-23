export const STATIC_BACKGROUNDS = [
    { id: 'static-bg-1', type: 'background', name: 'Abstract Urban', url: '/Abstract%20Urban%20Landscape.json', is_premium: true },
    { id: 'static-bg-2', type: 'background', name: 'Calm Backdrop', url: '/Calm%20Backdrop.json', is_premium: true },
    { id: 'static-bg-3', type: 'background', name: 'Drone Land', url: '/Drone%20-%20land.json', is_premium: true },
    { id: 'static-bg-4', type: 'background', name: 'Edificio', url: '/Edificio.json', is_premium: true },
    { id: 'static-bg-5', type: 'background', name: 'Warm Nature', url: '/Warm%20nature%20scenery%20with%20trees.json', is_premium: true },
    { id: 'static-bg-6', type: 'background', name: 'Wind Turbines', url: '/Wind%20Turbines.json', is_premium: true }
];

export const STATIC_FRAMES = [
    { id: 'static-frm-1', type: 'frame', name: 'Gold Vintage', url: 'https://img.freepik.com/free-vector/golden-frame-transparent-background_1048-11111.jpg?w=1000', is_premium: true },
    { id: 'static-frm-2', type: 'frame', name: 'Neon Cyber', url: 'https://img.freepik.com/free-vector/neon-frame-transparent-background-vector_53876-167232.jpg?w=1000', is_premium: true },
    { id: 'static-frm-3', type: 'frame', name: 'Lottie Confetti', url: 'https://assets4.lottiefiles.com/packages/lf20_u4yrau.json', is_premium: true }
];

export const getAssetUrl = (id, type) => {
    if (!id) return null;
    const list = type === 'background' ? STATIC_BACKGROUNDS : STATIC_FRAMES;
    const asset = list.find(a => a.id === id);
    return asset ? asset.url : null;
};
