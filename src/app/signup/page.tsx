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
    <main className="mx-auto max-w-sm px-5 py-16">
      <div className="rounded-[2px] border border-rule border-b-2 bg-sheet p-6">
        <h1 className="mb-1 text-xl font-bold">Create an account</h1>
        <p className="mb-5 border-b border-rule pb-3 text-sm text-ink-soft">
          Needed so sellers can reply to your enquiries.
        </p>

        {error && (
          <p className="mb-4 rounded-[2px] border-l-[3px] border-stamp bg-stamp/5 px-3 py-2 text-sm text-stamp">
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
            className="w-full rounded-[2px] bg-ink py-2.5 font-medium text-paper hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Creating" : "Create account"}
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-ink-soft">
        Already registered?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">Log in</Link>
      </p>
    </main>
  );
}