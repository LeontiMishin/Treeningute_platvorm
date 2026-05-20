-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "treeningute_platvorm";

-- UseSchema
SET search_path TO "treeningute_platvorm";

-- CreateTable
CREATE TABLE "users" (
    "userid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "registerdate" DATE DEFAULT CURRENT_TIMESTAMP,
    "rolecode" VARCHAR(30) NOT NULL DEFAULT 'USER',
    "accountstatus" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "preferredlanguage" VARCHAR(10),

    CONSTRAINT "users_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "trainers" (
    "trainerid" SERIAL NOT NULL,
    "trainername" TEXT NOT NULL,
    "bio" TEXT,
    "startdate" DATE,
    "userid" INTEGER,
    "headline" TEXT,
    "yearsexperience" INTEGER,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("trainerid")
);

-- CreateTable
CREATE TABLE "categories" (
    "categoryid" SERIAL NOT NULL,
    "categoryname" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("categoryid")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "planid" SERIAL NOT NULL,
    "planname" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "durationmonths" INTEGER NOT NULL,
    "accesstier" VARCHAR(20) NOT NULL DEFAULT 'STARTER',
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "maxactiveprograms" INTEGER,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("planid")
);

-- CreateTable
CREATE TABLE "videos" (
    "videoid" SERIAL NOT NULL,
    "duration" INTEGER,
    "title" TEXT NOT NULL,
    "videourl" TEXT,
    "language" TEXT,
    "equipment" TEXT,
    "shortdescription" TEXT,
    "trainerid" INTEGER,
    "categoryid" INTEGER,
    "accesstier" VARCHAR(20) NOT NULL DEFAULT 'STARTER',
    "publishedat" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "isfeatured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("videoid")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "usersubscriptionid" SERIAL NOT NULL,
    "startdate" DATE DEFAULT CURRENT_TIMESTAMP,
    "enddate" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "autorenew" BOOLEAN NOT NULL DEFAULT false,
    "userid" INTEGER,
    "planid" INTEGER,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("usersubscriptionid")
);

-- CreateTable
CREATE TABLE "workout_completions" (
    "workoutcompletionid" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "videoid" INTEGER NOT NULL,
    "completedat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "note" TEXT,
    "secondswatched" INTEGER,

    CONSTRAINT "workout_completions_pkey" PRIMARY KEY ("workoutcompletionid")
);

-- CreateTable
CREATE TABLE "playlists" (
    "playlistid" SERIAL NOT NULL,
    "playlistname" TEXT NOT NULL,
    "userid" INTEGER,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("playlistid")
);

-- CreateTable
CREATE TABLE "playlist_videos" (
    "playlistvideoid" SERIAL NOT NULL,
    "playlistid" INTEGER,
    "videoid" INTEGER,

    CONSTRAINT "playlist_videos_pkey" PRIMARY KEY ("playlistvideoid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_rolecode_idx" ON "users"("rolecode");

-- CreateIndex
CREATE INDEX "users_accountstatus_idx" ON "users"("accountstatus");

-- CreateIndex
CREATE UNIQUE INDEX "trainers_userid_key" ON "trainers"("userid");

-- CreateIndex
CREATE INDEX "subscription_plans_accesstier_isactive_idx" ON "subscription_plans"("accesstier", "isactive");

-- CreateIndex
CREATE INDEX "videos_trainerid_categoryid_idx" ON "videos"("trainerid", "categoryid");

-- CreateIndex
CREATE INDEX "videos_accesstier_publishedat_idx" ON "videos"("accesstier", "publishedat");

-- CreateIndex
CREATE INDEX "user_subscriptions_userid_status_idx" ON "user_subscriptions"("userid", "status");

-- CreateIndex
CREATE INDEX "workout_completions_userid_completedat_idx" ON "workout_completions"("userid", "completedat");

-- CreateIndex
CREATE INDEX "workout_completions_videoid_completedat_idx" ON "workout_completions"("videoid", "completedat");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_videos_playlistid_videoid_key" ON "playlist_videos"("playlistid", "videoid");

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_trainerid_fkey" FOREIGN KEY ("trainerid") REFERENCES "trainers"("trainerid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_categoryid_fkey" FOREIGN KEY ("categoryid") REFERENCES "categories"("categoryid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_planid_fkey" FOREIGN KEY ("planid") REFERENCES "subscription_plans"("planid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_completions" ADD CONSTRAINT "workout_completions_videoid_fkey" FOREIGN KEY ("videoid") REFERENCES "videos"("videoid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_playlistid_fkey" FOREIGN KEY ("playlistid") REFERENCES "playlists"("playlistid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_videos" ADD CONSTRAINT "playlist_videos_videoid_fkey" FOREIGN KEY ("videoid") REFERENCES "videos"("videoid") ON DELETE CASCADE ON UPDATE CASCADE;
