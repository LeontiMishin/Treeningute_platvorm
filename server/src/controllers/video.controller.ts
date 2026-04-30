import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const listVideos = asyncHandler(async (req: Request, res: Response) => {
  const { trainerId, categoryId, search } = req.query as {
    trainerId?: number;
    categoryId?: number;
    search?: string;
  };

  const where: Prisma.VideoWhereInput = {};

  if (trainerId) {
    where.trainerId = trainerId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  const videos = await prisma.video.findMany({
    where,
    include: {
      trainer: true,
      category: true,
    },
    orderBy: {
      videoId: "desc",
    },
  });

  res.status(200).json(videos);
});

export const getVideoById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const video = await prisma.video.findUnique({
    where: { videoId: id },
    include: {
      trainer: true,
      category: true,
    },
  });

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  res.status(200).json(video);
});

export const createVideo = asyncHandler(async (req: Request, res: Response) => {
  const video = await prisma.video.create({
    data: req.body,
    include: {
      trainer: true,
      category: true,
    },
  });

  res.status(201).json(video);
});

export const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const video = await prisma.video.findUnique({
    where: { videoId: id },
    select: { videoId: true },
  });

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  const updatedVideo = await prisma.video.update({
    where: { videoId: id },
    data: req.body,
    include: {
      trainer: true,
      category: true,
    },
  });

  res.status(200).json(updatedVideo);
});

export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const video = await prisma.video.findUnique({
    where: { videoId: id },
    select: { videoId: true },
  });

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  await prisma.video.delete({
    where: { videoId: id },
  });

  res.status(200).json({
    message: "Video deleted successfully.",
  });
});
