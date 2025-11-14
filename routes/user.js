const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
let users = [];

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

module.exports = router;

