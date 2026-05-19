import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../utils/auth";
import { ApiError } from "../utils/api-error";
import { resolveUserRole, UserRole } from "../utils/user-role";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is missing.");
    }

    const token = authorization.replace("Bearer ", "").trim();
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { userId: decoded.id },
      select: {
        userId: true,
        email: true,
      },
    });

    if (!user) {
      throw new ApiError(401, "User associated with token was not found.");
    }

    req.user = {
      id: user.userId,
      email: user.email,
      role: resolveUserRole(user.email),
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication is required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to access this resource."));
    }

    return next();
  };
}
