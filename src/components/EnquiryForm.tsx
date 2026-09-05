"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function EnquiryForm({ categoryId }: { categoryId: number }) {
  const [f, setF] = useState({
    name: "", phone: "", email: "",
    address_line1: "", address_line2: "",
    city: "", state: "", pincode: "",
    quantity: "1", message: "",
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user?.email) setF((p) => ({ ...p, email: data.user!.email! }));
    });
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit() {
    setError("");
    if (f.name.trim().length < 2) return setError("Enter your name.");
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setError("Enter a 10-digit mobile number.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setError("Enter a valid email.");
    if (f.address_line1.trim().length < 5) return setError("Enter your address.");
    if (!f.city.trim()) return setError("Enter your city.");
    if (!f.state.trim()) return setError("Enter your state.");
    if (!/^[1-9]\d{5}$/.test(f.pincode)) return setError("Enter a 6-digit PIN code.");
    if (!consent) return setError("Tick the box to share your details with the seller.");

    setBusy(true);
    const supabase = supabaseBrowser();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); setLoggedIn(false); return; }

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        category_id: categoryId,
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim().toLowerCase(),
        address_line1: f.address_line1.trim(),
        address_line2: f.address_line2.trim() || null,
        city: f.city.trim(),
        state: f.state.trim(),
        pincode: f.pincode.trim(),
        quantity: Number(f.quantity) || 1,
        message: f.message.trim() || null,
      })
      .select("id")
      .single();

    setBusy(false);
    if (error) {
      setError(
        error.message.includes("Rate limit")
          ? "You have sent 3 enquiries in the last hour. Try again later."
          : "Could not send: " + error.message
      );
      return;
    }
    setDone(data.id);
  }

  if (loggedIn === null) {
    return <p className="text-sm text-ink-soft">Loading.</p>;
  }

  if (loggedIn === false) {
    return (
      <div className="max-w-lg rounded-[2px] border border-rule border-b-2 bg-sheet p-6">
        <h2 className="text-lg font-semibold">Log in to send an enquiry</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          Sellers reply by email, so we need an account to send their answer to.
        </p>
        <div className="mt-5 flex gap-3">
          <Link href="/login"
            className="rounded-[2px] bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90">
            Log in
          </Link>
          <Link href="/signup"
            className="rounded-[2px] border border-ink px-4 py-2 text-sm font-medium hover:bg-paper">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (done !== null) {
    return (
      <div className="max-w-lg rounded-[2px] border border-rule border-b-2 bg-sheet p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Enquiry sent</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Keep this number for your records. A seller will reply by email.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-4 font-display text-2xl font-bold tabular-nums">
          No. {String(done).padStart(6, "0")}
        </p>
      </div>
    );
  }

  const fields: [keyof typeof f, string, string][] = [
    ["name", "Full name", "text"],
    ["phone", "Mobile number", "tel"],
    ["email", "Email", "email"],
    ["address_line1", "Address", "text"],
    ["address_line2", "Address line 2 (optional)", "text"],
    ["city", "City", "text"],
    ["state", "State", "text"],
    ["pincode", "PIN code", "text"],
    ["quantity", "Quantity", "number"],
  ];

  return (
    /* One column, capped near 34rem — a form is read, not scanned. */
    <div className="max-w-[34rem] rounded-[2px] border border-rule border-b-2 bg-sheet p-6">
      <h2 className="mb-5 border-b border-rule pb-3 text-lg font-semibold">
        Send an enquiry
      </h2>

      {error && (
        <p className="mb-4 rounded-[2px] border-l-[3px] border-stamp bg-stamp/5 px-3 py-2 text-sm text-stamp">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {fields.map(([key, label, type]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1 block font-medium">{label}</span>
            <input type={type} value={f[key]} onChange={set(key)} />
          </label>
        ))}

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Message (optional)</span>
          <textarea rows={4} value={f.message} onChange={set("message")} />
        </label>

        <label className="flex gap-2.5 border-t border-rule pt-4 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#1b2a4a]"
          />
          <span>
            Share my name, address and phone number with the seller for this enquiry.
            Kept for up to 2 years.
          </span>
        </label>

        <button
          onClick={submit}
          disabled={busy}
          className="w-full rounded-[2px] bg-ink py-2.5 font-medium text-paper hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Sending" : "Send enquiry"}
        </button>
      </div>
    </div>
  );
}