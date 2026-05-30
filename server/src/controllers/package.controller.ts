import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const listPackages = asyncHandler(async (_req: Request, res: Response) => {
  const packages = await prisma.subscriptionPlan.findMany({
    orderBy: {
      price: "asc",
    },
  });

  res.status(200).json(packages);
});

export const getPackageById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const subscriptionPackage = await prisma.subscriptionPlan.findUnique({
    where: { planId: id },
    include: {
      subscriptions: true,
    },
  });

  if (!subscriptionPackage) {
    throw new ApiError(404, "Package not found.");
  }

  res.status(200).json(subscriptionPackage);
});

export const createPackage = asyncHandler(async (req: Request, res: Response) => {
  const subscriptionPackage = await prisma.subscriptionPlan.create({
    data: {
      ...req.body,
      accessTier: req.body.accessTier ?? "STARTER",
      isActive: req.body.isActive ?? true,
    },
  });

  res.status(201).json(subscriptionPackage);
});

export const updatePackage = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const subscriptionPackage = await prisma.subscriptionPlan.findUnique({
    where: { planId: id },
    select: { planId: true },
  });

  if (!subscriptionPackage) {
    throw new ApiError(404, "Package not found.");
  }

  const updatedPackage = await prisma.subscriptionPlan.update({
    where: { planId: id },
    data: req.body,
  });

  res.status(200).json(updatedPackage);
});

export const deletePackage = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const subscriptionPackage = await prisma.subscriptionPlan.findUnique({
    where: { planId: id },
    select: { planId: true },
  });

  if (!subscriptionPackage) {
    throw new ApiError(404, "Package not found.");
  }

  await prisma.subscriptionPlan.delete({
    where: { planId: id },
  });

  res.status(200).json({
    message: "Package deleted successfully.",
  });
});
