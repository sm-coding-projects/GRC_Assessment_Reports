/**
 * Validate a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with a single slash.
 */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
