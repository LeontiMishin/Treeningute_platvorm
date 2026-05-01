import { resolveUserRole } from "./user-role";

type UserLike = {
  userId: number;
  name: string;
  email: string;
  registerDate: Date | null;
};

export function toPublicUser(user: UserLike) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    registerDate: user.registerDate,
    role: resolveUserRole(user.email),
  };
}
