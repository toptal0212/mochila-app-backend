// Data store using Prisma Client
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to convert Prisma User to API format
const prismaUserToUser = (prismaUser) => {
    if (!prismaUser) return null;
    
    return {
        id: prismaUser.id,
        email: prismaUser.email,
        displayName: prismaUser.displayName,
        age: prismaUser.age,
        region: prismaUser.region,
        hometown: prismaUser.hometown,
        profilePhotoUrl: prismaUser.profilePhotoUrl,
        profilePhotoFilter: prismaUser.profilePhotoFilter || 'original',
        photos: prismaUser.photos ? prismaUser.photos.map(p => p.photoUrl).sort((a, b) => {
            const aOrder = prismaUser.photos.find(ph => ph.photoUrl === a)?.photoOrder || 0;
            const bOrder = prismaUser.photos.find(ph => ph.photoUrl === b)?.photoOrder || 0;
            return aOrder - bOrder;
        }) : [],
        isOnline: prismaUser.isOnline || false,
        matchRate: prismaUser.matchRate || 0,
        interests: prismaUser.interests || [],
        videoCallOk: prismaUser.videoCallOk || false,
        selfIntroduction: prismaUser.selfIntroduction,
        height: prismaUser.height,
        bodyType: prismaUser.bodyType,
        charmPoints: prismaUser.charmPoints || [],
        personality: prismaUser.personality || [],
        languages: prismaUser.languages || ['日本語'],
        bloodType: prismaUser.bloodType,
        siblings: prismaUser.siblings,
        occupation: prismaUser.occupation,
        income: prismaUser.income,
        education: prismaUser.education,
        likes: prismaUser.likesCount || 0,
        views: prismaUser.viewsCount || 0,
        gender: prismaUser.gender,
        travelCompanionPreferences: prismaUser.travelCompanionPreferences || [],
        activityInterests: prismaUser.activityInterests || [],
        personalityTraits: prismaUser.personalityTraits || [],
        matchPreference: prismaUser.matchPreference,
        birthday: prismaUser.birthday ? prismaUser.birthday.toISOString().split('T')[0] : null,
        purposeOfUse: prismaUser.purposeOfUse || [],
        howDidYouLearn: prismaUser.howDidYouLearn,
        emailNotifications: prismaUser.emailNotifications || {
            allAgreed: true,
            messagesAgreed: true,
            campaignsAgreed: true,
        },
        travelDestination: prismaUser.travelDestination,
        createdAt: prismaUser.createdAt.toISOString(),
        updatedAt: prismaUser.updatedAt.toISOString(),
    };
};

// Get all users
const getAllUsers = async () => {
    try {
        const users = await prisma.user.findMany({
            include: {
                photos: {
                    orderBy: {
                        photoOrder: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        return users.map(prismaUserToUser);
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
};

// Get user by email
const getUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                photos: {
                    orderBy: {
                        photoOrder: 'asc',
                    },
                },
            },
        });
        
        return user ? prismaUserToUser(user) : null;
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
};

// Get user by ID
const getUserById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                photos: {
                    orderBy: {
                        photoOrder: 'asc',
                    },
                },
            },
        });
        
        return user ? prismaUserToUser(user) : null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
};

// Create or update user
const saveUser = async (userData) => {
    try {
        // Prepare data for Prisma
        const prismaData = {
            email: userData.email,
            displayName: userData.displayName,
            age: userData.age,
            region: userData.region,
            hometown: userData.hometown,
            profilePhotoUrl: userData.profilePhotoUrl,
            profilePhotoFilter: userData.profilePhotoFilter || 'original',
            isOnline: userData.isOnline !== undefined ? userData.isOnline : false,
            matchRate: userData.matchRate || 0,
            interests: userData.interests || [],
            videoCallOk: userData.videoCallOk !== undefined ? userData.videoCallOk : false,
            selfIntroduction: userData.selfIntroduction,
            height: userData.height,
            bodyType: userData.bodyType,
            charmPoints: userData.charmPoints || [],
            personality: userData.personality || [],
            languages: userData.languages || ['日本語'],
            bloodType: userData.bloodType,
            siblings: userData.siblings,
            occupation: userData.occupation,
            income: userData.income,
            education: userData.education,
            likesCount: userData.likes || 0,
            viewsCount: userData.views || 0,
            gender: userData.gender,
            travelCompanionPreferences: userData.travelCompanionPreferences || [],
            activityInterests: userData.activityInterests || [],
            personalityTraits: userData.personalityTraits || [],
            matchPreference: userData.matchPreference,
            birthday: userData.birthday ? new Date(userData.birthday) : null,
            purposeOfUse: userData.purposeOfUse || [],
            howDidYouLearn: userData.howDidYouLearn,
            emailNotifications: userData.emailNotifications || {
                allAgreed: true,
                messagesAgreed: true,
                campaignsAgreed: true,
            },
            travelDestination: userData.travelDestination,
        };

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
            include: { photos: true },
        });

        let user;
        
        if (existingUser) {
            // Update existing user
            user = await prisma.user.update({
                where: { email: userData.email },
                data: prismaData,
                include: {
                    photos: {
                        orderBy: {
                            photoOrder: 'asc',
                        },
                    },
                },
            });

            // Handle photos separately if provided
            if (userData.photos !== undefined) {
                // Delete existing photos
                await prisma.userPhoto.deleteMany({
                    where: { userId: user.id },
                });

                // Insert new photos
                if (userData.photos.length > 0) {
                    await prisma.userPhoto.createMany({
                        data: userData.photos.map((photoUrl, index) => ({
                            userId: user.id,
                            photoUrl,
                            photoOrder: index,
                        })),
                    });
                }

                // Reload user with photos
                user = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        photos: {
                            orderBy: {
                                photoOrder: 'asc',
                            },
                        },
                    },
                });
            }
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    ...prismaData,
                    photos: userData.photos && userData.photos.length > 0 ? {
                        create: userData.photos.map((photoUrl, index) => ({
                            photoUrl,
                            photoOrder: index,
                        })),
                    } : undefined,
                },
                include: {
                    photos: {
                        orderBy: {
                            photoOrder: 'asc',
                        },
                    },
                },
            });
        }

        return prismaUserToUser(user);
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

// Add like
const addLike = async (fromUserId, toUserId) => {
    try {
        // Check if like already exists
        const existingLike = await prisma.like.findUnique({
            where: {
                fromUserId_toUserId: {
                    fromUserId,
                    toUserId,
                },
            },
        });

        if (existingLike) {
            return existingLike;
        }

        // Create like in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the like
            const like = await tx.like.create({
                data: {
                    fromUserId,
                    toUserId,
                },
            });

            // Update likes count
            await tx.user.update({
                where: { id: toUserId },
                data: {
                    likesCount: {
                        increment: 1,
                    },
                },
            });

            return like;
        });

        return result;
    } catch (error) {
        console.error('Error adding like:', error);
        throw error;
    }
};

// Add footprint (profile view)
const addFootprint = async (viewerId, viewedId) => {
    try {
        // Create footprint in a transaction
        await prisma.$transaction(async (tx) => {
            // Create the footprint
            await tx.footprint.create({
                data: {
                    viewerId,
                    viewedId,
                },
            });

            // Update views count
            await tx.user.update({
                where: { id: viewedId },
                data: {
                    viewsCount: {
                        increment: 1,
                    },
                },
            });
        });
    } catch (error) {
        console.error('Error adding footprint:', error);
        throw error;
    }
};

// Get likes received by user
const getLikesReceived = async (userId) => {
    try {
        const likes = await prisma.like.findMany({
            where: {
                toUserId: userId,
            },
            include: {
                fromUser: {
                    include: {
                        photos: {
                            orderBy: {
                                photoOrder: 'asc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return likes.map(like => ({
            id: like.id,
            fromUserId: like.fromUserId,
            toUserId: like.toUserId,
            timestamp: like.timestamp.toISOString(),
            user: prismaUserToUser(like.fromUser),
        }));
    } catch (error) {
        console.error('Error getting likes received:', error);
        return [];
    }
};

// Get footprints (profile views) for user
const getFootprints = async (userId) => {
    try {
        const footprints = await prisma.footprint.findMany({
            where: {
                viewedId: userId,
            },
            include: {
                viewer: {
                    include: {
                        photos: {
                            orderBy: {
                                photoOrder: 'asc',
                            },
                        },
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        return footprints.map(footprint => ({
            id: footprint.id,
            viewerId: footprint.viewerId,
            viewedId: footprint.viewedId,
            timestamp: footprint.timestamp.toISOString(),
            user: prismaUserToUser(footprint.viewer),
        }));
    } catch (error) {
        console.error('Error getting footprints:', error);
        return [];
    }
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
