import { getSession } from "@/lib/auth/session";

/**
 * Get the authenticated user ID from the session cookie.
 * Returns null if unauthenticated.
 *
 * Shared by API routes that can't use tRPC (e.g. file uploads).
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getSession();
  return session.userId ?? null;
}
