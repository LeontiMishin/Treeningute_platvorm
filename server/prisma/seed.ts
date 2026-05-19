import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.tr_subscription_startdate()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
      IF NEW.startdate IS NULL THEN
        NEW.startdate := CURRENT_DATE;
      END IF;

      RETURN NEW;
    END;
    $function$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.tr_user_status()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    BEGIN
      RETURN NEW;
    END;
    $function$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS treeningute_platvorm.categories (
      categoryid SERIAL PRIMARY KEY,
      categoryname TEXT NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS treeningute_platvorm.playlist_videos (
      playlistvideoid SERIAL PRIMARY KEY,
      playlistid INTEGER NULL,
      videoid INTEGER NULL,
      CONSTRAINT playlist_videos_unique UNIQUE (playlistid, videoid)
    );
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'videos'
          AND constraint_name = 'videos_trainerid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.videos
        ADD CONSTRAINT videos_trainerid_fkey
        FOREIGN KEY (trainerid) REFERENCES treeningute_platvorm.trainers(trainerid)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'videos'
          AND constraint_name = 'videos_categoryid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.videos
        ADD CONSTRAINT videos_categoryid_fkey
        FOREIGN KEY (categoryid) REFERENCES treeningute_platvorm.categories(categoryid)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'playlists'
          AND constraint_name = 'playlists_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlists
        ADD CONSTRAINT playlists_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'user_subscriptions'
          AND constraint_name = 'user_subscriptions_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.user_subscriptions
        ADD CONSTRAINT user_subscriptions_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'user_subscriptions'
          AND constraint_name = 'user_subscriptions_planid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.user_subscriptions
        ADD CONSTRAINT user_subscriptions_planid_fkey
        FOREIGN KEY (planid) REFERENCES treeningute_platvorm.subscription_plans(planid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'playlist_videos'
          AND constraint_name = 'playlist_videos_playlistid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlist_videos
        ADD CONSTRAINT playlist_videos_playlistid_fkey
        FOREIGN KEY (playlistid) REFERENCES treeningute_platvorm.playlists(playlistid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm'
          AND table_name = 'playlist_videos'
          AND constraint_name = 'playlist_videos_videoid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlist_videos
        ADD CONSTRAINT playlist_videos_videoid_fkey
        FOREIGN KEY (videoid) REFERENCES treeningute_platvorm.videos(videoid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger tg
        JOIN pg_class c ON tg.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'treeningute_platvorm'
          AND c.relname = 'user_subscriptions'
          AND tg.tgname = 'trg_subscription_startdate'
          AND NOT tg.tgisinternal
      ) THEN
        CREATE TRIGGER trg_subscription_startdate
        BEFORE INSERT ON treeningute_platvorm.user_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION public.tr_subscription_startdate();
      END IF;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger tg
        JOIN pg_class c ON tg.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'treeningute_platvorm'
          AND c.relname = 'user_subscriptions'
          AND tg.tgname = 'trg_user_status'
          AND NOT tg.tgisinternal
      ) THEN
        CREATE TRIGGER trg_user_status
        BEFORE INSERT OR UPDATE ON treeningute_platvorm.user_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION public.tr_user_status();
      END IF;
    END $$;
  `);
}

async function upsertUser(email: string, name: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { userId: existingUser.userId },
      data: {
        name,
        passwordHash,
      },
    });
  }

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });
}

async function seedUsers() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@treening.ee";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";

  const admin = await upsertUser(adminEmail, "Admin User", adminPassword);
  const member = await upsertUser("member@trainflow.ee", "Demo Member", "Member123!");

  return { admin, member };
}

async function seedCategories() {
  if ((await prisma.category.count()) > 0) {
    return prisma.category.findMany({ orderBy: { categoryId: "asc" } });
  }

  await prisma.category.createMany({
    data: [
      { categoryName: "Strength" },
      { categoryName: "Cardio" },
      { categoryName: "Mobility" },
      { categoryName: "Recovery" },
      { categoryName: "Yoga" },
    ],
  });

  return prisma.category.findMany({ orderBy: { categoryId: "asc" } });
}

async function seedTrainers() {
  if ((await prisma.trainer.count()) > 0) {
    return prisma.trainer.findMany({ orderBy: { trainerId: "asc" } });
  }

  await prisma.trainer.createMany({
    data: [
      {
        trainerName: "Sandra Kask",
        bio: "Strength coach focused on home workouts and progressive training blocks.",
      },
      {
        trainerName: "Grete Saar",
        bio: "Energetic cardio and dance instructor with studio-style sessions.",
      },
      {
        trainerName: "Rasmus Oja",
        bio: "Mobility and recovery specialist for posture, movement quality, and flexibility.",
      },
      {
        trainerName: "Anna Tamm",
        bio: "Calm yoga teacher with structured sessions for all experience levels.",
      },
    ],
  });

  return prisma.trainer.findMany({ orderBy: { trainerId: "asc" } });
}

async function seedPlans() {
  if ((await prisma.subscriptionPlan.count()) > 0) {
    return prisma.subscriptionPlan.findMany({ orderBy: { planId: "asc" } });
  }

  await prisma.subscriptionPlan.createMany({
    data: [
      { planName: "Starter 1 Month", price: 9.95, durationMonths: 1 },
      { planName: "Active 3 Months", price: 24.95, durationMonths: 3 },
      { planName: "Full Access 12 Months", price: 79.95, durationMonths: 12 },
    ],
  });

  return prisma.subscriptionPlan.findMany({ orderBy: { planId: "asc" } });
}

async function seedVideos(
  categories: Array<{ categoryId: number; categoryName: string }>,
  trainers: Array<{ trainerId: number; trainerName: string }>,
) {
  if ((await prisma.video.count()) > 0) {
    return prisma.video.findMany({ orderBy: { videoId: "asc" } });
  }

  const categoryByName = Object.fromEntries(
    categories.map((category) => [category.categoryName, category.categoryId]),
  );
  const trainerByName = Object.fromEntries(
    trainers.map((trainer) => [trainer.trainerName, trainer.trainerId]),
  );

  await prisma.video.createMany({
    data: [
      {
        title: "Upper Body Strength Circuit",
        duration: 32,
        videoURL: "https://www.youtube.com/watch?v=UItWltVZZmE",
        language: "English",
        equipment: "Dumbbells",
        shortDescription: "A practical upper body routine with controlled tempo and clear coaching.",
        trainerId: trainerByName["Sandra Kask"],
        categoryId: categoryByName.Strength,
      },
      {
        title: "Lower Body Burn",
        duration: 41,
        videoURL: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
        language: "English",
        equipment: "Mat + resistance band",
        shortDescription: "Legs and glutes session built for home training without complicated setup.",
        trainerId: trainerByName["Sandra Kask"],
        categoryId: categoryByName.Strength,
      },
      {
        title: "Dance Cardio Express",
        duration: 22,
        videoURL: "https://www.youtube.com/watch?v=gC_L9qAHVJ8",
        language: "English",
        equipment: "No equipment",
        shortDescription: "Fast and uplifting cardio workout with simple combinations and good pace.",
        trainerId: trainerByName["Grete Saar"],
        categoryId: categoryByName.Cardio,
      },
      {
        title: "Morning Pulse Session",
        duration: 18,
        videoURL: "https://www.youtube.com/watch?v=UBMk30rjy0o",
        language: "English",
        equipment: "No equipment",
        shortDescription: "Short morning class to wake up the body and raise energy quickly.",
        trainerId: trainerByName["Grete Saar"],
        categoryId: categoryByName.Cardio,
      },
      {
        title: "Hip Mobility Reset",
        duration: 24,
        videoURL: "https://www.youtube.com/watch?v=VaoV1PrYft4",
        language: "English",
        equipment: "Mat",
        shortDescription: "Focused mobility flow for hips, lower back, and daily movement quality.",
        trainerId: trainerByName["Rasmus Oja"],
        categoryId: categoryByName.Mobility,
      },
      {
        title: "Shoulder and Spine Recovery",
        duration: 20,
        videoURL: "https://www.youtube.com/watch?v=sTANio_2E0Q",
        language: "English",
        equipment: "Mat",
        shortDescription: "Gentle reset for shoulders, upper back, and posture after long desk days.",
        trainerId: trainerByName["Rasmus Oja"],
        categoryId: categoryByName.Recovery,
      },
      {
        title: "Evening Yoga Flow",
        duration: 30,
        videoURL: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
        language: "English",
        equipment: "Mat",
        shortDescription: "Relaxed yoga sequence for breathing, flexibility, and end-of-day recovery.",
        trainerId: trainerByName["Anna Tamm"],
        categoryId: categoryByName.Yoga,
      },
      {
        title: "Recovery Stretch Session",
        duration: 17,
        videoURL: "https://www.youtube.com/watch?v=4BOTvaRaDjI",
        language: "English",
        equipment: "Mat",
        shortDescription: "Short guided stretch routine to recover after strength or cardio sessions.",
        trainerId: trainerByName["Anna Tamm"],
        categoryId: categoryByName.Recovery,
      },
    ],
  });

  return prisma.video.findMany({ orderBy: { videoId: "asc" } });
}

async function seedMemberContent(
  memberUserId: number,
  firstPlanId: number,
  videoIds: number[],
) {
  const existingSubscription = await prisma.userSubscription.findFirst({
    where: { userId: memberUserId },
  });

  if (!existingSubscription) {
    await prisma.userSubscription.create({
      data: {
        userId: memberUserId,
        planId: firstPlanId,
      },
    });
  }

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: memberUserId, playlistName: "Starter Playlist" },
  });

  if (!existingPlaylist) {
    await prisma.playlist.create({
      data: {
        userId: memberUserId,
        playlistName: "Starter Playlist",
        playlistVideos: {
          create: videoIds.slice(0, 3).map((videoId) => ({ videoId })),
        },
      },
    });
  }
}

async function main() {
  await ensureSchema();

  const { member } = await seedUsers();
  const categories = await seedCategories();
  const trainers = await seedTrainers();
  const plans = await seedPlans();
  const videos = await seedVideos(categories, trainers);

  await seedMemberContent(
    member.userId,
    plans[0].planId,
    videos.map((video) => video.videoId),
  );

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
