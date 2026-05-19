import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { publicUserSelect } from "../utils/selects";
import { toPublicUser } from "../utils/user-presenter";
import { UserRole } from "../utils/user-role";

const subscriptionInclude = {
  plan: true,
  user: {
    select: publicUserSelect,
  },
};

export const listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const where = req.user.role === UserRole.ADMIN ? undefined : { userId: req.user.id };

  const subscriptions = await prisma.userSubscription.findMany({
    where,
    include: subscriptionInclude,
    orderBy: {
      userSubscriptionId: "desc",
    },
  });

  res.status(200).json(
    subscriptions.map((subscription) => ({
      ...subscription,
      user: subscription.user ? toPublicUser(subscription.user) : null,
    })),
  );
});

export const getSubscriptionById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const subscription = await prisma.userSubscription.findUnique({
    where: { userSubscriptionId: id },
    include: subscriptionInclude,
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found.");
  }

  if (req.user.role !== UserRole.ADMIN && subscription.userId !== req.user.id) {
    throw new ApiError(403, "You cannot access this subscription.");
  }

  res.status(200).json({
    ...subscription,
    user: subscription.user ? toPublicUser(subscription.user) : null,
  });
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const body = req.body as {
    planId: number;
    userId?: number;
    startDate?: Date;
  };

  const targetUserId =
    req.user.role === UserRole.ADMIN && body.userId ? body.userId : req.user.id;

  const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
    where: { planId: body.planId },
  });

  if (!subscriptionPlan) {
    throw new ApiError(404, "Subscription plan not found.");
  }

  const subscription = await prisma.userSubscription.create({
    data: {
      userId: targetUserId,
      planId: body.planId,
      startDate: body.startDate,
    },
    include: subscriptionInclude,
  });

  res.status(201).json({
    ...subscription,
    user: subscription.user ? toPublicUser(subscription.user) : null,
  });
});

export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const existingSubscription = await prisma.userSubscription.findUnique({
    where: { userSubscriptionId: id },
  });

  if (!existingSubscription) {
    throw new ApiError(404, "Subscription not found.");
  }

  if (req.user.role !== UserRole.ADMIN && existingSubscription.userId !== req.user.id) {
    throw new ApiError(403, "You cannot update this subscription.");
  }

  const body = req.body as {
    planId?: number;
    userId?: number;
    startDate?: Date;
  };

  if (body.planId) {
    const nextPlan = await prisma.subscriptionPlan.findUnique({
      where: { planId: body.planId },
    });

    if (!nextPlan) {
      throw new ApiError(404, "Subscription plan not found.");
    }
  }

  const subscription = await prisma.userSubscription.update({
    where: { userSubscriptionId: id },
    data: {
      ...(body.planId !== undefined ? { planId: body.planId } : {}),
      ...(req.user.role === UserRole.ADMIN && body.userId !== undefined
        ? { userId: body.userId }
        : {}),
      ...(body.startDate ? { startDate: body.startDate } : {}),
    },
    include: subscriptionInclude,
  });

  res.status(200).json({
    ...subscription,
    user: subscription.user ? toPublicUser(subscription.user) : null,
  });
});

export const deleteSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication is required.");
  }

  const id = Number(req.params.id);

  const subscription = await prisma.userSubscription.findUnique({
    where: { userSubscriptionId: id },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found.");
  }

  if (req.user.role !== UserRole.ADMIN && subscription.userId !== req.user.id) {
    throw new ApiError(403, "You cannot delete this subscription.");
  }

  await prisma.userSubscription.delete({
    where: { userSubscriptionId: id },
  });

  res.status(200).json({
    message: "Subscription deleted successfully.",
  });
});
