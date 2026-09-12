import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ChildList from "@/components/ChildList";
import CategoryGrid from "@/components/CategoryGrid";
import EnquiryForm from "@/components/EnquiryForm";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  if (segments.length > 3 || !segments.every((s) => /^\d{3}$/.test(s))) notFound();

  const db = await supabaseServer();

  /* ---------- /c : the whole catalogue ---------- */
  if (segments.length === 0) {
    const { data } = await db
      .from("category_view")
      .select("id, display_name, url_path")
      .eq("level", 1)
      .eq("is_active", true)
      .order("sort_order");

    return (
      <main className="mx-auto max-w-5xl px-5 py-14">
        <header className="mb-11 max-w-xl">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-accent">
            The Catalogue
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight">Browse by category</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
            Pick a category, narrow it down, then send your requirement to a seller.
            You will get a reply by email.
          </p>
        </header>
        <CategoryGrid items={data ?? []} />
      </main>
    );
  }

  /* ---------- /c/017 , /c/017/001 , /c/017/001/043 ---------- */
  const [a, b, c] = segments;
  const id = Number(a) * 1_000_000 + Number(b ?? 0) * 1_000 + Number(c ?? 0);

  const { data: node } = await db
    .from("category_view").select("*").eq("id", id).maybeSingle();

  if (!node || !node.is_active) notFound();

  const { data: crumbs } = await db.rpc("breadcrumb", { p_id: id });

  let children: Parameters<typeof ChildList>[0]["items"] = [];
  if (node.level < 3) {
    const { data } = await db
      .from("category_view")
      .select("id, display_name, url_path, price_label, feature_label")
      .eq("parent_id", id)
      .eq("is_active", true)
      .order("sort_order");
    children = data ?? [];
  }

  const trail = crumbs ?? [];

  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      <nav className="mb-7 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
        <Link href="/c" className="hover:text-accent transition-colors">Catalogue</Link>
        {trail.map((x: { id: number; display_name: string; url_path: string }) => (
          <span key={x.id} className="flex items-center gap-x-2">
            <span className="text-accent/60">/</span>
            <Link href={x.url_path} className="hover:text-accent transition-colors">{x.display_name}</Link>
          </span>
        ))}
      </nav>

      {node.level === 3 ? (
        <>
          <header className="mb-9 border-b border-accent/40 pb-5">
            <h1 className="font-display text-3xl font-bold tracking-tight">{trail[1]?.display_name}</h1>
            <p className="mt-2 text-sm text-ink-soft">
              {node.price_label} &nbsp;·&nbsp; {node.feature_label}
            </p>
          </header>
          <EnquiryForm categoryId={node.id} />
        </>
      ) : (
        <>
          <header className="mb-9 flex items-baseline gap-4 border-b border-accent/40 pb-4">
            <h1 className="font-display text-3xl font-bold tracking-tight">{node.display_name}</h1>
            <span className="ml-auto text-xs tabular-nums text-ink-soft">
              {children.length} entries
            </span>
          </header>
          <ChildList items={children} groupByPrice={node.level === 2} />
        </>
      )}
    </main>
  );
}