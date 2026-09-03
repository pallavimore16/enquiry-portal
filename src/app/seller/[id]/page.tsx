import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { decide } from "../actions";

export default async function EnquiryDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorMsg } = await searchParams;

  const db = await supabaseServer();

  // If this enquiry belongs to another seller, row-level security returns
  // nothing and we show a 404. That is the ownership check.
  const { data: e } = await db
    .from("enquiries")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();

  if (!e) notFound();

  const { data: cat } = await db
    .from("category_view")
    .select("display_name")
    .eq("id", e.category_id)
    .maybeSingle();

  const rows: [string, string][] = [
    ["Product", cat?.display_name ?? String(e.category_id)],
    ["Name", e.name],
    ["Phone", e.phone],
    ["Email", e.email],
    [
      "Address",
      [e.address_line1, e.address_line2, e.city, e.state, e.pincode]
        .filter(Boolean)
        .join(", "),
    ],
    ["Quantity", String(e.quantity)],
    ["Message", e.message || "—"],
    ["Received", new Date(e.created_at).toLocaleString("en-IN")],
    ["Status", e.status],
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/seller" className="text-sm text-teal-800 underline">
        ← All enquiries
      </Link>

      <h1 className="mb-6 mt-3 text-2xl font-semibold text-slate-900">
        Enquiry #{e.id}
      </h1>

      <dl className="mb-8">
        {rows.map(([k, v]) => (
          <div key={k} className="flex border-b border-slate-200 py-2.5 text-sm">
            <dt className="w-32 shrink-0 text-slate-500">{k}</dt>
            <dd className="text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>

      {errorMsg && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMsg}
        </p>
      )}

      {e.status === "PENDING" ? (
        <form action={decide} className="space-y-3">
          <input type="hidden" name="id" value={e.id} />

          <textarea
            name="note"
            rows={3}
            placeholder="Note (required if rejecting)"
            className="w-full rounded border border-slate-300 px-3 py-2
                       focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />

          <div className="flex gap-3">
            <button
              name="decision"
              value="APPROVED"
              className="rounded bg-green-700 px-5 py-2.5 font-medium text-white hover:bg-green-800"
            >
              Approve
            </button>
            <button
              name="decision"
              value="REJECTED"
              className="rounded bg-red-700 px-5 py-2.5 font-medium text-white hover:bg-red-800"
            >
              Reject
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded border border-slate-300 bg-slate-50 px-4 py-3 text-sm">
          Decided: <strong>{e.status}</strong>
          {e.decision_note && <> — {e.decision_note}</>}
        </p>
      )}
    </main>
  );
}