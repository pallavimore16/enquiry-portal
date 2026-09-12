"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError("");
    setBusy(true);

    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setBusy(false);
      setError("That email and password do not match.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", data.user.id).single();

    router.push(profile?.role === "SELLER" || profile?.role === "ADMIN" ? "/seller" : "/c");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <div className="rounded-2xl border border-rule bg-sheet p-7 shadow-[0_1px_2px_rgba(36,17,40,0.05),0_12px_32px_-16px_rgba(173,86,196,0.22)]">
        <h1 className="mb-6 border-b border-accent/40 pb-4 font-display text-xl font-bold">Log in</h1>

        {error && (
          <p className="mb-4 rounded-lg border-l-[3px] border-reject bg-reject/5 px-3.5 py-2.5 text-sm text-reject">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button
            onClick={handleLogin}
            disabled={busy}
            className="w-full rounded-full bg-ink py-3 font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Logging in" : "Log in"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="text-accent underline underline-offset-4 hover:text-ink transition-colors">
          Create an account
        </Link>
      </p>
    </main>
  );
}