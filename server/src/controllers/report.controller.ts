import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { UserRole } from "../utils/user-role";

type MemberAccessOverviewRow = {
  userid: number;
  name: string;
  email: string;
  rolecode: string | null;
  usersubscriptionid: number | null;
  planname: string | null;
  accesstier: string | null;
  startdate: Date | null;
  enddate: Date | null;
  status: string | null;
};

type MemberProgressSnapshotRow = {
  userid: number;
  name: string;
  workouts_completed: bigint | number;
  avg_rating: number | string;
  last_completed_at: Date | null;
};

type TrainerProgramOverviewRow = {
  trainerid: number;
  trainername: string;
  video_count: bigint | number;
  completion_count: bigint | number;
};

type TrainerVideoCatalogRow = {
  trainerid: number;
  trainername: string;
  videoid: number;
  title: string;
  accesstier: string | null;
  categoryname: string | null;
};

type AdminRevenueSummaryRow = {
  planid: number;
  planname: string;
  subscription_count: bigint | number;
  estimated_revenue: number | string;
};

type AdminContentQualityRow = {
  videoid: number;
  title: string;
  categoryname: string | null;
  has_equipment_info: boolean;
  description_length: number;
};

function normalizeCount(value: bigint | number) {
  return typeof value === "bigint" ? Number(value) : value;
}

function normalizeDecimal(value: number | string) {
  return typeof value === "string" ? Number(value) : value;
}

async function getTrainerScopeId(req: Request) {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  if (req.user.role === UserRole.ADMIN) {
    return null;
  }

  const trainer = await prisma.trainer.findFirst({
    where: { userId: req.user.id },
    select: { trainerId: true },
  });

  if (!trainer) {
    throw new ApiError(403, "Trainer access is required for this resource.");
  }

  return trainer.trainerId;
}

export const getMemberAccessOverview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const rows = await prisma.$queryRaw<MemberAccessOverviewRow[]>`
    SELECT *
    FROM treeningute_platvorm.member_access_overview
    WHERE userid = ${req.user.id}
  `;

  res.status(200).json(rows[0] ?? null);
});

export const getMemberProgressSnapshot = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const rows = await prisma.$queryRaw<MemberProgressSnapshotRow[]>`
    SELECT *
    FROM treeningute_platvorm.member_progress_snapshot
    WHERE userid = ${req.user.id}
  `;

  const row = rows[0];

  res.status(200).json(
    row
      ? {
          ...row,
          workouts_completed: normalizeCount(row.workouts_completed),
          avg_rating: normalizeDecimal(row.avg_rating),
        }
      : null,
  );
});

export const markWorkoutCompleted = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const body = req.body as {
    videoId: number;
    secondsWatched?: number;
    rating?: number;
    note?: string;
  };

  const video = await prisma.video.findUnique({
    where: { videoId: body.videoId },
    select: { videoId: true, title: true },
  });

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  const rows = await prisma.$queryRaw<Array<{ workout_completion_id: number }>>`
    SELECT public.sp_mark_workout_completed(
      ${req.user.id}::integer,
      ${body.videoId}::integer,
      ${body.secondsWatched ?? null}::integer,
      ${body.rating ?? null}::integer,
      ${body.note ?? null}::text
    ) AS workout_completion_id
  `;

  const completionId = rows[0]?.workout_completion_id;

  if (!completionId) {
    throw new ApiError(500, "Workout completion could not be recorded.");
  }

  const completion = await prisma.workoutCompletion.findUnique({
    where: { workoutCompletionId: completionId },
    include: {
      video: {
        select: {
          videoId: true,
          title: true,
        },
      },
    },
  });

  res.status(201).json(completion);
});

export const getTrainerProgramOverview = asyncHandler(async (req: Request, res: Response) => {
  const trainerId = await getTrainerScopeId(req);

  const rows =
    trainerId === null
      ? await prisma.$queryRaw<TrainerProgramOverviewRow[]>`
          SELECT *
          FROM treeningute_platvorm.trainer_program_overview
          ORDER BY trainername
        `
      : await prisma.$queryRaw<TrainerProgramOverviewRow[]>`
          SELECT *
          FROM treeningute_platvorm.trainer_program_overview
          WHERE trainerid = ${trainerId}
        `;

  res.status(200).json(
    rows.map((row) => ({
      ...row,
      video_count: normalizeCount(row.video_count),
      completion_count: normalizeCount(row.completion_count),
    })),
  );
});

export const getTrainerVideoCatalog = asyncHandler(async (req: Request, res: Response) => {
  const trainerId = await getTrainerScopeId(req);

  const rows =
    trainerId === null
      ? await prisma.$queryRaw<TrainerVideoCatalogRow[]>`
          SELECT *
          FROM treeningute_platvorm.trainer_video_catalog
          ORDER BY trainername, title
        `
      : await prisma.$queryRaw<TrainerVideoCatalogRow[]>`
          SELECT *
          FROM treeningute_platvorm.trainer_video_catalog
          WHERE trainerid = ${trainerId}
          ORDER BY title
        `;

  res.status(200).json(rows);
});

export const getAdminRevenueSummary = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.$queryRaw<AdminRevenueSummaryRow[]>`
    SELECT *
    FROM treeningute_platvorm.admin_revenue_summary
    ORDER BY estimated_revenue DESC, planname
  `;

  res.status(200).json(
    rows.map((row) => ({
      ...row,
      subscription_count: normalizeCount(row.subscription_count),
      estimated_revenue: normalizeDecimal(row.estimated_revenue),
    })),
  );
});

export const getAdminContentQuality = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.$queryRaw<AdminContentQualityRow[]>`
    SELECT *
    FROM treeningute_platvorm.admin_content_quality
    ORDER BY description_length DESC, title
  `;

  res.status(200).json(rows);
});
