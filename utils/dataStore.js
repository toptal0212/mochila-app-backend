// Data store using Vercel Postgres
const { sql } = require('@vercel/postgres');

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);

// Helper function to convert database row to user object
const rowToUser = (row) => {
    if (!row) return null;
    
    return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        age: row.age,
        region: row.region,
        hometown: row.hometown,
        profilePhotoUrl: row.profile_photo_url,
        profilePhotoFilter: row.profile_photo_filter || 'original',
        photos: row.photos || [],
        isOnline: row.is_online || false,
        matchRate: row.match_rate || 0,
        interests: row.interests || [],
        videoCallOk: row.video_call_ok || false,
        selfIntroduction: row.self_introduction,
        height: row.height,
        bodyType: row.body_type,
        charmPoints: row.charm_points || [],
        personality: row.personality || [],
        languages: row.languages || ['日本語'],
        bloodType: row.blood_type,
        siblings: row.siblings,
        occupation: row.occupation,
        income: row.income,
        education: row.education,
        likes: row.likes_count || 0,
        views: row.views_count || 0,
        gender: row.gender,
        travelCompanionPreferences: row.travel_companion_preferences || [],
        activityInterests: row.activity_interests || [],
        personalityTraits: row.personality_traits || [],
        matchPreference: row.match_preference,
        birthday: row.birthday,
        region: row.region,
        purposeOfUse: row.purpose_of_use || [],
        howDidYouLearn: row.how_did_you_learn,
        emailNotifications: row.email_notifications || {
            allAgreed: true,
            messagesAgreed: true,
            campaignsAgreed: true,
        },
        travelDestination: row.travel_destination,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
};

// Get all users
const getAllUsers = async () => {
    try {
        const result = await sql`
            SELECT 
                u.*,
                COALESCE(
                    ARRAY_AGG(up.photo_url ORDER BY up.photo_order) FILTER (WHERE up.photo_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as photos
            FROM users u
            LEFT JOIN user_photos up ON u.id = up.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `;
        
        return result.rows.map(row => rowToUser(row));
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
};

// Get user by email
const getUserByEmail = async (email) => {
    try {
        const result = await sql`
            SELECT 
                u.*,
                COALESCE(
                    ARRAY_AGG(up.photo_url ORDER BY up.photo_order) FILTER (WHERE up.photo_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as photos
            FROM users u
            LEFT JOIN user_photos up ON u.id = up.user_id
            WHERE u.email = ${email}
            GROUP BY u.id
        `;
        
        return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
};

// Get user by ID
const getUserById = async (id) => {
    try {
        const result = await sql`
            SELECT 
                u.*,
                COALESCE(
                    ARRAY_AGG(up.photo_url ORDER BY up.photo_order) FILTER (WHERE up.photo_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as photos
            FROM users u
            LEFT JOIN user_photos up ON u.id = up.user_id
            WHERE u.id = ${id}
            GROUP BY u.id
        `;
        
        return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
};

// Create or update user
const saveUser = async (userData) => {
    try {
        // Check if user exists
        const existingUser = await getUserByEmail(userData.email);
        
        if (existingUser) {
            // Update existing user - merge with existing data
            const now = new Date().toISOString();
            
            await sql`
                UPDATE users SET
                    display_name = ${userData.displayName !== undefined ? userData.displayName : existingUser.displayName},
                    age = ${userData.age !== undefined ? userData.age : existingUser.age},
                    region = ${userData.region !== undefined ? userData.region : existingUser.region},
                    hometown = ${userData.hometown !== undefined ? userData.hometown : existingUser.hometown},
                    profile_photo_url = ${userData.profilePhotoUrl !== undefined ? userData.profilePhotoUrl : existingUser.profilePhotoUrl},
                    profile_photo_filter = ${userData.profilePhotoFilter !== undefined ? userData.profilePhotoFilter : existingUser.profilePhotoFilter || 'original'},
                    is_online = ${userData.isOnline !== undefined ? userData.isOnline : existingUser.isOnline || false},
                    match_rate = ${userData.matchRate !== undefined ? userData.matchRate : existingUser.matchRate || 0},
                    interests = ${userData.interests !== undefined ? userData.interests : existingUser.interests || []},
                    video_call_ok = ${userData.videoCallOk !== undefined ? userData.videoCallOk : existingUser.videoCallOk || false},
                    self_introduction = ${userData.selfIntroduction !== undefined ? userData.selfIntroduction : existingUser.selfIntroduction},
                    height = ${userData.height !== undefined ? userData.height : existingUser.height},
                    body_type = ${userData.bodyType !== undefined ? userData.bodyType : existingUser.bodyType},
                    charm_points = ${userData.charmPoints !== undefined ? userData.charmPoints : existingUser.charmPoints || []},
                    personality = ${userData.personality !== undefined ? userData.personality : existingUser.personality || []},
                    languages = ${userData.languages !== undefined ? userData.languages : existingUser.languages || ['日本語']},
                    blood_type = ${userData.bloodType !== undefined ? userData.bloodType : existingUser.bloodType},
                    siblings = ${userData.siblings !== undefined ? userData.siblings : existingUser.siblings},
                    occupation = ${userData.occupation !== undefined ? userData.occupation : existingUser.occupation},
                    income = ${userData.income !== undefined ? userData.income : existingUser.income},
                    education = ${userData.education !== undefined ? userData.education : existingUser.education},
                    gender = ${userData.gender !== undefined ? userData.gender : existingUser.gender},
                    travel_companion_preferences = ${userData.travelCompanionPreferences !== undefined ? userData.travelCompanionPreferences : existingUser.travelCompanionPreferences || []},
                    activity_interests = ${userData.activityInterests !== undefined ? userData.activityInterests : existingUser.activityInterests || []},
                    personality_traits = ${userData.personalityTraits !== undefined ? userData.personalityTraits : existingUser.personalityTraits || []},
                    match_preference = ${userData.matchPreference !== undefined ? userData.matchPreference : existingUser.matchPreference},
                    birthday = ${userData.birthday !== undefined ? userData.birthday : existingUser.birthday},
                    purpose_of_use = ${userData.purposeOfUse !== undefined ? userData.purposeOfUse : existingUser.purposeOfUse || []},
                    how_did_you_learn = ${userData.howDidYouLearn !== undefined ? userData.howDidYouLearn : existingUser.howDidYouLearn},
                    email_notifications = ${userData.emailNotifications !== undefined ? JSON.stringify(userData.emailNotifications) : JSON.stringify(existingUser.emailNotifications || {
                        allAgreed: true,
                        messagesAgreed: true,
                        campaignsAgreed: true,
                    })},
                    travel_destination = ${userData.travelDestination !== undefined ? userData.travelDestination : existingUser.travelDestination},
                    updated_at = ${now}
                WHERE email = ${userData.email}
            `;
            
            // Handle photos separately
            if (userData.photos !== undefined) {
                // Delete existing photos
                await sql`DELETE FROM user_photos WHERE user_id = ${existingUser.id}`;
                
                // Insert new photos
                if (userData.photos.length > 0) {
                    for (let i = 0; i < userData.photos.length; i++) {
                        await sql`
                            INSERT INTO user_photos (id, user_id, photo_url, photo_order)
                            VALUES (${generateId()}, ${existingUser.id}, ${userData.photos[i]}, ${i})
                        `;
                    }
                }
            }
            
            return await getUserById(existingUser.id);
        } else {
            // Create new user
            const userId = generateId();
            const now = new Date().toISOString();
            
            await sql`
                INSERT INTO users (
                    id, email, display_name, age, region, hometown,
                    profile_photo_url, profile_photo_filter, is_online, match_rate,
                    interests, video_call_ok, self_introduction, height, body_type,
                    charm_points, personality, languages, blood_type, siblings,
                    occupation, income, education, likes_count, views_count,
                    gender, travel_companion_preferences, activity_interests,
                    personality_traits, match_preference, birthday, purpose_of_use,
                    how_did_you_learn, email_notifications, travel_destination,
                    created_at, updated_at
                ) VALUES (
                    ${userId}, ${userData.email}, ${userData.displayName || null},
                    ${userData.age || null}, ${userData.region || null}, ${userData.hometown || null},
                    ${userData.profilePhotoUrl || null}, ${userData.profilePhotoFilter || 'original'},
                    ${userData.isOnline || false}, ${userData.matchRate || 0},
                    ${userData.interests || []}, ${userData.videoCallOk || false},
                    ${userData.selfIntroduction || null}, ${userData.height || null},
                    ${userData.bodyType || null}, ${userData.charmPoints || []},
                    ${userData.personality || []}, ${userData.languages || ['日本語']},
                    ${userData.bloodType || null}, ${userData.siblings || null},
                    ${userData.occupation || null}, ${userData.income || null},
                    ${userData.education || null}, ${userData.likes || 0}, ${userData.views || 0},
                    ${userData.gender || null}, ${userData.travelCompanionPreferences || []},
                    ${userData.activityInterests || []}, ${userData.personalityTraits || []},
                    ${userData.matchPreference || null}, ${userData.birthday || null},
                    ${userData.purposeOfUse || []}, ${userData.howDidYouLearn || null},
                    ${JSON.stringify(userData.emailNotifications || {
                        allAgreed: true,
                        messagesAgreed: true,
                        campaignsAgreed: true,
                    })}, ${userData.travelDestination || null},
                    ${now}, ${now}
                )
            `;
            
            // Insert photos if provided
            if (userData.photos && userData.photos.length > 0) {
                for (let i = 0; i < userData.photos.length; i++) {
                    await sql`
                        INSERT INTO user_photos (id, user_id, photo_url, photo_order)
                        VALUES (${generateId()}, ${userId}, ${userData.photos[i]}, ${i})
                    `;
                }
            }
            
            return await getUserById(userId);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
};

// Add like
const addLike = async (fromUserId, toUserId) => {
    try {
        // Check if like already exists
        const existingLike = await sql`
            SELECT * FROM likes 
            WHERE from_user_id = ${fromUserId} AND to_user_id = ${toUserId}
        `;
        
        if (existingLike.rows.length > 0) {
            return existingLike.rows[0];
        }
        
        // Insert new like
        const likeId = generateId();
        await sql`
            INSERT INTO likes (id, from_user_id, to_user_id, timestamp)
            VALUES (${likeId}, ${fromUserId}, ${toUserId}, ${new Date().toISOString()})
        `;
        
        // Update likes count
        await sql`
            UPDATE users 
            SET likes_count = likes_count + 1, updated_at = ${new Date().toISOString()}
            WHERE id = ${toUserId}
        `;
        
        const result = await sql`
            SELECT * FROM likes WHERE id = ${likeId}
        `;
        
        return result.rows[0];
    } catch (error) {
        console.error('Error adding like:', error);
        throw error;
    }
};

// Add footprint (profile view)
const addFootprint = async (viewerId, viewedId) => {
    try {
        const footprintId = generateId();
        await sql`
            INSERT INTO footprints (id, viewer_id, viewed_id, timestamp)
            VALUES (${footprintId}, ${viewerId}, ${viewedId}, ${new Date().toISOString()})
        `;
        
        // Update views count
        await sql`
            UPDATE users 
            SET views_count = views_count + 1, updated_at = ${new Date().toISOString()}
            WHERE id = ${viewedId}
        `;
    } catch (error) {
        console.error('Error adding footprint:', error);
        throw error;
    }
};

// Get likes received by user
const getLikesReceived = async (userId) => {
    try {
        const result = await sql`
            SELECT 
                l.*,
                u.id as user_id,
                u.email,
                u.display_name,
                u.age,
                u.region,
                u.profile_photo_url,
                u.is_online,
                u.match_rate,
                COALESCE(
                    ARRAY_AGG(up.photo_url ORDER BY up.photo_order) FILTER (WHERE up.photo_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as photos
            FROM likes l
            INNER JOIN users u ON l.from_user_id = u.id
            LEFT JOIN user_photos up ON u.id = up.user_id
            WHERE l.to_user_id = ${userId}
            GROUP BY l.id, u.id
            ORDER BY l.timestamp DESC
        `;
        
        return result.rows.map(row => ({
            id: row.id,
            fromUserId: row.from_user_id,
            toUserId: row.to_user_id,
            timestamp: row.timestamp,
            user: rowToUser({
                ...row,
                id: row.user_id,
                display_name: row.display_name,
                profile_photo_url: row.profile_photo_url,
                photos: row.photos,
            }),
        }));
    } catch (error) {
        console.error('Error getting likes received:', error);
        return [];
    }
};

// Get footprints (profile views) for user
const getFootprints = async (userId) => {
    try {
        const result = await sql`
            SELECT 
                f.*,
                u.id as user_id,
                u.email,
                u.display_name,
                u.age,
                u.region,
                u.profile_photo_url,
                u.is_online,
                u.match_rate,
                COALESCE(
                    ARRAY_AGG(up.photo_url ORDER BY up.photo_order) FILTER (WHERE up.photo_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as photos
            FROM footprints f
            INNER JOIN users u ON f.viewer_id = u.id
            LEFT JOIN user_photos up ON u.id = up.user_id
            WHERE f.viewed_id = ${userId}
            GROUP BY f.id, u.id
            ORDER BY f.timestamp DESC
        `;
        
        return result.rows.map(row => ({
            id: row.id,
            viewerId: row.viewer_id,
            viewedId: row.viewed_id,
            timestamp: row.timestamp,
            user: rowToUser({
                ...row,
                id: row.user_id,
                display_name: row.display_name,
                profile_photo_url: row.profile_photo_url,
                photos: row.photos,
            }),
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
