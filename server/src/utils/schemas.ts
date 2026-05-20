import { z } from "zod";

const intIdSchema = z.coerce.number().int().positive();

const requireAtLeastOneField = (value: Record<string, unknown>) =>
  Object.values(value).some((entry) => entry !== undefined);

export const idParamSchema = z.object({
  id: intIdSchema,
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const userUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).max(100).optional(),
    preferredLanguage: z.string().max(10).optional(),
    accountStatus: z.string().max(30).optional(),
    roleCode: z.string().max(30).optional(),
  })
  .refine(requireAtLeastOneField, {
    message: "At least one field must be provided.",
  });

export const categoryCreateSchema = z.object({
  categoryName: z.string().min(2).max(80),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(requireAtLeastOneField, {
  message: "At least one field must be provided.",
});

export const trainerCreateSchema = z.object({
  trainerName: z.string().min(2).max(100),
  bio: z.string().max(1000).optional(),
  startDate: z.coerce.date().optional(),
});

export const trainerUpdateSchema = trainerCreateSchema.partial().refine(requireAtLeastOneField, {
  message: "At least one field must be provided.",
});

export const videoCreateSchema = z.object({
  title: z.string().min(2).max(120),
  duration: z.coerce.number().int().positive().optional(),
  videoURL: z.string().url().optional(),
  language: z.string().max(80).optional(),
  equipment: z.string().max(200).optional(),
  shortDescription: z.string().max(2000).optional(),
  trainerId: intIdSchema.optional(),
  categoryId: intIdSchema.optional(),
  difficultyLevelId: intIdSchema.optional(),
  accessTier: z.string().max(20).optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const videoUpdateSchema = videoCreateSchema.partial().refine(requireAtLeastOneField, {
  message: "At least one field must be provided.",
});

export const videoQuerySchema = z.object({
  trainerId: intIdSchema.optional(),
  categoryId: intIdSchema.optional(),
  search: z.string().max(120).optional(),
});

export const subscriptionPackageCreateSchema = z.object({
  planName: z.string().min(2).max(80),
  price: z.coerce.number().positive(),
  durationMonths: z.coerce.number().int().positive(),
  accessTier: z.string().max(20).optional(),
  isActive: z.coerce.boolean().optional(),
  maxActivePrograms: z.coerce.number().int().positive().optional(),
});

export const subscriptionPackageUpdateSchema = subscriptionPackageCreateSchema
  .partial()
  .refine(requireAtLeastOneField, {
    message: "At least one field must be provided.",
  });

export const playlistCreateSchema = z.object({
  playlistName: z.string().min(2).max(100),
  videoIds: z.array(intIdSchema).optional(),
});

export const playlistUpdateSchema = z
  .object({
    playlistName: z.string().min(2).max(100).optional(),
    videoIds: z.array(intIdSchema).optional(),
  })
  .refine(requireAtLeastOneField, {
    message: "At least one field must be provided.",
  });

export const subscriptionCreateSchema = z.object({
  planId: intIdSchema,
  userId: intIdSchema.optional(),
  startDate: z.coerce.date().optional(),
  autoRenew: z.coerce.boolean().optional(),
  paymentMethod: z.string().max(30).optional(),
});

export const subscriptionUpdateSchema = z
  .object({
    planId: intIdSchema.optional(),
    userId: intIdSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.string().max(20).optional(),
    autoRenew: z.coerce.boolean().optional(),
  })
  .refine(requireAtLeastOneField, {
    message: "At least one field must be provided.",
  });

export const workoutCompletionCreateSchema = z.object({
  videoId: intIdSchema,
  secondsWatched: z.coerce.number().int().positive().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  note: z.string().max(500).optional(),
});
