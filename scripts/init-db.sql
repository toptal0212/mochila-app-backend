-- Vercel Postgres Database Schema for Mochila App
-- Run this script to initialize the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    age INTEGER,
    region VARCHAR(255),
    hometown VARCHAR(255),
    profile_photo_url TEXT,
    profile_photo_filter VARCHAR(50) DEFAULT 'original',
    is_online BOOLEAN DEFAULT false,
    match_rate INTEGER DEFAULT 0,
    interests TEXT[], -- Array of interests
    video_call_ok BOOLEAN DEFAULT false,
    self_introduction TEXT,
    height VARCHAR(50),
    body_type VARCHAR(50),
    charm_points TEXT[], -- Array of charm points
    personality TEXT[], -- Array of personality traits
    languages TEXT[] DEFAULT ARRAY['日本語'],
    blood_type VARCHAR(10),
    siblings VARCHAR(100),
    occupation VARCHAR(255),
    income VARCHAR(100),
    education VARCHAR(100),
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    gender VARCHAR(50),
    travel_companion_preferences TEXT[],
    activity_interests TEXT[],
    personality_traits TEXT[],
    match_preference VARCHAR(50),
    birthday DATE,
    purpose_of_use TEXT[],
    how_did_you_learn VARCHAR(255),
    email_notifications JSONB,
    travel_destination VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User photos table (for multiple photos)
CREATE TABLE IF NOT EXISTS user_photos (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id VARCHAR(255) PRIMARY KEY,
    from_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_user_id, to_user_id)
);

-- Footprints table (profile views)
CREATE TABLE IF NOT EXISTS footprints (
    id VARCHAR(255) PRIMARY KEY,
    viewer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON users(display_name);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_from_user_id ON likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user_id ON likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_footprints_viewer_id ON footprints(viewer_id);
CREATE INDEX IF NOT EXISTS idx_footprints_viewed_id ON footprints(viewed_id);
CREATE INDEX IF NOT EXISTS idx_footprints_timestamp ON footprints(timestamp DESC);

