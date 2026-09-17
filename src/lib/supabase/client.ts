import { createBrowserClient } from "@supabase/ssr";

// Hand-maintained row types (see src/lib/types.ts) are used for casting query
// results instead of the Database generic — the schema is small enough that
// generated types aren't worth the build step for v1.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
