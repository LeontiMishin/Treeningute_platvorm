import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      categoryName: "asc",
    },
  });

  res.status(200).json(categories);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const category = await prisma.category.findUnique({
    where: { categoryId: id },
    include: {
      videos: true,
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  res.status(200).json(category);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await prisma.category.create({
    data: req.body,
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const category = await prisma.category.findUnique({
    where: { categoryId: id },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  const updatedCategory = await prisma.category.update({
    where: { categoryId: id },
    data: req.body,
  });

  res.status(200).json(updatedCategory);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const category = await prisma.category.findUnique({
    where: { categoryId: id },
    select: { categoryId: true },
  });

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await prisma.category.delete({
    where: { categoryId: id },
  });

  res.status(200).json({
    message: "Category deleted successfully.",
  });
});
