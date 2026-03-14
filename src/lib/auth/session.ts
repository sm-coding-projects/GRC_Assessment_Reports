import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/generated";

export interface SessionData {
  userId: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "this-is-a-dev-secret-change-in-production-32",
  cookieName: "grc_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  },
};

export async function getSession(): Promise<
  SessionData & { save: () => Promise<void>; destroy: () => void }
> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
