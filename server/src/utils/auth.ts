import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "./user-role";

type JwtPayload = {
  id: number;
  email: string;
  role: UserRole;
};

export function createAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
