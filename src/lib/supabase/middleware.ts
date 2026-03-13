import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "./check";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Refresh the Supabase session and protect routes.
 *
 * @param request     — the incoming Next.js request
 * @param extraHeaders — additional headers to propagate on the request
 *                       (e.g. x-nonce for CSP). These are preserved even
 *                       when the Supabase client recreates the response.
 */
export async function updateSession(
  request: NextRequest,
  extraHeaders?: Headers,
): Promise<NextResponse> {
  // Build the forwarded request headers — start from the incoming request,
  // then layer any extras (nonce, etc.)
  function buildRequestHeaders(): Headers {
    const headers = new Headers(request.headers);
    if (extraHeaders) {
      extraHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }
    return headers;
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: buildRequestHeaders() },
  });

  // Fail-closed: reject requests if Supabase is not configured in production.
  // In development, allow unauthenticated access for local testing without Supabase.
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Authentication service not configured", {
        status: 503,
      });
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request: { headers: buildRequestHeaders() },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh the session — this also validates the token.
  // Wrap in try/catch so a misconfigured or unreachable Supabase instance
  // doesn't hang every request for 25+ seconds.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — treat as unauthenticated.
    // In dev this lets the app keep working; in prod the route
    // protection below will redirect to login.
    if (process.env.NODE_ENV !== "production") {
      return supabaseResponse;
    }
  }

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublicPath(pathname) && !pathname.startsWith("/api/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
