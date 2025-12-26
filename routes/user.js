const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getUserByEmail, getUserById, saveUser } = require('../utils/dataStore');
const { uploadToS3, deleteFromS3, isS3Enabled, getS3Config } = require('../utils/s3Upload');

const API_BASE_URL = process.env.API_BASE_URL || 'https://mochila-app-backend.vercel.app';

// Configure multer for file uploads
// Use memory storage for S3, disk storage for local
const storage = isS3Enabled() ?
    multer.memoryStorage() // Store in memory for S3 upload
    :
    multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'profile-photo-' + uniqueSuffix + path.extname(file.originalname));
        },
    });

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)!'));
        }
    },
});

// Create/Update user profile
router.post('/profile', async(req, res) => {
    try {
        const {
            email,
            gender,
            travelCompanionPreferences,
            activityInterests,
            personalityTraits,
            matchPreference,
            birthday,
            region,
            purposeOfUse,
            howDidYouLearn,
            displayName,
            emailNotifications,
            occupation,
            travelDestination,
        } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Save user profile using centralized data store
        const user = await saveUser({
            email,
            gender,
            travelCompanionPreferences,
            activityInterests,
            personalityTraits,
            matchPreference,
            birthday,
            region,
            purposeOfUse,
            howDidYouLearn,
            displayName,
            emailNotifications: emailNotifications || {
                allAgreed: true,
                messagesAgreed: true,
                campaignsAgreed: true,
            },
            occupation,
            travelDestination,
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Error stack:', error.stack);

        // Check if it's a Prisma error (table doesn't exist, etc.)
        let errorMessage = 'Failed to update profile';
        if (error.code === 'P2001' || error.code === 'P2025') {
            errorMessage = 'Database table not found. Please run migrations.';
        } else if (error.code === 'P2002') {
            errorMessage = 'Email already exists';
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production' ? {
                message: error.message,
                code: error.code,
                stack: error.stack,
            } : undefined,
        });
    }
});

// Get user profile
router.get('/profile/:email', async(req, res) => {
    try {
        const { email } = req.params;
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Convert relative URLs to absolute URLs
        const userWithAbsoluteUrls = {
            ...user,
            profilePhotoUrl: user.profilePhotoUrl ?
                (user.profilePhotoUrl.startsWith('http') ?
                    user.profilePhotoUrl :
                    `${API_BASE_URL}${user.profilePhotoUrl}`) : null,
            photos: (user.photos || []).map(photo =>
                photo.startsWith('http') ? photo : `${API_BASE_URL}${photo}`
            ),
        };

        res.json({
            success: true,
            user: userWithAbsoluteUrls,
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Helper function to convert base64 to buffer
const base64ToBuffer = (base64String) => {
    // Remove data URL prefix if present (data:image/jpeg;base64,)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
};

// Multer middleware that handles optional file uploads
const optionalUpload = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        // Ignore Multer errors about missing files
        if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next();
        }
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }
        next();
    });
};

// Upload profile photo
router.post('/profile/photo', optionalUpload, async(req, res) => {
    try {
        const { email, filter, isAdditional, photoBase64 } = req.body;

        // Debug logging
        console.log('📋 Request details:');
        console.log('- Has req.file:', !!req.file);
        console.log('- Has photoBase64:', !!photoBase64);
        console.log('- photoBase64 length:', photoBase64 ? photoBase64.length : 0);
        console.log('- req.body keys:', Object.keys(req.body));
        console.log('- Content-Type:', req.headers['content-type']);

        // Validation
        if (!email) {
            // Delete uploaded file if validation fails (local storage only)
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Check if we have either a file or base64 data
        if (!req.file && !photoBase64) {
            console.error('❌ No file or base64 data found!');
            console.error('req.body:', req.body);
            return res.status(400).json({
                success: false,
                error: 'Photo file or base64 data is required',
                debug: {
                    hasFile: !!req.file,
                    hasBase64: !!photoBase64,
                    bodyKeys: Object.keys(req.body),
                },
            });
        }

        // If we have base64 data instead of file, convert it
        let fileData = req.file;
        if (!fileData && photoBase64) {
            try {
                const buffer = base64ToBuffer(photoBase64);
                fileData = {
                    buffer: buffer,
                    originalname: 'photo.jpg',
                    mimetype: 'image/jpeg',
                    size: buffer.length,
                };
                console.log('📸 Converted base64 to buffer, size:', buffer.length);
            } catch (error) {
                console.error('Error converting base64 to buffer:', error);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid base64 image data',
                });
            }
        }

        // Find user
        let user = await getUserByEmail(email);
        if (!user) {
            // Delete uploaded file if user not found (local storage only)
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        let photoUrl;
        let relativePhotoUrl;

        // Upload to S3 or save locally based on configuration
        if (isS3Enabled()) {
            // Upload to S3
            console.log('📤 Uploading to S3...');
            photoUrl = await uploadToS3(
                fileData.buffer,
                fileData.originalname,
                fileData.mimetype,
                'profile-photos'
            );
            relativePhotoUrl = photoUrl; // Store full S3 URL
            console.log('✅ S3 upload complete:', photoUrl);
        } else {
            // Local storage (Vercel won't work, but useful for local dev)
            console.log('💾 Saving locally...');

            // If we have a file path, use it; otherwise save the buffer
            if (req.file && req.file.filename) {
                relativePhotoUrl = `/uploads/${req.file.filename}`;
            } else {
                // Save buffer to file for local storage
                const uploadDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `profile-photo-${Date.now()}.jpg`;
                const filepath = path.join(uploadDir, filename);
                fs.writeFileSync(filepath, fileData.buffer);
                relativePhotoUrl = `/uploads/${filename}`;
            }
            photoUrl = `${API_BASE_URL}${relativePhotoUrl}`;
        }

        // Initialize photos array if it doesn't exist
        if (!user.photos) {
            user.photos = [];
        }

        if (isAdditional === 'true') {
            // Add as additional photo
            user.photos.push(relativePhotoUrl);
        } else {
            // Replace main profile photo
            // Delete old main photo if exists
            if (user.profilePhotoUrl) {
                if (isS3Enabled() && user.profilePhotoUrl.includes('s3.amazonaws.com')) {
                    // Delete from S3
                    await deleteFromS3(user.profilePhotoUrl);
                } else if (user.profilePhotoUrl.startsWith('/uploads/')) {
                    // Delete from local storage
                    const oldPhotoPath = path.join(__dirname, '../uploads', path.basename(user.profilePhotoUrl));
                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }

            user.profilePhotoUrl = relativePhotoUrl;
            user.profilePhotoFilter = filter || 'original';

            // If this is the first photo, also add it to photos array
            if (user.photos.length === 0) {
                user.photos.push(relativePhotoUrl);
            } else {
                // Replace first photo in array with new main photo
                user.photos[0] = relativePhotoUrl;
            }
        }

        // Update user with new photo
        user = await saveUser({
            email: user.email,
            profilePhotoUrl: user.profilePhotoUrl,
            photos: user.photos,
            profilePhotoFilter: user.profilePhotoFilter,
        });

        // Format URLs for response
        const formatPhotoUrl = (url) => {
            if (!url) return null;
            if (url.startsWith('http')) return url; // Already absolute (S3)
            return `${API_BASE_URL}${url}`; // Local storage
        };

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: photoUrl, // Return absolute URL to frontend
            storageType: isS3Enabled() ? 's3' : 'local',
            user: {
                id: user.id,
                email: user.email,
                profilePhotoUrl: formatPhotoUrl(user.profilePhotoUrl),
                photos: user.photos.map(formatPhotoUrl),
                profilePhotoFilter: user.profilePhotoFilter,
            },
        });
    } catch (error) {
        // Delete uploaded file if error occurs (local storage only)
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        console.error('Error uploading photo:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to upload photo',
            details: error.message, // Temporarily show error in production for debugging
            errorName: error.name,
            errorCode: error.code,
        });
    }
});

module.exports = router;