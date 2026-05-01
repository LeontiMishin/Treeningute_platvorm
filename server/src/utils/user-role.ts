import { env } from "../config/env";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export function resolveUserRole(email: string): UserRole {
  return email.toLowerCase() === env.adminEmail ? UserRole.ADMIN : UserRole.USER;
}
