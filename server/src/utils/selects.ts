import { Prisma } from "@prisma/client";

export const publicUserSelect = {
  userId: true,
  name: true,
  email: true,
  registerDate: true,
} satisfies Prisma.UserSelect;
