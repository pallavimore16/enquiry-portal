import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function SellerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "PENDING" } = await searchParams;
  const db = await supabaseServer();

  // No "where seller_id = me" here. Row-level security adds it in the database.
  const { data: rows } = await db
    .from("enquiries")
    .select("id, created_at, city, quantity, status, category_id")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  const tabs = ["PENDING", "APPROVED", "REJECTED"];

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Enquiries</h1>

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/seller?status=${t}`}
            className={`rounded px-3 py-1.5 text-sm ${
              t === status ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {t[0] + t.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {!rows?.length ? (
        <p className="text-slate-500">Nothing here.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b-2 border-slate-800 text-left">
            <tr>
              <th className="py-2">Ref</th>
              <th>Date</th>
              <th>City</th>
              <th className="text-right">Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-200">
                <td className="py-2.5">#{r.id}</td>
                <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                <td>{r.city}</td>
                <td className="text-right tabular-nums">{r.quantity}</td>
                <td className="text-right">
                  <Link href={`/seller/${r.id}`} className="text-teal-800 underline">
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