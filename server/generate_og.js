const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const COLORS = {
    'c1': '#ec4899', // Pink
    'c2': '#f97316', // Orange
    'c3': '#06b6d4', // Cyan
    'c4': '#10b981', // Emerald
    'c5': '#1e293b'  // Slate
};

const OUTPUT_DIR = path.join(__dirname, '../client/public/og');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const WIDTH = 1200;
const HEIGHT = 630;

const generateImages = async () => {
    for (const [key, color] of Object.entries(COLORS)) {
        console.log(`Generating ${key}.png...`);

        // Smaller Logo Text
        const svgText = `
        <svg width="${WIDTH}" height="${HEIGHT}">
            <style>
                .logo { fill: white; font-size: 48px; font-family: sans-serif; font-weight: bold; opacity: 0.9; }
            </style>
            <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${color}" />
            <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="logo">
                PreExam.Online
            </text>
        </svg>
        `;

        await sharp(Buffer.from(svgText))
            .toFormat('png')
            .toFile(path.join(OUTPUT_DIR, `${key}.png`));
    }
    console.log('Done.');
};

generateImages();
