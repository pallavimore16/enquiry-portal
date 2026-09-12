import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function SellerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "PENDING" } = await searchParams;
  const db = await supabaseServer();

  // No "where seller_id = me". Row-level security adds it in the database.
  const { data: rows } = await db
    .from("enquiries")
    .select("id, created_at, city, quantity, status, category_id")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  const tabs = [
    ["PENDING", "Pending"],
    ["APPROVED", "Approved"],
    ["REJECTED", "Rejected"],
  ];

  const empty: Record<string, string> = {
    PENDING: "No enquiries waiting. New ones appear here as they arrive.",
    APPROVED: "Nothing approved yet.",
    REJECTED: "Nothing rejected yet.",
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-accent">
        Seller
      </p>
      <h1 className="mb-7 font-display text-3xl font-bold tracking-tight">Enquiries</h1>

      {/* An understated underline tab, not a filing divider. */}
      <div className="flex gap-7 border-b border-rule">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/seller?status=${key}`}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm transition-colors ${
              key === status
                ? "border-accent font-medium text-ink"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!rows?.length ? (
        <p className="pt-9 text-sm text-ink-soft">{empty[status] ?? empty.PENDING}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs text-ink-soft">
              <th className="py-3 font-medium">No.</th>
              <th className="font-medium">Received</th>
              <th className="font-medium">City</th>
              <th className="text-right font-medium">Qty</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-rule transition-colors hover:bg-accent-soft/40">
                <td className="py-3.5 tabular-nums">
                  {String(r.id).padStart(6, "0")}
                </td>
                <td className="text-ink-soft">
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
                <td className="text-ink-soft">{r.city}</td>
                <td className="text-right tabular-nums">{r.quantity}</td>
                <td className="py-3.5 text-right">
                  <Link href={`/seller/${r.id}`} className="font-medium text-accent underline underline-offset-4 hover:text-ink transition-colors">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}