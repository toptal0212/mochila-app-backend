const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, addFootprint, getLikesReceived, getFootprints } = require('../utils/dataStore');

const API_BASE_URL = process.env.API_BASE_URL || 'https://mochila-app-backend.vercel.app';

// Helper function to convert relative URLs to absolute URLs
const convertToAbsoluteUrls = (user) => {
    if (!user) return null;
    
    return {
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
};

// Helper function to calculate age from birthday
const calculateAge = (birthday) => {
    if (!birthday) return null;
    try {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        return null;
    }
};

// Get members list with sorting
router.get('/', async (req, res) => {
    try {
        const { sort = 'popular', excludeEmail } = req.query;
        const allUsers = await getAllUsers();

        console.log(`Total users from database: ${allUsers.length}`);

        // Process users: calculate age from birthday if needed, and filter
        let processedMembers = allUsers.map(user => {
            // Calculate age from birthday if age is not set
            if (!user.age && user.birthday) {
                user.age = calculateAge(user.birthday);
            }
            return user;
        });

        // Filter out users without displayName (minimum requirement)
        // age and region are optional for display
        let sortedMembers = processedMembers.filter(user => 
            user.displayName
        );

        // Exclude current user if excludeEmail is provided
        if (excludeEmail) {
            sortedMembers = sortedMembers.filter(user => 
                user.email !== excludeEmail
            );
            console.log(`Excluded current user (${excludeEmail}), remaining: ${sortedMembers.length}`);
        }

        console.log(`Users with displayName: ${sortedMembers.length}`);

        switch (sort) {
            case 'popular':
                // Sort by match rate and likes
                sortedMembers.sort((a, b) => {
                    const scoreA = (a.matchRate || 0) + (a.likes || 0) * 10;
                    const scoreB = (b.matchRate || 0) + (b.likes || 0) * 10;
                    return scoreB - scoreA;
                });
                break;
            case 'login':
                // Sort by last login (using updatedAt as proxy)
                sortedMembers.sort((a, b) => {
                    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                });
                break;
            case 'recommended':
                // Sort by match rate
                sortedMembers.sort((a, b) => (b.matchRate || 0) - (a.matchRate || 0));
                break;
            case 'new':
                // Sort by creation date (newest first)
                sortedMembers.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                break;
            default:
                // Default to popular
                sortedMembers.sort((a, b) => {
                    const scoreA = (a.matchRate || 0) + (a.likes || 0) * 10;
                    const scoreB = (b.matchRate || 0) + (b.likes || 0) * 10;
                    return scoreB - scoreA;
                });
        }

        // Return simplified member data for list view with absolute URLs
        const memberList = sortedMembers.map(member => {
            const memberWithUrls = convertToAbsoluteUrls(member);
            return {
                id: memberWithUrls.id,
                displayName: memberWithUrls.displayName,
                age: memberWithUrls.age || null,
                region: memberWithUrls.region || '未設定',
                profilePhotoUrl: memberWithUrls.profilePhotoUrl,
                isOnline: memberWithUrls.isOnline || false,
                likes: memberWithUrls.likes || 0,
                views: memberWithUrls.views || 0,
                matchRate: memberWithUrls.matchRate || 0,
            };
        });

        console.log(`Returning ${memberList.length} members to frontend`);

        res.json({
            success: true,
            members: memberList,
        });
    } catch (error) {
        console.error('Error getting members list:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get members list',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get member profile by ID
router.get('/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const member = await getUserById(memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                error: 'Member not found',
            });
        }

        // Increment views (add footprint)
        await addFootprint(req.query.viewerId || 'anonymous', memberId);

        // Convert to absolute URLs
        const memberWithUrls = convertToAbsoluteUrls(member);

        res.json({
            success: true,
            member: {
                id: memberWithUrls.id,
                displayName: memberWithUrls.displayName,
                age: memberWithUrls.age,
                region: memberWithUrls.region,
                hometown: memberWithUrls.hometown,
                profilePhotoUrl: memberWithUrls.profilePhotoUrl,
                photos: memberWithUrls.photos || (memberWithUrls.profilePhotoUrl ? [memberWithUrls.profilePhotoUrl] : []),
                isOnline: memberWithUrls.isOnline || false,
                matchRate: memberWithUrls.matchRate || 0,
                interests: memberWithUrls.interests || [],
                videoCallOk: memberWithUrls.videoCallOk || false,
                selfIntroduction: memberWithUrls.selfIntroduction,
                height: memberWithUrls.height,
                bodyType: memberWithUrls.bodyType,
                charmPoints: memberWithUrls.charmPoints || [],
                personality: memberWithUrls.personality || [],
                languages: memberWithUrls.languages || ['日本語'],
                bloodType: memberWithUrls.bloodType,
                siblings: memberWithUrls.siblings,
                occupation: memberWithUrls.occupation,
                income: memberWithUrls.income,
                education: memberWithUrls.education,
                likes: memberWithUrls.likes || 0,
                views: memberWithUrls.views || 0,
            },
        });
    } catch (error) {
        console.error('Error getting member profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get member profile',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get likes received by user
router.get('/likes/received/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const likesReceived = await getLikesReceived(userId);

        const likesWithUrls = likesReceived.map(like => ({
            ...like,
            user: convertToAbsoluteUrls(like.user),
        }));

        res.json({
            success: true,
            likes: likesWithUrls,
        });
    } catch (error) {
        console.error('Error getting likes received:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get likes received',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Get footprints (profile views) for user
router.get('/footprints/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const footprints = await getFootprints(userId);

        const footprintsWithUrls = footprints.map(footprint => ({
            ...footprint,
            user: convertToAbsoluteUrls(footprint.user),
        }));

        res.json({
            success: true,
            footprints: footprintsWithUrls,
        });
    } catch (error) {
        console.error('Error getting footprints:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get footprints',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Add like
router.post('/likes', async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;

        if (!fromUserId || !toUserId) {
            return res.status(400).json({
                success: false,
                error: 'fromUserId and toUserId are required',
            });
        }

        const like = await addLike(fromUserId, toUserId);

        res.json({
            success: true,
            like,
        });
    } catch (error) {
        console.error('Error adding like:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add like',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

module.exports = router;
