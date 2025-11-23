const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
// This will be shared with user routes in production
let members = [];

// Initialize with some sample data for development
const initializeSampleData = () => {
    if (members.length === 0) {
        members = [
            {
                id: '1',
                email: 'user1@example.com',
                displayName: 'hy',
                age: 34,
                region: '東京',
                hometown: '岡山',
                profilePhotoUrl: 'https://via.placeholder.com/400',
                photos: [
                    'https://via.placeholder.com/400',
                    'https://via.placeholder.com/400',
                    'https://via.placeholder.com/400',
                    'https://via.placeholder.com/400',
                ],
                isOnline: true,
                matchRate: 66,
                interests: ['旅行', '海外旅行', '食べ歩き', '映画', 'カフェ', '温泉'],
                videoCallOk: true,
                selfIntroduction: 'はじめまして! プロフィール読んで頂きありがとうございます! 真剣にお付き合い出来る方と出会いたいと思い始めました。',
                height: '165cm',
                bodyType: '普通',
                charmPoints: ['笑顔', '奥二重'],
                personality: ['優しい', '明るい', '誠実', '落ち着いている', '思いやりがある'],
                languages: ['日本語'],
                bloodType: 'O型',
                siblings: '兄弟なし',
                occupation: '会社員(大手企業)',
                income: '700万円以上~1000万円未満',
                education: '大学卒',
                likes: 0,
                views: 0,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                email: 'user2@example.com',
                displayName: 'ユーザー2',
                age: 36,
                region: '東京',
                profilePhotoUrl: 'https://via.placeholder.com/400',
                isOnline: false,
                matchRate: 72,
                interests: ['旅行', 'カフェ'],
                likes: 5,
                views: 3,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '3',
                email: 'user3@example.com',
                displayName: 'ユーザー3',
                age: 28,
                region: '東京',
                profilePhotoUrl: 'https://via.placeholder.com/400',
                isOnline: true,
                matchRate: 62,
                interests: ['映画', '散歩'],
                likes: 3,
                views: 2,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
                id: '4',
                email: 'user4@example.com',
                displayName: 'ユーザー4',
                age: 31,
                region: '東京',
                profilePhotoUrl: 'https://via.placeholder.com/400',
                isOnline: false,
                matchRate: 69,
                interests: ['読書', 'カフェ'],
                likes: 4,
                views: 3,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
            },
            {
                id: '5',
                email: 'user5@example.com',
                displayName: 'ユーザー5',
                age: 31,
                region: '千葉',
                profilePhotoUrl: 'https://via.placeholder.com/400',
                isOnline: true,
                matchRate: 64,
                interests: ['旅行', '写真'],
                likes: 2,
                views: 3,
                createdAt: new Date(Date.now() - 345600000).toISOString(),
            },
        ];
    }
};

// Get members list with sorting
router.get('/', (req, res) => {
    try {
        initializeSampleData();
        const { sort = 'popular' } = req.query;

        let sortedMembers = [...members];

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
                // Sort by last login (using createdAt as proxy)
                sortedMembers.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
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

        // Return simplified member data for list view
        const memberList = sortedMembers.map(member => ({
            id: member.id,
            displayName: member.displayName,
            age: member.age,
            region: member.region,
            profilePhotoUrl: member.profilePhotoUrl,
            isOnline: member.isOnline,
            likes: member.likes || 0,
            views: member.views || 0,
            matchRate: member.matchRate || 0,
        }));

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
router.get('/:memberId', (req, res) => {
    try {
        initializeSampleData();
        const { memberId } = req.params;
        const member = members.find(m => m.id === memberId);

        if (!member) {
            return res.status(404).json({
                success: false,
                error: 'Member not found',
            });
        }

        // Increment views
        member.views = (member.views || 0) + 1;

        res.json({
            success: true,
            member: {
                id: member.id,
                displayName: member.displayName,
                age: member.age,
                region: member.region,
                hometown: member.hometown,
                profilePhotoUrl: member.profilePhotoUrl,
                photos: member.photos || [member.profilePhotoUrl].filter(Boolean),
                isOnline: member.isOnline,
                matchRate: member.matchRate || 0,
                interests: member.interests || [],
                videoCallOk: member.videoCallOk || false,
                selfIntroduction: member.selfIntroduction,
                height: member.height,
                bodyType: member.bodyType,
                charmPoints: member.charmPoints || [],
                personality: member.personality || [],
                languages: member.languages || ['日本語'],
                bloodType: member.bloodType,
                siblings: member.siblings,
                occupation: member.occupation,
                income: member.income,
                education: member.education,
                likes: member.likes || 0,
                views: member.views || 0,
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

module.exports = router;

