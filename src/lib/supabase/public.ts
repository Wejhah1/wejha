import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cookie-less anon client for public, published data. Reading cookies (as the
// server client does) forces every page to render per request; without them
// public pages can be statically cached and revalidated (ISR).
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
