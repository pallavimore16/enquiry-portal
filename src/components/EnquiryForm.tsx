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

  // Check login on load, and pre-fill the email so they don't retype it.
  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user?.email) {
        setF((prev) => ({ ...prev, email: data.user!.email! }));
      }
    });
  }, []);

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function submit() {
    setError("");

    // Friendly checks first. The database checks again — this is only for the messages.
    if (f.name.trim().length < 2) return setError("Enter your name.");
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setError("Enter a 10-digit mobile number.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setError("Enter a valid email.");
    if (f.address_line1.trim().length < 5) return setError("Enter your address.");
    if (!f.city.trim()) return setError("Enter your city.");
    if (!f.state.trim()) return setError("Enter your state.");
    if (!/^[1-9]\d{5}$/.test(f.pincode)) return setError("Enter a 6-digit PIN code.");
    if (!consent) return setError("Please tick the consent box.");

    setBusy(true);
    const supabase = supabaseBrowser();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setLoggedIn(false);
      return;
    }

    // We only send the details. customer_id, root_category_id and status are
    // filled in by the database trigger — the browser is not trusted with them.
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
          ? "You have sent 3 enquiries in the last hour. Please try later."
          : "Could not send: " + error.message
      );
      return;
    }
    setDone(data.id);
  }

  // ---- still checking ----
  if (loggedIn === null) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  // ---- not logged in ----
  if (loggedIn === false) {
    return (
      <div className="max-w-lg rounded border border-slate-300 bg-slate-50 p-5">
        <h2 className="font-semibold text-slate-900">Log in to send an enquiry</h2>
        <p className="mt-1 text-sm text-slate-600">
          You need an account so the seller can respond to you.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/login"
            className="rounded bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  // ---- sent ----
  if (done !== null) {
    return (
      <div className="max-w-lg rounded border border-teal-700 bg-teal-50 p-5">
        <h2 className="font-semibold text-teal-900">Enquiry sent</h2>
        <p className="mt-1 text-sm text-teal-800">
          Your reference number is <strong>#{done}</strong>. A seller will respond by email.
        </p>
      </div>
    );
  }

  const box =
    "w-full rounded border border-slate-300 px-3 py-2 " +
    "focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700";

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
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Send an enquiry</h2>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {fields.map(([key, label, type]) => (
        <label key={key} className="block text-sm">
          <span className="mb-1 block text-slate-700">{label}</span>
          <input className={box} type={type} value={f[key]} onChange={set(key)} />
        </label>
      ))}

      <label className="block text-sm">
        <span className="mb-1 block text-slate-700">Message (optional)</span>
        <textarea className={box} rows={4} value={f.message} onChange={set("message")} />
      </label>

      <label className="flex gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={consent}
          onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>
          I agree that my name, address and phone number will be shared with the seller for
          this enquiry, and kept for up to 2 years.
        </span>
      </label>

      <button
        onClick={submit}
        disabled={busy}
        className="rounded bg-teal-800 px-5 py-2.5 font-medium text-white
                   hover:bg-teal-900 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send enquiry"}
      </button>
    </div>
  );
}