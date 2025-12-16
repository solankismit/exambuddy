import { UserRole } from "@/generated/prisma";

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface AuthContext {
  user: AuthUser;
  token: string;
}
