const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Initialize the S3Client with Cloudflare R2 credentials
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxxx.r2.dev

/**
 * Uploads a file buffer to Cloudflare R2 and returns the public URL.
 * @param {Buffer} fileBuffer - The file data buffer
 * @param {string} fileName - The original file name
 * @param {string} mimeType - The mime type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadFileToR2 = async (fileBuffer, fileName, mimeType) => {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCOUNT_ID === 'YOUR_ACCOUNT_ID') {
        console.warn('R2 credentials not set! Returning mock URL.');
        return `/mock-r2-url/${fileName}`;
    }

    try {
        const timestamp = Date.now();
        const uniqueFileName = `assets/${timestamp}-${fileName.replace(/\s+/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: mimeType,
        });

        await r2Client.send(command);

        // Return the public URL
        return `${publicUrl}/${uniqueFileName}`;
    } catch (error) {
        console.error('Error uploading file to R2:', error);
        throw new Error('Failed to upload file to R2');
    }
};

/**
 * Deletes a file from Cloudflare R2.
 * @param {string} fileUrl - The public URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFileFromR2 = async (fileUrl) => {
    if (!process.env.R2_ACCOUNT_ID || !fileUrl.startsWith(publicUrl)) {
        return;
    }

    try {
        const key = fileUrl.replace(`${publicUrl}/`, '');
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await r2Client.send(command);
    } catch (error) {
        console.error('Error deleting file from R2:', error);
    }
};

module.exports = {
    uploadFileToR2,
    deleteFileFromR2
};
