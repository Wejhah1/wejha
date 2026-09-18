import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS and can call the Auth Admin API
// (creating users with a password directly, no email sent). Only ever
// import this from server actions (admin creation) — the key is a
// non-NEXT_PUBLIC_ env var, so Next.js already strips it from client bundles.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
