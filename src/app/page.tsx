import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryGrid from "@/components/CategoryGrid";

export default async function HomePage() {
  const db = await supabaseServer();

  const { data: categories } = await db
    .from("category_view")
    .select("id, display_name, url_path")
    .eq("level", 1)
    .eq("is_active", true)
    .order("sort_order")
    .limit(6);

  const { count: totalCategories } = await db
    .from("category_view")
    .select("id", { count: "exact", head: true })
    .eq("level", 1)
    .eq("is_active", true);

  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden border-b border-accent/30">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <p className="mb-5 font-sans text-xs uppercase tracking-[0.24em] text-accent">
            A considered way to source
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Find the right seller,
            <br />
            <span className="italic text-accent">without the noise.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-ink-soft">
            Browse a carefully organised catalogue, tell us exactly what you need,
            and hear back directly from the seller assigned to it — no bidding,
            no middlemen, no clutter.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/c"
              className="bg-brand-gradient rounded-full px-7 py-3.5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(173,86,196,0.6)] transition-transform hover:-translate-y-0.5"
            >
              Explore the catalogue
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-ink/20 px-7 py-3.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* A single oversized display character, faint, behind the copy — a
            quiet flourish rather than an illustration we don't have. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 select-none font-display text-[22rem]
                     font-bold italic leading-none text-accent/[0.06] sm:text-[28rem]"
        >
          §
        </span>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {[
            ["01", "Browse", "Narrow down from category to the exact specification you need.", "text-coral"],
            ["02", "Enquire", "Share your requirement once — name, contact, and a short note.", "text-orchid"],
            ["03", "Hear back", "The seller assigned to it reviews and replies directly to you.", "text-accent"],
          ].map(([n, title, body, color]) => (
            <div key={n}>
              <p className={`font-display text-sm font-semibold ${color}`}>{n}</p>
              <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Featured categories ---------- */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-accent/40 pb-5">
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-accent">
              The catalogue
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Start with a category
            </h2>
          </div>
          {typeof totalCategories === "number" && totalCategories > 6 && (
            <Link
              href="/c"
              className="shrink-0 text-sm font-medium text-accent underline underline-offset-4 hover:text-ink transition-colors"
            >
              View all {totalCategories} →
            </Link>
          )}
        </div>
        <CategoryGrid items={categories ?? []} searchable={false} />
      </section>
    </main>
  );
}