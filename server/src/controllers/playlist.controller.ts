import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { UserRole } from "../utils/user-role";

const playlistInclude = {
  playlistVideos: {
    include: {
      video: {
        include: {
          trainer: true,
          category: true,
        },
      },
    },
  },
};

export const listPlaylists = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const where = req.user.role === UserRole.ADMIN ? undefined : { userId: req.user.id };

  const playlists = await prisma.playlist.findMany({
    where,
    include: playlistInclude,
    orderBy: {
      playlistId: "desc",
    },
  });

  res.status(200).json(playlists);
});

export const getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const playlist = await prisma.playlist.findUnique({
    where: { playlistId: id },
    include: playlistInclude,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (req.user.role !== UserRole.ADMIN && playlist.userId !== req.user.id) {
    throw new ApiError(403, "You cannot access this playlist.");
  }

  res.status(200).json(playlist);
});

export const createPlaylist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const body = req.body as {
    playlistName: string;
    videoIds?: number[];
  };

  const playlist = await prisma.playlist.create({
    data: {
      playlistName: body.playlistName,
      userId: req.user.id,
      playlistVideos: body.videoIds?.length
        ? {
            create: body.videoIds.map((videoId) => ({
              videoId,
            })),
          }
        : undefined,
    },
    include: playlistInclude,
  });

  res.status(201).json(playlist);
});

export const updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const existingPlaylist = await prisma.playlist.findUnique({
    where: { playlistId: id },
  });

  if (!existingPlaylist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (req.user.role !== UserRole.ADMIN && existingPlaylist.userId !== req.user.id) {
    throw new ApiError(403, "You cannot update this playlist.");
  }

  const body = req.body as {
    playlistName?: string;
    videoIds?: number[];
  };

  const updatedPlaylist = await prisma.playlist.update({
    where: { playlistId: id },
    data: {
      ...(body.playlistName !== undefined ? { playlistName: body.playlistName } : {}),
      ...(body.videoIds !== undefined
        ? {
            playlistVideos: {
              deleteMany: {},
              ...(body.videoIds.length > 0
                ? {
                    create: body.videoIds.map((videoId) => ({
                      videoId,
                    })),
                  }
                : {}),
            },
          }
        : {}),
    },
    include: playlistInclude,
  });

  res.status(200).json(updatedPlaylist);
});

export const deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const playlist = await prisma.playlist.findUnique({
    where: { playlistId: id },
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (req.user.role !== UserRole.ADMIN && playlist.userId !== req.user.id) {
    throw new ApiError(403, "You cannot delete this playlist.");
  }

  await prisma.playlist.delete({
    where: { playlistId: id },
  });

  res.status(200).json({
    message: "Playlist deleted successfully.",
  });
});
