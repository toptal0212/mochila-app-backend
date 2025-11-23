const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// In-memory storage (replace with database in production)
let users = [];

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

        // Find or create user
        let user = users.find(u => u.email === email);
        if (!user) {
            user = {
                id: Date.now().toString(),
                email,
                createdAt: new Date().toISOString(),
            };
            users.push(user);
        }

        // Update user profile
        user.gender = gender;
        user.travelCompanionPreferences = travelCompanionPreferences || [];
        user.activityInterests = activityInterests || [];
        user.personalityTraits = personalityTraits || [];
        user.matchPreference = matchPreference;
        user.birthday = birthday;
        user.region = region;
        user.purposeOfUse = purposeOfUse || [];
        user.howDidYouLearn = howDidYouLearn;
        user.displayName = displayName;
        user.emailNotifications = emailNotifications || {
            allAgreed: true,
            messagesAgreed: true,
            campaignsAgreed: true,
        };
        user.occupation = occupation;
        user.travelDestination = travelDestination;
        user.updatedAt = new Date().toISOString();

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
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            user,
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
        const { email, filter } = req.body;

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
        let user = users.find(u => u.email === email);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Delete old photo if exists
        if (user.profilePhotoUrl) {
            const oldPhotoPath = path.join(__dirname, '../uploads', path.basename(user.profilePhotoUrl));
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Store photo URL (in production, upload to cloud storage like S3, Cloudinary, etc.)
        const photoUrl = `/uploads/${req.file.filename}`;
        user.profilePhotoUrl = photoUrl;
        user.profilePhotoFilter = filter || 'original';
        user.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photoUrl: photoUrl,
            user: {
                id: user.id,
                email: user.email,
                profilePhotoUrl: photoUrl,
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

