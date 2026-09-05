import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Header() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await db
      .from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
  }

  const quiet = "text-sm text-ink-soft hover:text-ink";

  return (
    /* Double rule under the letterhead, the way a form separates its header. */
    <header className="border-b-[3px] border-double border-ink bg-sheet">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-3">
        <Link href="/c" className="font-display text-lg font-bold tracking-tight">
          Enquiry Portal
        </Link>

        <div className="ml-auto flex items-center gap-5">
          {!user ? (
            <>
              <Link href="/login" className={quiet}>Log in</Link>
              <Link
                href="/signup"
                className="rounded-[2px] bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:opacity-90"
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              {(role === "SELLER" || role === "ADMIN") && (
                <Link href="/seller" className={quiet}>Enquiries</Link>
              )}
              <span className="hidden text-sm text-ink-soft sm:inline">{user.email}</span>
              <form action={signOut}>
                <button className={quiet}>Log out</button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}