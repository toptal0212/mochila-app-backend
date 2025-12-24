const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const path = require('path');

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'mochila-app-images';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} fileName - Name for the file in S3
 * @param {string} mimeType - MIME type of the file
 * @param {string} folder - Folder path in S3 (e.g., 'profile-photos')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToS3(fileBuffer, fileName, mimeType, folder = 'profile-photos') {
    try {
        // Create unique file name with timestamp
        const timestamp = Date.now();
        const randomString = Math.round(Math.random() * 1E9);
        const ext = path.extname(fileName);
        const uniqueFileName = `${path.basename(fileName, ext)}-${timestamp}-${randomString}${ext}`;
        const key = `${folder}/${uniqueFileName}`;

        // Upload parameters
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            // Make file publicly readable
            ACL: 'public-read',
        };

        // Use Upload for better handling of large files
        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        // Execute upload
        const result = await upload.done();

        // Construct public URL
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-1'}.amazonaws.com/${key}`;

        console.log('✅ File uploaded successfully to S3:', publicUrl);
        
        return publicUrl;
    } catch (error) {
        console.error('❌ Error uploading to S3:', error);
        throw new Error(`S3 upload failed: ${error.message}`);
    }
}

/**
 * Delete a file from S3
 * @param {string} fileUrl - Public URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteFromS3(fileUrl) {
    try {
        // Extract key from URL
        // URL format: https://bucket-name.s3.region.amazonaws.com/folder/file.jpg
        const urlParts = fileUrl.split('.amazonaws.com/');
        if (urlParts.length < 2) {
            console.warn('⚠️ Invalid S3 URL format:', fileUrl);
            return false;
        }
        
        const key = urlParts[1];

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        console.log('✅ File deleted from S3:', key);
        return true;
    } catch (error) {
        console.error('❌ Error deleting from S3:', error);
        // Don't throw error, just log it (file might not exist)
        return false;
    }
}

/**
 * Check if S3 is configured and should be used
 * @returns {boolean}
 */
function isS3Enabled() {
    const enabled = process.env.USE_S3_STORAGE === 'true';
    const hasCredentials = !!(
        process.env.AWS_ACCESS_KEY_ID && 
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
    );
    
    if (enabled && !hasCredentials) {
        console.warn('⚠️ S3 storage is enabled but AWS credentials are missing!');
        return false;
    }
    
    return enabled && hasCredentials;
}

/**
 * Get bucket configuration info
 * @returns {object}
 */
function getS3Config() {
    return {
        enabled: isS3Enabled(),
        bucket: BUCKET_NAME,
        region: process.env.AWS_REGION || 'ap-northeast-1',
        hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    };
}

module.exports = {
    uploadToS3,
    deleteFromS3,
    isS3Enabled,
    getS3Config,
};

