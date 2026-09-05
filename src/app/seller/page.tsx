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
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="mb-6 text-2xl font-bold">Enquiries</h1>

      {/* Tabs as a file divider: the open one connects to the sheet below it. */}
      <div className="flex gap-1 border-b-2 border-ink">
        {tabs.map(([key, label]) => (
          <Link
            key={key}
            href={`/seller?status=${key}`}
            className={`-mb-[2px] border-2 px-4 py-2 text-sm ${
              key === status
                ? "border-ink border-b-paper bg-paper font-medium"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!rows?.length ? (
        <p className="pt-8 text-sm text-ink-soft">{empty[status] ?? empty.PENDING}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-xs text-ink-soft">
              <th className="py-2 font-medium">No.</th>
              <th className="font-medium">Received</th>
              <th className="font-medium">City</th>
              <th className="text-right font-medium">Qty</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-rule hover:bg-sheet">
                <td className="py-3 tabular-nums">
                  {String(r.id).padStart(6, "0")}
                </td>
                <td className="text-ink-soft">
                  {new Date(r.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
                <td className="text-ink-soft">{r.city}</td>
                <td className="text-right tabular-nums">{r.quantity}</td>
                <td className="py-3 text-right">
                  <Link href={`/seller/${r.id}`} className="font-medium underline underline-offset-4">
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