/**
 * Centralized user mapping utilities
 * Single source of truth for converting between user types
 */

import { User } from "@/generated/prisma/client";
import { AuthUser } from "@/lib/types/auth";

/**
 * Convert Prisma User to AuthUser
 */
export function mapPrismaUserToAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Convert multiple Prisma Users to AuthUsers
 */
export function mapPrismaUsersToAuthUsers(users: User[]): AuthUser[] {
  return users.map(mapPrismaUserToAuthUser);
}
