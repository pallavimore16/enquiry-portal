import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import CategoryGrid from "@/components/CategoryGrid";
import HomeAuthPanel from "@/components/HomeAuthPanel";

export default async function HomePage() {
  const db = await supabaseServer();

  const { data: categories } = await db
    .from("category_view")
    .select("id, display_name, url_path")
    .eq("level", 1)
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main>
      {/* ---------- Split top: headline left, login/signup right ---------- */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-5 py-14 sm:grid-cols-5 sm:py-20">
          <div className="sm:col-span-3">
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-ink-soft">
              A considered way to source
            </p>
            <h1 className="max-w-md font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
              Find the right seller, without the noise.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
              Browse the catalogue, send your requirement, and hear back
              directly from the seller it&apos;s assigned to.
            </p>
          </div>

          <div className="flex justify-center sm:col-span-2 sm:justify-end">
            <HomeAuthPanel />
          </div>
        </div>
      </section>

      {/* ---------- Categories, packed like bricks ---------- */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight">Browse by category</h2>
          <Link
            href="/c"
            className="shrink-0 text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink transition-colors"
          >
            Full catalogue →
          </Link>
        </div>
        <CategoryGrid items={categories ?? []} />
      </section>
    </main>
  );
}