import { UserRole } from "@/generated/prisma/enums";
import { AuthContext } from "@/lib/types/auth";
import { AppError } from "@/lib/utils/errors";

/**
 * Check if user has required role(s)
 */
export function hasRole(
  user: AuthContext["user"],
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(user.role);
}

/**
 * Require specific role(s) - throws error if user doesn't have role
 */
export function requireRole(
  authContext: AuthContext,
  requiredRoles: UserRole[]
): void {
  if (!hasRole(authContext.user, requiredRoles)) {
    throw new AppError(403, "Forbidden: Insufficient permissions", "FORBIDDEN");
  }
}

/**
 * Require admin role
 */
export function requireAdmin(authContext: AuthContext): void {
  requireRole(authContext, [UserRole.ADMIN]);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthContext["user"]): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user can access resource (self or admin)
 */
export function canAccessResource(
  authContext: AuthContext,
  resourceUserId: string
): boolean {
  return (
    authContext.user.id === resourceUserId ||
    authContext.user.role === UserRole.ADMIN
  );
}

/**
 * Require resource access (self or admin)
 */
export function requireResourceAccess(
  authContext: AuthContext,
  resourceUserId: string
): void {
  if (!canAccessResource(authContext, resourceUserId)) {
    throw new AppError(
      403,
      "Forbidden: Cannot access this resource",
      "FORBIDDEN"
    );
  }
}
