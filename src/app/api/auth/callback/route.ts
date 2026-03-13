import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/lib/db";
import { safeRedirectPath } from "@/lib/safe-redirect";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (!code) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "missing_code");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(url);
  }

  // Sync user to application database
  try {
    await prisma.user.upsert({
      where: { id: data.user.id },
      create: {
        id: data.user.id,
        email: data.user.email ?? "",
        name: data.user.user_metadata?.full_name ?? null,
        avatarUrl: data.user.user_metadata?.avatar_url ?? null,
      },
      update: {
        email: data.user.email ?? "",
        name: data.user.user_metadata?.full_name ?? null,
        avatarUrl: data.user.user_metadata?.avatar_url ?? null,
      },
    });
  } catch (err: unknown) {
    console.error(
      "[auth/callback] Failed to sync user to application database:",
      { userId: data.user.id, error: err },
    );
    // User sync failure should not block login — tRPC context will retry
  }

  return response;
}
