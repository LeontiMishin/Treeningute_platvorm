import { Prisma } from "@prisma/client";

export const publicUserSelect = {
  userId: true,
  name: true,
  email: true,
  registerDate: true,
  roleCode: true,
  accountStatus: true,
  preferredLanguage: true,
} satisfies Prisma.UserSelect;
