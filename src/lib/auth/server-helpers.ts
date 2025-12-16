import { cache } from "react";
import { prisma } from "@/lib/prisma/client";
import { AuthUser } from "@/lib/types/auth";
import { UserRole } from "@/generated/prisma";
import { redirect } from "next/navigation";
import { mapPrismaUserToAuthUser } from "./user-mapper";

/**
 * Get Supabase client (cached per request using React.cache)
 */
const getSupabaseClient = cache(async () => {
  const { createClient } = await import("@/lib/supabase/server");
  return await createClient();
});

/**
 * Get authenticated user in server components
 * This optimizes by caching the Supabase client and user per request using React.cache
 */
export const getServerUser = cache(async (): Promise<AuthUser> => {
  // Get Supabase client (cached per request)
  const supabase = await getSupabaseClient();

  const {
    data: { user: supabaseUser },
    error: supabaseError,
  } = await supabase.auth.getUser();

  if (supabaseError || !supabaseUser) {
    redirect("/login");
  }

  // Fetch user from database
  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (!user) {
    redirect("/login");
  }

  return mapPrismaUserToAuthUser(user);
});

/**
 * Require admin role in server components
 */
export async function requireServerAdmin(): Promise<AuthUser> {
  const user = await getServerUser();

  if (user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return user;
}

/**
 * Get optional user (returns null if not authenticated)
 */
export async function getOptionalServerUser(): Promise<AuthUser | null> {
  try {
    return await getServerUser();
  } catch {
    return null;
  }
}
