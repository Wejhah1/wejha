import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Keeps admin sessions alive. Supabase access tokens expire after about an
// hour and Server Components can't write cookies, so without this the refresh
// never persists and admins get bounced to the login page. Scoped to admin
// routes so public pages stay statically cached.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser() validates the session and refreshes it when the access token has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already signed in: skip the login form. Only for real admins — the admin
  // layout sends signed-in non-admins here, and redirecting them back would loop.
  if (user && request.nextUrl.pathname === "/admin/login") {
    const { data: admin } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
    if (!admin) return response;

    const redirect = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
