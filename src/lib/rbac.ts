import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

/**
 * Server-side helper: returns the current session's user, or null.
 * Always use this (never a client-provided role) to decide what a
 * request is allowed to do — client-side checks are for UX only.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "You do not have permission to perform this action") {
    super(message);
  }
}

/**
 * Throws if there is no logged-in user, or if the user's role is not in
 * `allowedRoles`. Use this at the top of every server action / route
 * handler that must be role-restricted. Returns the user on success.
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}

export async function requireAnyUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
export const STAFF_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TEACHER"];
export const ALL_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "GUARDIAN"];
