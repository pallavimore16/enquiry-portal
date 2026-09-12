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

  const quiet = "text-sm text-ink-soft hover:text-ink transition-colors";

  return (
    /* A single hairline in the accent colour, not a thick ink rule — restraint reads
       as expensive; a heavy border reads as a form. */
    <header className="sticky top-0 z-30 border-b border-accent/40 bg-sheet/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-5 py-4">
        <Link href="/c" className="group flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover:scale-125" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Enquiry Portal
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          {!user ? (
            <>
              <Link href="/login" className={quiet}>Log in</Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-85"
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