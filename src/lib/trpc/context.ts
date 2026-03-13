import { prisma } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/check";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export interface Context {
  prisma: typeof prisma;
  userId: string | null;
}

export async function createContext(
  _opts: FetchCreateContextFnOptions,
): Promise<Context> {
  // In development without Supabase, allow unauthenticated access.
  // In production, missing auth config means userId stays null —
  // protectedProcedure will reject the request with 401.
  if (!isSupabaseConfigured()) {
    return { prisma, userId: null };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookies are read-only in some contexts — middleware handles refresh
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { prisma, userId: null };
  }

  // Ensure user record exists in application database
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
    update: {
      email: user.email ?? "",
    },
  });

  return { prisma, userId: user.id };
}
