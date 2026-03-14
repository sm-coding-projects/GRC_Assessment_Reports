import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { UserRole } from "@prisma/generated";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export interface Context {
  prisma: typeof prisma;
  userId: string | null;
  userRole: UserRole | null;
}

export async function createContext(
  _opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const session = await getSession();

  if (!session.userId) {
    return { prisma, userId: null, userRole: null };
  }

  return {
    prisma,
    userId: session.userId,
    userRole: session.role,
  };
}
