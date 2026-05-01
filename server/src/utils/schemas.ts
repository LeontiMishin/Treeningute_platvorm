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
});

export const subscriptionUpdateSchema = z
  .object({
    planId: intIdSchema.optional(),
    userId: intIdSchema.optional(),
    startDate: z.coerce.date().optional(),
  })
  .refine(requireAtLeastOneField, {
    message: "At least one field must be provided.",
  });
