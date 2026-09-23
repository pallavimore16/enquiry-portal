"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function HomeAuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    <div className="w-full max-w-sm rounded-2xl border border-rule bg-sheet p-7 shadow-[0_1px_2px_rgba(23,24,28,0.04),0_12px_32px_-16px_rgba(23,24,28,0.14)]">
      <div className="mb-6 flex gap-1 border-b border-rule pb-4 text-sm font-semibold">
        <button
          onClick={() => { setMode("login"); setError(""); }}
          className={mode === "login" ? "text-ink" : "text-ink-soft"}
        >
          Log in
        </button>
        <span className="text-rule">·</span>
        <button
          onClick={() => { setMode("signup"); setError(""); }}
          className={mode === "signup" ? "text-ink" : "text-ink-soft"}
        >
          Sign up
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border-l-[3px] border-reject bg-reject/5 px-3.5 py-2.5 text-sm text-reject">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {mode === "signup" && (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Your name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "signup" && (
            <span className="mt-1 block text-xs text-ink-soft">At least 8 characters.</span>
          )}
        </label>

        <button
          onClick={mode === "login" ? handleLogin : handleSignup}
          disabled={busy}
          className="w-full rounded-full bg-ink py-3 font-medium text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {busy ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </div>
    </div>
  );
}