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
    <main className="mx-auto max-w-2xl px-5 py-14">
      <Link
        href={canDecide ? "/seller" : "/c"}
        className="text-sm text-ink-soft hover:text-accent transition-colors"
      >
        {canDecide ? "← Back to enquiries" : "← Back to catalogue"}
      </Link>

      {/* The sheet: a document with a seal in the corner. */}
      <article className="mt-5 rounded-2xl border border-rule bg-sheet shadow-[0_1px_2px_rgba(36,17,40,0.05),0_12px_32px_-16px_rgba(173,86,196,0.22)]">
        <header className="flex items-start justify-between gap-6 border-b border-accent/40 px-7 py-6">
          <div>
            <h1 className="font-display text-xl font-bold">Enquiry</h1>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-accent">
              No. {String(e.id).padStart(6, "0")}
            </p>
          </div>
          <div className="pt-1.5">
            <Stamp status={e.status} />
          </div>
        </header>

        <dl className="px-7 py-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-rule py-3.5 text-sm last:border-0">
              <dt className="w-28 shrink-0 text-ink-soft">{k}</dt>
              <dd className="flex-1">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-b-2xl border-t border-rule bg-paper/60 px-7 py-6">
          {errorMsg && (
            <p className="mb-4 rounded-lg border-l-[3px] border-reject bg-reject/5 px-3.5 py-2.5 text-sm text-reject">
              {errorMsg}
            </p>
          )}

          {e.status === "PENDING" && canDecide ? (
            <form action={decide} className="space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">
                  Note to the customer
                </span>
                <textarea name="note" rows={3} placeholder="Required when rejecting" />
              </label>
              <div className="flex gap-3">
                <button
                  name="decision" value="APPROVED"
                  className="rounded-full bg-approve px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Approve
                </button>
                <button
                  name="decision" value="REJECTED"
                  className="rounded-full border border-reject px-6 py-2.5 text-sm font-medium text-reject transition-colors hover:bg-reject/5"
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