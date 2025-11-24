-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "age" INTEGER,
    "region" TEXT,
    "hometown" TEXT,
    "profile_photo_url" TEXT,
    "profile_photo_filter" TEXT DEFAULT 'original',
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "match_rate" INTEGER NOT NULL DEFAULT 0,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video_call_ok" BOOLEAN NOT NULL DEFAULT false,
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
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_photos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "photo_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "from_user_id" TEXT NOT NULL,
    "to_user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footprints" (
    "id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "footprints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_display_name_idx" ON "users"("display_name");

-- CreateIndex
CREATE INDEX "user_photos_user_id_idx" ON "user_photos"("user_id");

-- CreateIndex
CREATE INDEX "likes_from_user_id_idx" ON "likes"("from_user_id");

-- CreateIndex
CREATE INDEX "likes_to_user_id_idx" ON "likes"("to_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_from_user_id_to_user_id_key" ON "likes"("from_user_id", "to_user_id");

-- CreateIndex
CREATE INDEX "footprints_viewer_id_idx" ON "footprints"("viewer_id");

-- CreateIndex
CREATE INDEX "footprints_viewed_id_idx" ON "footprints"("viewed_id");

-- CreateIndex
CREATE INDEX "footprints_timestamp_idx" ON "footprints"("timestamp" DESC);

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footprints" ADD CONSTRAINT "footprints_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footprints" ADD CONSTRAINT "footprints_viewed_id_fkey" FOREIGN KEY ("viewed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
