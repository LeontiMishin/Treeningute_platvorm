import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createAccessToken } from "../utils/auth";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { publicUserSelect } from "../utils/selects";
import { toPublicUser } from "../utils/user-presenter";
import { resolveUserRole } from "../utils/user-role";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleCode: "USER",
      accountStatus: "ACTIVE",
      preferredLanguage: "et",
    },
    select: publicUserSelect,
  });

  const role = resolveUserRole(user.email, user.roleCode);
  const token = createAccessToken({
    id: user.userId,
    email: user.email,
    role,
  });

  res.status(201).json({
    message: "Registration successful.",
    token,
    user: toPublicUser(user),
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = createAccessToken({
    id: user.userId,
    email: user.email,
    role: resolveUserRole(user.email, user.roleCode),
  });

  res.status(200).json({
    message: "Login successful.",
    token,
    user: toPublicUser(user),
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Logout successful. Remove the token on the client side.",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const user = await prisma.user.findUnique({
    where: { userId: req.user.id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json(toPublicUser(user));
});
