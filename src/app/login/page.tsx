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
    <main className="mx-auto max-w-sm px-5 py-16">
      <div className="rounded-[2px] border border-rule border-b-2 bg-sheet p-6">
        <h1 className="mb-5 border-b border-rule pb-3 text-xl font-bold">Log in</h1>

        {error && (
          <p className="mb-4 rounded-[2px] border-l-[3px] border-stamp bg-stamp/5 px-3 py-2 text-sm text-stamp">
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
            className="w-full rounded-[2px] bg-ink py-2.5 font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Logging in" : "Log in"}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </main>
  );
}