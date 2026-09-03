import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ChildList from "@/components/ChildList";
import EnquiryForm from "@/components/EnquiryForm";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;

  if (segments.length > 3 || !segments.every((s) => /^\d{3}$/.test(s))) notFound();

  const db = await supabaseServer();

  // ---------- /c : the 100 main categories ----------
  if (segments.length === 0) {
    const { data } = await db
      .from("category_view")
      .select("id, display_name, url_path")
      .eq("level", 1)
      .eq("is_active", true)
      .order("sort_order");

    return (
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Browse categories</h1>
        <ChildList items={data ?? []} />
      </main>
    );
  }

  // ---------- /c/017 , /c/017/001 , /c/017/001/043 ----------
  const [a, b, c] = segments;
  const id =
    Number(a) * 1_000_000 + Number(b ?? 0) * 1_000 + Number(c ?? 0);

  const { data: node } = await db
    .from("category_view").select("*").eq("id", id).maybeSingle();

  if (!node || !node.is_active) notFound();

  const { data: crumbs } = await db.rpc("breadcrumb", { p_id: id });

  let children: any[] = [];
  if (node.level < 3) {
    const { data } = await db
      .from("category_view")
      .select("id, display_name, url_path, price_label, feature_label")
      .eq("parent_id", id)
      .eq("is_active", true)
      .order("sort_order");
    children = data ?? [];
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/c" className="hover:text-teal-800">All categories</Link>
        {(crumbs ?? []).map((x: any) => (
          <span key={x.id}>
            <span className="px-2 text-slate-300">/</span>
            <Link href={x.url_path} className="hover:text-teal-800">{x.display_name}</Link>
          </span>
        ))}
      </nav>

      {node.level === 3 ? (
        <>
          <h1 className="text-2xl font-semibold text-slate-900">
            {crumbs?.[1]?.display_name}
          </h1>
          <p className="mb-6 mt-1 text-slate-600">
            {node.price_label} · {node.feature_label}
          </p>
          <EnquiryForm categoryId={node.id} />
        </>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-semibold text-slate-900">{node.display_name}</h1>
          <ChildList items={children} groupByPrice={node.level === 2} />
        </>
      )}
    </main>
  );
}