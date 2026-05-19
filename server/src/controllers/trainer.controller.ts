import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const listTrainers = asyncHandler(async (_req: Request, res: Response) => {
  const trainers = await prisma.trainer.findMany({
    orderBy: {
      trainerName: "asc",
    },
  });

  res.status(200).json(trainers);
});

export const getTrainerById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const trainer = await prisma.trainer.findUnique({
    where: { trainerId: id },
    include: {
      videos: true,
    },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer not found.");
  }

  res.status(200).json(trainer);
});

export const createTrainer = asyncHandler(async (req: Request, res: Response) => {
  const trainer = await prisma.trainer.create({
    data: req.body,
  });

  res.status(201).json(trainer);
});

export const updateTrainer = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const trainer = await prisma.trainer.findUnique({
    where: { trainerId: id },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer not found.");
  }

  const updatedTrainer = await prisma.trainer.update({
    where: { trainerId: id },
    data: req.body,
  });

  res.status(200).json(updatedTrainer);
});

export const deleteTrainer = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const trainer = await prisma.trainer.findUnique({
    where: { trainerId: id },
    select: { trainerId: true },
  });

  if (!trainer) {
    throw new ApiError(404, "Trainer not found.");
  }

  await prisma.trainer.delete({
    where: { trainerId: id },
  });

  res.status(200).json({
    message: "Trainer deleted successfully.",
  });
});
