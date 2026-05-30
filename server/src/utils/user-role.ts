import { env } from "../config/env";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export function resolveUserRole(email: string, roleCode?: string | null): UserRole {
  const normalizedRole = roleCode?.toUpperCase();

  if (normalizedRole === "ADMIN") {
    return UserRole.ADMIN;
  }

  return email.toLowerCase() === env.adminEmail ? UserRole.ADMIN : UserRole.USER;
}
