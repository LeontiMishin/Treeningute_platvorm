import { resolveUserRole } from "./user-role";

type UserLike = {
  userId: number;
  name: string;
  email: string;
  registerDate: Date | null;
  roleCode?: string | null;
  accountStatus?: string | null;
  preferredLanguage?: string | null;
};

export function toPublicUser(user: UserLike) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    registerDate: user.registerDate,
    role: resolveUserRole(user.email, user.roleCode),
    accountStatus: user.accountStatus ?? "ACTIVE",
    preferredLanguage: user.preferredLanguage ?? null,
  };
}
