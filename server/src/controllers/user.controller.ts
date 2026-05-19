import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { publicUserSelect } from "../utils/selects";
import { toPublicUser } from "../utils/user-presenter";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: publicUserSelect,
    orderBy: {
      registerDate: "desc",
    },
  });

  res.status(200).json(users.map(toPublicUser));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { userId: id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json(toPublicUser(user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existingUser = await prisma.user.findUnique({
    where: { userId: id },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found.");
  }

  const body = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : undefined;

  const updatedUser = await prisma.user.update({
    where: { userId: id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: publicUserSelect,
  });

  res.status(200).json(toPublicUser(updatedUser));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { userId: id },
    select: { userId: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await prisma.user.delete({
    where: { userId: id },
  });

  res.status(200).json({
    message: "User deleted successfully.",
  });
});
