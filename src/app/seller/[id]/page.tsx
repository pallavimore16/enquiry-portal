import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import Stamp from "@/components/Stamp";
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

  // Another seller's enquiry returns nothing under RLS, so this 404s.
  const { data: e } = await db
    .from("enquiries").select("*").eq("id", Number(id)).maybeSingle();

  if (!e) notFound();

  const { data: { user } } = await db.auth.getUser();
  const { data: me } = await db
    .from("profiles").select("role").eq("id", user!.id).maybeSingle();

  const canDecide = me?.role === "SELLER" || me?.role === "ADMIN";

  const { data: cat } = await db
    .from("category_view").select("display_name").eq("id", e.category_id).maybeSingle();

  const rows: [string, string][] = [
    ["Product", cat?.display_name ?? String(e.category_id)],
    ["Name", e.name],
    ["Phone", e.phone],
    ["Email", e.email],
    ["Address", [e.address_line1, e.address_line2, e.city, e.state, e.pincode]
      .filter(Boolean).join(", ")],
    ["Quantity", String(e.quantity)],
    ["Message", e.message || "None"],
    ["Received", new Date(e.created_at).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })],
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link
        href={canDecide ? "/seller" : "/c"}
        className="text-sm text-ink-soft hover:text-ink"
      >
        {canDecide ? "Back to enquiries" : "Back to catalogue"}
      </Link>

      {/* The sheet: a document with a stamp in the corner. */}
      <article className="mt-4 rounded-[2px] border border-rule border-b-2 bg-sheet">
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">Enquiry</h1>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">
              No. {String(e.id).padStart(6, "0")}
            </p>
          </div>
          <div className="pt-2">
            <Stamp status={e.status} />
          </div>
        </header>

        <dl className="px-6 py-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-rule py-3 text-sm last:border-0">
              <dt className="w-28 shrink-0 text-ink-soft">{k}</dt>
              <dd className="flex-1">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-rule bg-paper px-6 py-5">
          {errorMsg && (
            <p className="mb-4 rounded-[2px] border-l-[3px] border-stamp bg-stamp/5 px-3 py-2 text-sm text-stamp">
              {errorMsg}
            </p>
          )}

          {e.status === "PENDING" && canDecide ? (
            <form action={decide} className="space-y-3">
              <input type="hidden" name="id" value={e.id} />
              <label className="block text-sm">
                <span className="mb-1 block font-medium">
                  Note to the customer
                </span>
                <textarea name="note" rows={3} placeholder="Required when rejecting" />
              </label>
              <div className="flex gap-3">
                <button
                  name="decision" value="APPROVED"
                  className="rounded-[2px] bg-approve px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Approve
                </button>
                <button
                  name="decision" value="REJECTED"
                  className="rounded-[2px] border border-stamp px-5 py-2.5 text-sm font-medium text-stamp hover:bg-stamp/5"
                >
                  Reject
                </button>
              </div>
            </form>
          ) : e.status === "PENDING" ? (
            <p className="text-sm text-ink-soft">
              Waiting for the seller. You will get an email when they reply.
            </p>
          ) : (
            <p className="text-sm text-ink-soft">
              {e.decision_note
                ? `Note from the seller: ${e.decision_note}`
                : "No note was left."}
            </p>
          )}
        </div>
      </article>
    </main>
  );
}