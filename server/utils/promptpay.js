const promptpay = require('promptpay-qr');
const qrcode = require('qrcode');

const generatePromptPayQR = async (phoneNumber, amount) => {
    const payload = promptpay(phoneNumber, { amount });
    try {
        const url = await qrcode.toDataURL(payload);
        return url;
    } catch (err) {
        console.error('Error generating QR Code:', err);
        throw err;
    }
};

module.exports = generatePromptPayQR;
