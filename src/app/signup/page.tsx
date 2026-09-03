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
      setError("Password must be at least 8 characters.");
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
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/c");
    router.refresh();
  }

  const box =
    "w-full rounded border border-slate-300 px-3 py-2 mb-3 " +
    "focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700";

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Create an account</h1>

      {error && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <input className={box} placeholder="Your name"
        value={name} onChange={(e) => setName(e.target.value)} />
      <input className={box} type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={box} type="password" placeholder="Password (8+ characters)"
        value={password} onChange={(e) => setPassword(e.target.value)} />

      <button
        onClick={handleSignup}
        disabled={busy}
        className="w-full rounded bg-teal-800 py-2.5 font-medium text-white
                   hover:bg-teal-900 disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create account"}
      </button>

      <p className="mt-5 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-800 underline">Log in</Link>
      </p>
    </main>
  );
}