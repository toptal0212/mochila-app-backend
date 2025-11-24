-- Prisma Schema SQL for Vercel Postgres
-- Run this in Vercel Dashboard → Storage → Your Database → Query tab
-- This creates tables matching the Prisma schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "display_name" TEXT,
    "age" INTEGER,
    "region" TEXT,
    "hometown" TEXT,
    "profile_photo_url" TEXT,
    "profile_photo_filter" TEXT DEFAULT 'original',
    "is_online" BOOLEAN DEFAULT false,
    "match_rate" INTEGER DEFAULT 0,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video_call_ok" BOOLEAN DEFAULT false,
    "self_introduction" TEXT,
    "height" TEXT,
    "body_type" TEXT,
    "charm_points" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personality" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY['日本語']::TEXT[],
    "blood_type" TEXT,
    "siblings" TEXT,
    "occupation" TEXT,
    "income" TEXT,
    "education" TEXT,
    "likes_count" INTEGER DEFAULT 0,
    "views_count" INTEGER DEFAULT 0,
    "gender" TEXT,
    "travel_companion_preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activity_interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "personality_traits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "match_preference" TEXT,
    "birthday" DATE,
    "purpose_of_use" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "how_did_you_learn" TEXT,
    "email_notifications" JSONB,
    "travel_destination" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- User photos table
CREATE TABLE IF NOT EXISTS "user_photos" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "photo_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Likes table
CREATE TABLE IF NOT EXISTS "likes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("from_user_id", "to_user_id")
);

-- Footprints table
CREATE TABLE IF NOT EXISTS "footprints" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "viewer_id" TEXT NOT NULL,
    "viewed_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("viewed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_display_name_idx" ON "users"("display_name");
CREATE INDEX IF NOT EXISTS "user_photos_user_id_idx" ON "user_photos"("user_id");
CREATE INDEX IF NOT EXISTS "likes_from_user_id_idx" ON "likes"("from_user_id");
CREATE INDEX IF NOT EXISTS "likes_to_user_id_idx" ON "likes"("to_user_id");
CREATE INDEX IF NOT EXISTS "footprints_viewer_id_idx" ON "footprints"("viewer_id");
CREATE INDEX IF NOT EXISTS "footprints_viewed_id_idx" ON "footprints"("viewed_id");
CREATE INDEX IF NOT EXISTS "footprints_timestamp_idx" ON "footprints"("timestamp" DESC);

-- Create Prisma migration tracking table (if using Prisma migrations)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

