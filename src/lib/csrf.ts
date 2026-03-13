/**
 * Validate the Origin header on state-changing requests (POST/PUT/DELETE/PATCH)
 * to prevent cross-site request forgery.
 *
 * Returns true if the request is safe, false if it should be rejected.
 */
export function validateCsrfOrigin(req: Request): boolean {
  // Only check state-changing methods
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const allowedOrigin = new URL(appUrl).origin;

  const origin = req.headers.get("origin");

  if (origin) {
    return origin === allowedOrigin;
  }

  // Fallback: if no Origin header, check Referer
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }

  // No Origin and no Referer — likely a same-origin fetch or non-browser client.
  // Allow it, since Supabase auth cookies provide the primary CSRF defense.
  return true;
}
