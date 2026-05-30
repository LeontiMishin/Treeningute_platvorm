import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function exec(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

async function ensureSchema() {
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.payment_transactions CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.program_videos CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.workout_programs CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.difficulty_levels CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.user_profiles CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.user_role_assignments CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.roles CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.favorite_videos CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.video_equipment_items CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.video_goals CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.equipment_items CASCADE;`);
  await exec(`DROP TABLE IF EXISTS treeningute_platvorm.goals CASCADE;`);

  await exec(`
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

  await exec(`
    CREATE OR REPLACE FUNCTION public.tr_subscription_enddate()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      months_count integer;
    BEGIN
      SELECT durationmonths
      INTO months_count
      FROM treeningute_platvorm.subscription_plans
      WHERE planid = NEW.planid;

      IF NEW.startdate IS NULL THEN
        NEW.startdate := CURRENT_DATE;
      END IF;

      IF NEW.enddate IS NULL AND months_count IS NOT NULL THEN
        NEW.enddate := (NEW.startdate + make_interval(months => months_count))::date;
      END IF;

      IF NEW.status IS NULL THEN
        NEW.status := 'ACTIVE';
      END IF;

      RETURN NEW;
    END;
    $function$;
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS treeningute_platvorm.categories (
      categoryid SERIAL PRIMARY KEY,
      categoryname TEXT NOT NULL
    );
  `);

  await exec(`
    ALTER TABLE treeningute_platvorm.users
    ADD COLUMN IF NOT EXISTS rolecode VARCHAR(30) NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS accountstatus VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS preferredlanguage VARCHAR(10) NULL;
  `);

  await exec(`
    ALTER TABLE treeningute_platvorm.trainers
    ADD COLUMN IF NOT EXISTS userid INTEGER NULL,
    ADD COLUMN IF NOT EXISTS headline TEXT NULL,
    ADD COLUMN IF NOT EXISTS yearsexperience INTEGER NULL;
  `);

  await exec(`
    ALTER TABLE treeningute_platvorm.subscription_plans
    ADD COLUMN IF NOT EXISTS accesstier VARCHAR(20) NOT NULL DEFAULT 'STARTER',
    ADD COLUMN IF NOT EXISTS isactive BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS maxactiveprograms INTEGER NULL;
  `);

  await exec(`
    ALTER TABLE treeningute_platvorm.videos
    ADD COLUMN IF NOT EXISTS accesstier VARCHAR(20) NOT NULL DEFAULT 'STARTER',
    ADD COLUMN IF NOT EXISTS publishedat TIMESTAMPTZ NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS isfeatured BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await exec(`
    ALTER TABLE treeningute_platvorm.user_subscriptions
    ADD COLUMN IF NOT EXISTS enddate DATE NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS autorenew BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS treeningute_platvorm.playlist_videos (
      playlistvideoid SERIAL PRIMARY KEY,
      playlistid INTEGER NULL,
      videoid INTEGER NULL,
      CONSTRAINT playlist_videos_unique UNIQUE (playlistid, videoid)
    );
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS treeningute_platvorm.workout_completions (
      workoutcompletionid SERIAL PRIMARY KEY,
      userid INTEGER NOT NULL,
      videoid INTEGER NOT NULL,
      completedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rating INTEGER NULL,
      note TEXT NULL,
      secondswatched INTEGER NULL
    );
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'trainers' AND constraint_name = 'trainers_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.trainers
        ADD CONSTRAINT trainers_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'videos' AND constraint_name = 'videos_trainerid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.videos
        ADD CONSTRAINT videos_trainerid_fkey
        FOREIGN KEY (trainerid) REFERENCES treeningute_platvorm.trainers(trainerid)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'videos' AND constraint_name = 'videos_categoryid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.videos
        ADD CONSTRAINT videos_categoryid_fkey
        FOREIGN KEY (categoryid) REFERENCES treeningute_platvorm.categories(categoryid)
        ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'playlists' AND constraint_name = 'playlists_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlists
        ADD CONSTRAINT playlists_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'user_subscriptions' AND constraint_name = 'user_subscriptions_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.user_subscriptions
        ADD CONSTRAINT user_subscriptions_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'user_subscriptions' AND constraint_name = 'user_subscriptions_planid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.user_subscriptions
        ADD CONSTRAINT user_subscriptions_planid_fkey
        FOREIGN KEY (planid) REFERENCES treeningute_platvorm.subscription_plans(planid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'playlist_videos' AND constraint_name = 'playlist_videos_playlistid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlist_videos
        ADD CONSTRAINT playlist_videos_playlistid_fkey
        FOREIGN KEY (playlistid) REFERENCES treeningute_platvorm.playlists(playlistid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'playlist_videos' AND constraint_name = 'playlist_videos_videoid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.playlist_videos
        ADD CONSTRAINT playlist_videos_videoid_fkey
        FOREIGN KEY (videoid) REFERENCES treeningute_platvorm.videos(videoid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'workout_completions' AND constraint_name = 'workout_completions_userid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.workout_completions
        ADD CONSTRAINT workout_completions_userid_fkey
        FOREIGN KEY (userid) REFERENCES treeningute_platvorm.users(userid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'treeningute_platvorm' AND table_name = 'workout_completions' AND constraint_name = 'workout_completions_videoid_fkey'
      ) THEN
        ALTER TABLE treeningute_platvorm.workout_completions
        ADD CONSTRAINT workout_completions_videoid_fkey
        FOREIGN KEY (videoid) REFERENCES treeningute_platvorm.videos(videoid)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await exec(`CREATE INDEX IF NOT EXISTS users_rolecode_idx ON treeningute_platvorm.users(rolecode);`);
  await exec(`CREATE INDEX IF NOT EXISTS users_accountstatus_idx ON treeningute_platvorm.users(accountstatus);`);
  await exec(`CREATE INDEX IF NOT EXISTS videos_trainerid_categoryid_idx ON treeningute_platvorm.videos(trainerid, categoryid);`);
  await exec(`CREATE INDEX IF NOT EXISTS videos_accesstier_publishedat_idx ON treeningute_platvorm.videos(accesstier, publishedat);`);
  await exec(`CREATE INDEX IF NOT EXISTS user_subscriptions_userid_status_idx ON treeningute_platvorm.user_subscriptions(userid, status);`);
  await exec(`CREATE INDEX IF NOT EXISTS workout_completions_userid_completedat_idx ON treeningute_platvorm.workout_completions(userid, completedat);`);
  await exec(`CREATE INDEX IF NOT EXISTS workout_completions_videoid_completedat_idx ON treeningute_platvorm.workout_completions(videoid, completedat);`);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.member_access_overview AS
    SELECT
      u.userid,
      u.name,
      u.email,
      u.rolecode,
      us.usersubscriptionid,
      sp.planname,
      sp.accesstier,
      us.startdate,
      us.enddate,
      us.status
    FROM treeningute_platvorm.users u
    LEFT JOIN LATERAL (
      SELECT us_inner.*
      FROM treeningute_platvorm.user_subscriptions us_inner
      WHERE us_inner.userid = u.userid
        AND us_inner.status = 'ACTIVE'
      ORDER BY us_inner.startdate DESC, us_inner.usersubscriptionid DESC
      LIMIT 1
    ) us ON TRUE
    LEFT JOIN treeningute_platvorm.subscription_plans sp ON sp.planid = us.planid;
  `);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.member_progress_snapshot AS
    SELECT
      u.userid,
      u.name,
      COUNT(DISTINCT wc.videoid) AS workouts_completed,
      COALESCE(AVG(wc.rating::numeric), 0) AS avg_rating,
      MAX(wc.completedat) AS last_completed_at
    FROM treeningute_platvorm.users u
    LEFT JOIN treeningute_platvorm.workout_completions wc ON wc.userid = u.userid
    GROUP BY u.userid, u.name;
  `);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.trainer_program_overview AS
    SELECT
      t.trainerid,
      t.trainername,
      COUNT(DISTINCT v.videoid) AS video_count,
      COUNT(wc.workoutcompletionid) AS completion_count
    FROM treeningute_platvorm.trainers t
    LEFT JOIN treeningute_platvorm.videos v ON v.trainerid = t.trainerid
    LEFT JOIN treeningute_platvorm.workout_completions wc ON wc.videoid = v.videoid
    GROUP BY t.trainerid, t.trainername;
  `);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.trainer_video_catalog AS
    SELECT
      t.trainerid,
      t.trainername,
      v.videoid,
      v.title,
      v.accesstier,
      c.categoryname
    FROM treeningute_platvorm.trainers t
    JOIN treeningute_platvorm.videos v ON v.trainerid = t.trainerid
    LEFT JOIN treeningute_platvorm.categories c ON c.categoryid = v.categoryid;
  `);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.admin_revenue_summary AS
    SELECT
      sp.planid,
      sp.planname,
      COUNT(us.usersubscriptionid) AS subscription_count,
      COALESCE(SUM(sp.price), 0) AS estimated_revenue
    FROM treeningute_platvorm.subscription_plans sp
    LEFT JOIN treeningute_platvorm.user_subscriptions us ON us.planid = sp.planid
    GROUP BY sp.planid, sp.planname;
  `);

  await exec(`
    CREATE OR REPLACE VIEW treeningute_platvorm.admin_content_quality AS
    SELECT
      v.videoid,
      v.title,
      c.categoryname,
      CASE
        WHEN COALESCE(NULLIF(BTRIM(v.equipment), ''), '') <> '' THEN TRUE
        ELSE FALSE
      END AS has_equipment_info,
      CHAR_LENGTH(COALESCE(v.shortdescription, '')) AS description_length
    FROM treeningute_platvorm.videos v
    LEFT JOIN treeningute_platvorm.categories c ON c.categoryid = v.categoryid;
  `);

  await exec(`
    CREATE OR REPLACE FUNCTION public.sp_create_subscription(
      p_user_id integer,
      p_plan_id integer,
      p_start_date timestamptz DEFAULT NULL,
      p_auto_renew boolean DEFAULT false
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      v_subscription_id integer;
    BEGIN
      UPDATE treeningute_platvorm.user_subscriptions
      SET status = 'SUPERSEDED',
          autorenew = false
      WHERE userid = p_user_id
        AND status = 'ACTIVE';

      INSERT INTO treeningute_platvorm.user_subscriptions(userid, planid, startdate, autorenew, status)
      VALUES (p_user_id, p_plan_id, p_start_date, COALESCE(p_auto_renew, false), 'ACTIVE')
      RETURNING usersubscriptionid INTO v_subscription_id;

      RETURN v_subscription_id;
    END;
    $function$;
  `);

  await exec(`
    CREATE OR REPLACE FUNCTION public.sp_mark_workout_completed(
      p_user_id integer,
      p_video_id integer,
      p_seconds_watched integer DEFAULT NULL,
      p_rating integer DEFAULT NULL,
      p_note text DEFAULT NULL
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      v_completion_id integer;
    BEGIN
      INSERT INTO treeningute_platvorm.workout_completions(userid, videoid, secondswatched, rating, note)
      VALUES (p_user_id, p_video_id, p_seconds_watched, p_rating, p_note)
      RETURNING workoutcompletionid INTO v_completion_id;

      RETURN v_completion_id;
    END;
    $function$;
  `);

  await exec(`
    CREATE OR REPLACE FUNCTION public.fn_total_workouts_completed(
      p_user_id integer
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      v_total integer;
    BEGIN
      SELECT COUNT(*)
      INTO v_total
      FROM treeningute_platvorm.workout_completions
      WHERE userid = p_user_id;

      RETURN COALESCE(v_total, 0);
    END;
    $function$;
  `);

  await exec(`
    CREATE OR REPLACE FUNCTION public.sp_create_playlist(
      p_user_id integer,
      p_playlist_name text
    )
    RETURNS integer
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      v_playlist_id integer;
    BEGIN
      IF TRIM(p_playlist_name) = '' THEN
        RAISE EXCEPTION 'Playlist name cannot be empty';
      END IF;

      INSERT INTO treeningute_platvorm.playlists(playlistname, userid)
      VALUES (p_playlist_name, p_user_id)
      RETURNING playlistid INTO v_playlist_id;

      RETURN v_playlist_id;
    END;
    $function$;
  `);

  await exec(`DROP TRIGGER IF EXISTS trg_subscription_startdate ON treeningute_platvorm.user_subscriptions;`);
  await exec(`
    CREATE TRIGGER trg_subscription_startdate
    BEFORE INSERT ON treeningute_platvorm.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.tr_subscription_startdate();
  `);

  await exec(`DROP TRIGGER IF EXISTS trg_subscription_enddate ON treeningute_platvorm.user_subscriptions;`);
  await exec(`
    CREATE TRIGGER trg_subscription_enddate
    BEFORE INSERT OR UPDATE ON treeningute_platvorm.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.tr_subscription_enddate();
  `);
}

async function upsertUser(email: string, name: string, password: string, roleCode = "USER") {
  const passwordHash = await bcrypt.hash(password, 10);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return prisma.user.update({
      where: { userId: existingUser.userId },
      data: {
        name,
        passwordHash,
        roleCode,
        accountStatus: "ACTIVE",
        preferredLanguage: "et",
      },
    });
  }

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleCode,
      accountStatus: "ACTIVE",
      preferredLanguage: "et",
    },
  });
}

async function seedUsers() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@treening.ee";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";

  const admin = await upsertUser(adminEmail, "Admin User", adminPassword, "ADMIN");
  const member = await upsertUser("member@fitnest.ee", "Demo Member", "Member123!", "USER");
  const trainerSandra = await upsertUser("sandra@fitnest.ee", "Sandra Kask", "Trainer123!", "USER");
  const trainerGrete = await upsertUser("grete@fitnest.ee", "Grete Saar", "Trainer123!", "USER");
  const trainerRasmus = await upsertUser("rasmus@fitnest.ee", "Rasmus Oja", "Trainer123!", "USER");
  const trainerAnna = await upsertUser("anna@fitnest.ee", "Anna Tamm", "Trainer123!", "USER");

  return { admin, member, trainerSandra, trainerGrete, trainerRasmus, trainerAnna };
}

async function seedCategories() {
  const categories = ["Strength", "Cardio", "Mobility", "Recovery", "Yoga"];

  for (const categoryName of categories) {
    const existing = await prisma.category.findFirst({ where: { categoryName } });
    if (!existing) {
      await prisma.category.create({ data: { categoryName } });
    }
  }

  return prisma.category.findMany({ orderBy: { categoryId: "asc" } });
}

async function seedTrainers(users: Awaited<ReturnType<typeof seedUsers>>) {
  const trainers = [
    {
      trainerName: "Sandra Kask",
      bio: "Strength coach focused on progressive home training blocks and sustainable technique.",
      headline: "Strength coach",
      yearsExperience: 7,
      userId: users.trainerSandra.userId,
    },
    {
      trainerName: "Grete Saar",
      bio: "Cardio and mixed training coach with practical sessions for shared living spaces.",
      headline: "Cardio coach",
      yearsExperience: 5,
      userId: users.trainerGrete.userId,
    },
    {
      trainerName: "Rasmus Oja",
      bio: "Mobility and recovery specialist working with posture, stretching, and movement quality.",
      headline: "Mobility specialist",
      yearsExperience: 6,
      userId: users.trainerRasmus.userId,
    },
    {
      trainerName: "Anna Tamm",
      bio: "Yoga teacher with calm beginner-friendly sessions for daily balance and breathing.",
      headline: "Yoga teacher",
      yearsExperience: 8,
      userId: users.trainerAnna.userId,
    },
  ];

  for (const trainer of trainers) {
    const existing = await prisma.trainer.findFirst({ where: { trainerName: trainer.trainerName } });
    if (existing) {
      await prisma.trainer.update({ where: { trainerId: existing.trainerId }, data: trainer });
    } else {
      await prisma.trainer.create({ data: trainer });
    }
  }

  return prisma.trainer.findMany({ orderBy: { trainerId: "asc" } });
}

async function seedPlans() {
  const plans = [
    { planName: "Starter 1 Month", price: 9.95, durationMonths: 1, accessTier: "STARTER", isActive: true, maxActivePrograms: 1 },
    { planName: "Active 3 Months", price: 24.95, durationMonths: 3, accessTier: "PLUS", isActive: true, maxActivePrograms: 3 },
    { planName: "Full Access 12 Months", price: 79.95, durationMonths: 12, accessTier: "PRO", isActive: true, maxActivePrograms: 10 },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { planName: plan.planName } });
    if (existing) {
      await prisma.subscriptionPlan.update({ where: { planId: existing.planId }, data: plan });
    } else {
      await prisma.subscriptionPlan.create({ data: plan });
    }
  }

  return prisma.subscriptionPlan.findMany({ orderBy: { planId: "asc" } });
}

async function seedVideos(
  categories: Array<{ categoryId: number; categoryName: string }>,
  trainers: Array<{ trainerId: number; trainerName: string }>,
) {
  const categoryByName = Object.fromEntries(categories.map((category) => [category.categoryName, category.categoryId]));
  const trainerByName = Object.fromEntries(trainers.map((trainer) => [trainer.trainerName, trainer.trainerId]));

  const canonicalVideos = [
    {
      title: "Total Body Strength for Beginners",
      duration: 28,
      videoURL: "https://www.youtube.com/watch?v=Gze8oMuj4as",
      language: "English",
      equipment: "Mat",
      shortDescription: "A structured beginner strength session with low-impact progressions and clear technique cues.",
      trainerId: trainerByName["Sandra Kask"],
      categoryId: categoryByName.Strength,
      accessTier: "PRO",
      isFeatured: true,
    },
    {
      title: "Superset Total Body Strength",
      duration: 24,
      videoURL: "https://www.youtube.com/watch?v=nM-Z3axdxUg",
      language: "English",
      equipment: "Dumbbells",
      shortDescription: "A steady full-body strength workout focused on compound movements and good form.",
      trainerId: trainerByName["Sandra Kask"],
      categoryId: categoryByName.Strength,
      accessTier: "PRO",
      isFeatured: false,
    },
    {
      title: "Low Impact Beginner Cardio",
      duration: 26,
      videoURL: "https://www.youtube.com/watch?v=gvLAtoKVvAM",
      language: "English",
      equipment: "No equipment",
      shortDescription: "A feel-good beginner cardio session that keeps impact low and movement quality high.",
      trainerId: trainerByName["Grete Saar"],
      categoryId: categoryByName.Cardio,
      accessTier: "PLUS",
      isFeatured: true,
    },
    {
      title: "Quiet Cardio Session",
      duration: 22,
      videoURL: "https://www.youtube.com/watch?v=YaJryQEsT94",
      language: "English",
      equipment: "No equipment",
      shortDescription: "A low-noise cardio routine that works well for apartments, dorms, and shared spaces.",
      trainerId: trainerByName["Grete Saar"],
      categoryId: categoryByName.Cardio,
      accessTier: "PLUS",
      isFeatured: false,
    },
    {
      title: "Strength and Cardio Blend",
      duration: 19,
      videoURL: "https://www.youtube.com/watch?v=gMGF88XMh2s",
      language: "English",
      equipment: "Dumbbells",
      shortDescription: "A short mixed session combining accessible cardio intervals with practical strength work.",
      trainerId: trainerByName["Grete Saar"],
      categoryId: categoryByName.Cardio,
      accessTier: "PLUS",
      isFeatured: false,
    },
    {
      title: "Full Body Maintenance Mobility",
      duration: 13,
      videoURL: "https://www.youtube.com/watch?v=sUwnM7ARoMU",
      language: "English",
      equipment: "Mat",
      shortDescription: "A mobility-focused class for hips, posture, and full-body range of motion.",
      trainerId: trainerByName["Rasmus Oja"],
      categoryId: categoryByName.Mobility,
      accessTier: "PLUS",
      isFeatured: true,
    },
    {
      title: "Quick Mobility and Stretching",
      duration: 14,
      videoURL: "https://www.youtube.com/watch?v=9MAW69d-s3Y",
      language: "English",
      equipment: "Mat",
      shortDescription: "A calm mobility and stretching companion routine for recovery days or study breaks.",
      trainerId: trainerByName["Rasmus Oja"],
      categoryId: categoryByName.Mobility,
      accessTier: "STARTER",
      isFeatured: false,
    },
    {
      title: "Lower Back Stretching Routine",
      duration: 5,
      videoURL: "https://www.youtube.com/watch?v=9iljr_dEUPY",
      language: "English",
      equipment: "Mat",
      shortDescription: "A brief recovery routine for trunk mobility and lower-back comfort after long desk sessions.",
      trainerId: trainerByName["Rasmus Oja"],
      categoryId: categoryByName.Recovery,
      accessTier: "STARTER",
      isFeatured: false,
    },
    {
      title: "Shoulder Relief Stretch Routine",
      duration: 5,
      videoURL: "https://www.youtube.com/watch?v=6jHsraw2NIk",
      language: "English",
      equipment: "Chair",
      shortDescription: "A short shoulder and upper-back recovery session with straightforward guided stretches.",
      trainerId: trainerByName["Rasmus Oja"],
      categoryId: categoryByName.Recovery,
      accessTier: "STARTER",
      isFeatured: false,
    },
    {
      title: "Yoga For Beginners",
      duration: 20,
      videoURL: "https://www.youtube.com/watch?v=vNyJuQuuMC8",
      language: "English",
      equipment: "Mat",
      shortDescription: "A beginner-friendly yoga practice centred on breath, posture, and calm full-body movement.",
      trainerId: trainerByName["Anna Tamm"],
      categoryId: categoryByName.Yoga,
      accessTier: "STARTER",
      isFeatured: true,
    },
  ];

  const existingVideos = await prisma.video.findMany({ orderBy: { videoId: "asc" } });

  for (let index = 0; index < canonicalVideos.length; index += 1) {
    const video = canonicalVideos[index];
    if (existingVideos[index]) {
      await prisma.video.update({ where: { videoId: existingVideos[index].videoId }, data: video });
    } else {
      await prisma.video.create({ data: video });
    }
  }

  return prisma.video.findMany({ orderBy: { videoId: "asc" } });
}

async function seedMemberContent(
  memberUserId: number,
  starterPlanId: number,
  videos: Array<{ videoId: number; title: string }>,
) {
  await prisma.workoutCompletion.deleteMany({ where: { userId: memberUserId } });
  await prisma.userSubscription.deleteMany({ where: { userId: memberUserId } });

  await prisma.userSubscription.create({
    data: {
      userId: memberUserId,
      planId: starterPlanId,
      autoRenew: true,
    },
  });

  const existingPlaylist = await prisma.playlist.findFirst({
    where: { userId: memberUserId, playlistName: "Starter Playlist" },
  });

  if (existingPlaylist) {
    await prisma.playlistVideo.deleteMany({ where: { playlistId: existingPlaylist.playlistId } });
    await prisma.playlist.update({
      where: { playlistId: existingPlaylist.playlistId },
      data: {
        playlistVideos: {
          create: videos.slice(0, 3).map((video) => ({ videoId: video.videoId })),
        },
      },
    });
  } else {
    await prisma.playlist.create({
      data: {
        userId: memberUserId,
        playlistName: "Starter Playlist",
        playlistVideos: {
          create: videos.slice(0, 3).map((video) => ({ videoId: video.videoId })),
        },
      },
    });
  }

  await prisma.workoutCompletion.createMany({
    data: [
      {
        userId: memberUserId,
        videoId: videos[0]?.videoId,
        rating: 5,
        note: "Good first session for onboarding.",
        secondsWatched: 1280,
      },
      {
        userId: memberUserId,
        videoId: videos[6]?.videoId,
        rating: 4,
        note: "Helpful on a recovery day.",
        secondsWatched: 760,
      },
    ].filter((entry) => entry.videoId),
  });
}

async function main() {
  await ensureSchema();

  const users = await seedUsers();
  const categories = await seedCategories();
  const trainers = await seedTrainers(users);
  const plans = await seedPlans();
  const videos = await seedVideos(categories, trainers);
  await seedMemberContent(users.member.userId, plans[0].planId, videos);

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
