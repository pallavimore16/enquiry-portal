"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setBusy(false);
    if (error) { setError(error.message); return; }

    router.push("/c");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <div className="rounded-2xl border border-rule bg-sheet p-7 shadow-[0_1px_2px_rgba(23,24,28,0.04),0_12px_32px_-16px_rgba(23,24,28,0.14)]">
        <h1 className="mb-1 font-display text-xl font-bold">Create an account</h1>
        <p className="mb-6 border-b border-accent/40 pb-4 text-sm text-ink-soft">
          Needed so sellers can reply to your enquiries.
        </p>

        {error && (
          <p className="mb-4 rounded-lg border-l-[3px] border-reject bg-reject/5 px-3.5 py-2.5 text-sm text-reject">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Your name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <span className="mt-1 block text-xs text-ink-soft">At least 8 characters.</span>
          </label>
          <button
            onClick={handleSignup}
            disabled={busy}
            className="w-full rounded-full bg-ink py-3 font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "Creating" : "Create account"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already registered?{" "}
        <Link href="/login" className="text-accent underline underline-offset-4 hover:text-ink transition-colors">Log in</Link>
      </p>
    </main>
  );
}