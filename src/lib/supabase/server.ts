import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside pages (which run on the server)
export async function supabaseServer() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Pages can't set cookies. The middleware below does it instead.
          }
        },
      },
    }
  );
}