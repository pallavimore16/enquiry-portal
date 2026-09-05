import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Header() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = data?.role ?? null;
  }

  const link = "text-sm text-slate-600 hover:text-teal-800";

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl items-center gap-5 px-5 py-3">
        <Link href="/c" className="font-semibold text-slate-900">
          Enquiry Portal
        </Link>

        <div className="ml-auto flex items-center gap-5">
          {!user ? (
            <>
              <Link href="/login" className={link}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-teal-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-900"
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              {(role === "SELLER" || role === "ADMIN") && (
                <Link href="/seller" className={link}>
                  Enquiries
                </Link>
              )}
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <button className={link}>Log out</button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}