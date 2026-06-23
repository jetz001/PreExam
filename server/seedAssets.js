const { db } = require('./config/firebase');

const assets = [
  {
    type: 'background',
    name: 'Lo-Fi Study Room',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    is_premium: true,
    created_at: new Date().toISOString()
  },
  {
    type: 'background',
    name: 'Cozy Cafe',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
    is_premium: true,
    created_at: new Date().toISOString()
  },
  {
    type: 'background',
    name: 'Cyberpunk City',
    url: 'https://images.unsplash.com/photo-1515630278258-407f66498911',
    is_premium: true,
    created_at: new Date().toISOString()
  },
  {
    type: 'frame',
    name: 'Neon Frame',
    url: 'https://img.freepik.com/free-vector/neon-frame-transparent-background-vector_53876-167232.jpg',
    is_premium: true,
    created_at: new Date().toISOString()
  },
  {
    type: 'frame',
    name: 'Gold Vintage',
    url: 'https://img.freepik.com/free-vector/golden-frame-transparent-background_1048-11111.jpg',
    is_premium: true,
    created_at: new Date().toISOString()
  }
];

async function seed() {
  const assetsRef = db.collection('room_assets');
  for (const asset of assets) {
    await assetsRef.add(asset);
    console.log('Added:', asset.name);
  }
  console.log('Done!');
}

seed().catch(console.error);
