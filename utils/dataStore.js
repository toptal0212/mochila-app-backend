// Centralized data store for users and members
// In production, this should be replaced with a database

let users = [];
let likes = []; // Store likes: { fromUserId, toUserId, timestamp }
let footprints = []; // Store profile views: { viewerId, viewedId, timestamp }

// Initialize with sample data if empty
const initializeSampleData = () => {
    if (users.length === 0) {
        users = [
            {
                id: '1',
                email: 'user1@example.com',
                displayName: 'hy',
                age: 34,
                region: '東京',
                hometown: '岡山',
                profilePhotoUrl: null,
                photos: [],
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
                updatedAt: new Date().toISOString(),
            },
            {
                id: '2',
                email: 'user2@example.com',
                displayName: 'ユーザー2',
                age: 36,
                region: '東京',
                profilePhotoUrl: null,
                photos: [],
                isOnline: false,
                matchRate: 72,
                interests: ['旅行', 'カフェ'],
                likes: 5,
                views: 3,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '3',
                email: 'user3@example.com',
                displayName: 'ユーザー3',
                age: 28,
                region: '東京',
                profilePhotoUrl: null,
                photos: [],
                isOnline: true,
                matchRate: 62,
                interests: ['映画', '散歩'],
                likes: 3,
                views: 2,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString(),
            },
            {
                id: '4',
                email: 'user4@example.com',
                displayName: 'ユーザー4',
                age: 31,
                region: '東京',
                profilePhotoUrl: null,
                photos: [],
                isOnline: false,
                matchRate: 69,
                interests: ['読書', 'カフェ'],
                likes: 4,
                views: 3,
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                updatedAt: new Date(Date.now() - 259200000).toISOString(),
            },
            {
                id: '5',
                email: 'user5@example.com',
                displayName: 'ユーザー5',
                age: 31,
                region: '千葉',
                profilePhotoUrl: null,
                photos: [],
                isOnline: true,
                matchRate: 64,
                interests: ['旅行', '写真'],
                likes: 2,
                views: 3,
                createdAt: new Date(Date.now() - 345600000).toISOString(),
                updatedAt: new Date(Date.now() - 345600000).toISOString(),
            },
        ];
    }
};

// Get all users
const getAllUsers = () => {
    initializeSampleData();
    return users;
};

// Get user by email
const getUserByEmail = (email) => {
    initializeSampleData();
    return users.find(u => u.email === email);
};

// Get user by ID
const getUserById = (id) => {
    initializeSampleData();
    return users.find(u => u.id === id);
};

// Create or update user
const saveUser = (userData) => {
    initializeSampleData();
    let user = users.find(u => u.email === userData.email);
    
    if (!user) {
        user = {
            id: Date.now().toString(),
            email: userData.email,
            createdAt: new Date().toISOString(),
            profilePhotoUrl: null,
            photos: [],
            likes: 0,
            views: 0,
            isOnline: false,
        };
        users.push(user);
    }
    
    // Update user data
    Object.keys(userData).forEach(key => {
        if (key !== 'id' && key !== 'email' && key !== 'createdAt') {
            user[key] = userData[key];
        }
    });
    
    user.updatedAt = new Date().toISOString();
    return user;
};

// Add like
const addLike = (fromUserId, toUserId) => {
    const existingLike = likes.find(
        l => l.fromUserId === fromUserId && l.toUserId === toUserId
    );
    
    if (!existingLike) {
        likes.push({
            id: Date.now().toString(),
            fromUserId,
            toUserId,
            timestamp: new Date().toISOString(),
        });
        
        // Update likes count
        const toUser = getUserById(toUserId);
        if (toUser) {
            toUser.likes = (toUser.likes || 0) + 1;
        }
    }
    
    return existingLike || likes[likes.length - 1];
};

// Add footprint (profile view)
const addFootprint = (viewerId, viewedId) => {
    footprints.push({
        id: Date.now().toString(),
        viewerId,
        viewedId,
        timestamp: new Date().toISOString(),
    });
    
    // Update views count
    const viewedUser = getUserById(viewedId);
    if (viewedUser) {
        viewedUser.views = (viewedUser.views || 0) + 1;
    }
};

// Get likes received by user
const getLikesReceived = (userId) => {
    return likes
        .filter(l => l.toUserId === userId)
        .map(like => {
            const fromUser = getUserById(like.fromUserId);
            return {
                ...like,
                user: fromUser,
            };
        })
        .filter(item => item.user) // Filter out deleted users
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Get footprints (profile views) for user
const getFootprints = (userId) => {
    return footprints
        .filter(f => f.viewedId === userId)
        .map(footprint => {
            const viewer = getUserById(footprint.viewerId);
            return {
                ...footprint,
                user: viewer,
            };
        })
        .filter(item => item.user) // Filter out deleted users
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

module.exports = {
    getAllUsers,
    getUserByEmail,
    getUserById,
    saveUser,
    addLike,
    addFootprint,
    getLikesReceived,
    getFootprints,
};

