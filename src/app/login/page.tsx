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
      setError("Wrong email or password.");   // same message either way, on purpose
      return;
    }

    // Look up the role to decide where to send them.
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", data.user.id).single();

    router.push(profile?.role === "SELLER" || profile?.role === "ADMIN" ? "/seller" : "/c");
    router.refresh();
  }

  const box =
    "w-full rounded border border-slate-300 px-3 py-2 mb-3 " +
    "focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700";

  return (
    <main className="mx-auto max-w-sm px-5 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>

      {error && (
        <p className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <input className={box} type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={box} type="password" placeholder="Password"
        value={password} onChange={(e) => setPassword(e.target.value)} />

      <button
        onClick={handleLogin}
        disabled={busy}
        className="w-full rounded bg-teal-800 py-2.5 font-medium text-white
                   hover:bg-teal-900 disabled:opacity-50"
      >
        {busy ? "Logging in…" : "Log in"}
      </button>

      <p className="mt-5 text-sm text-slate-600">
        New customer?{" "}
        <Link href="/signup" className="text-teal-800 underline">Create an account</Link>
      </p>
    </main>
  );
}