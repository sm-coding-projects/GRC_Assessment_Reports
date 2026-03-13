import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // nonce + strict-dynamic for modern browsers; unsafe-inline fallback for older ones.
    // Browsers that support nonces ignore 'unsafe-inline' automatically.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'wasm-unsafe-eval'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' blob: data: https://*.supabase.co https://lh3.googleusercontent.com",
    `connect-src 'self' data: https://*.supabase.co ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  // Generate a per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Pass the nonce as a request header so server components can read it
  const extraHeaders = new Headers();
  extraHeaders.set("x-nonce", nonce);

  const response = await updateSession(request, extraHeaders);

  // Don't add CSP to redirects
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - static assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
