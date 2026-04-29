import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, "Route not found."));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Unique value conflict.",
        details: error.meta,
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Requested record was not found.",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Related record does not exist or cannot be referenced.",
        details: error.meta,
      });
    }
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error.",
  });
}

