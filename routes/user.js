const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getUserByEmail, getUserById, saveUser } = require('../utils/dataStore');

const API_BASE_URL = process.env.API_BASE_URL || 'https://mochila-app-backend.vercel.app';

// Configure multer for file uploads
const storage = multer.diskStorage({
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
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
});

// Create/Update user profile
router.post('/profile', async (req, res) => {
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
        const user = saveUser({
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
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get user profile
router.get('/profile/:email', (req, res) => {
    try {
        const { email } = req.params;
        const user = getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Convert relative URLs to absolute URLs
        const userWithAbsoluteUrls = {
            ...user,
            profilePhotoUrl: user.profilePhotoUrl 
                ? (user.profilePhotoUrl.startsWith('http') 
                    ? user.profilePhotoUrl 
                    : `${API_BASE_URL}${user.profilePhotoUrl}`)
                : null,
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

// Upload profile photo
router.post('/profile/photo', upload.single('photo'), async (req, res) => {
    try {
        const { email, filter, isAdditional } = req.body;

        // Validation
        if (!email) {
            // Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Photo file is required',
            });
        }

        // Find user
        let user = getUserByEmail(email);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Store photo URL with absolute path
        const relativePhotoUrl = `/uploads/${req.file.filename}`;
        const absolutePhotoUrl = `${API_BASE_URL}${relativePhotoUrl}`;
        
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
                const oldPhotoPath = path.join(__dirname, '../uploads', path.basename(user.profilePhotoUrl));
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
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
        user = saveUser({
            email: user.email,
            profilePhotoUrl: user.profilePhotoUrl,
            photos: user.photos,
            profilePhotoFilter: user.profilePhotoFilter,
        });

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: absolutePhotoUrl, // Return absolute URL to frontend
            user: {
                id: user.id,
                email: user.email,
                profilePhotoUrl: user.profilePhotoUrl ? `${API_BASE_URL}${user.profilePhotoUrl}` : null,
                photos: user.photos.map(p => p.startsWith('http') ? p : `${API_BASE_URL}${p}`),
                profilePhotoFilter: user.profilePhotoFilter,
            },
        });
    } catch (error) {
        // Delete uploaded file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Error uploading photo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload photo',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

module.exports = router;

