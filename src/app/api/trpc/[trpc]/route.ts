import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/router";
import { createContext } from "@/lib/trpc/context";
import { rateLimit } from "@/lib/rate-limit";
import { validateCsrfOrigin } from "@/lib/csrf";

const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;
const MAX_BODY_SIZE = 1_048_576; // 1 MB

function getClientIp(req: Request): string {
  // Prefer x-real-ip (set by Vercel / trusted proxies), fall back to x-forwarded-for
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();

  return "unknown";
}

function corsHeaders(): Record<string, string> {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    "Access-Control-Allow-Origin": new URL(origin).origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // CSRF origin validation on state-changing requests
  if (!validateCsrfOrigin(req)) {
    return new Response(
      JSON.stringify({ error: "CSRF validation failed", code: "CSRF_FAILED" }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders() } },
    );
  }

  // Request body size limit
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(
      JSON.stringify({ error: "Request body too large", code: "PAYLOAD_TOO_LARGE" }),
      { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders() } },
    );
  }

  // Rate limiting
  const ip = getClientIp(req);
  const { success, remaining, resetAt } = await rateLimit(
    ip,
    RATE_LIMIT,
    RATE_WINDOW_MS,
  );

  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many requests", code: "RATE_LIMITED" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          ...corsHeaders(),
        },
      },
    );
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

  // Attach rate limit + CORS headers
  const res = new Response(response.body, response);
  res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  for (const [key, value] of Object.entries(corsHeaders())) {
    res.headers.set(key, value);
  }
  return res;
}

export { handler as GET, handler as POST };
