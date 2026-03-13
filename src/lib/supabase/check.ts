/**
 * Returns true only when real (non-placeholder) Supabase credentials are set.
 * Used by middleware, tRPC context, and auth-check to skip Supabase calls
 * when running locally without Supabase.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  // Reject obvious placeholders left over from .env.example
  const placeholders = ["your-anon-key", "your-service-role-key"];
  if (placeholders.includes(key)) return false;

  return true;
}
