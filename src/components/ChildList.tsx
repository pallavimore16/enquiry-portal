"use client";

import { useState } from "react";
import Link from "next/link";

export type Item = {
  id: number;
  display_name: string;
  url_path: string;
  price_label?: string | null;
  feature_label?: string | null;
};

/* A tag, not a line in an index — short labels read better as something
   you pick up and tap than as an entry in a ledger. */
function Chip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-rule bg-sheet px-4 py-2
                 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      {label}
    </Link>
  );
}

export default function ChildList({
  items,
  groupByPrice = false,
}: {
  items: Item[];
  groupByPrice?: boolean;
}) {
  const [q, setQ] = useState("");

  const shown = q
    ? items.filter((i) => i.display_name.toLowerCase().includes(q.toLowerCase()))
    : items;

  if (items.length === 0) {
    return <p className="text-sm text-ink-soft">Nothing listed here yet.</p>;
  }

  return (
    <>
      {items.length > 20 && (
        <div className="mb-8 max-w-sm">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${items.length} entries`}
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-ink-soft">No entry matches that. Try a shorter word.</p>
      ) : groupByPrice && !q ? (
        <div className="space-y-8">
          {group(shown).map(([price, rows]) => (
            <section key={price}>
              <h2 className="mb-3 flex items-baseline gap-3">
                <span className="font-display text-base font-semibold tracking-tight">{price}</span>
                <span className="h-px flex-1 bg-rule" />
                <span className="font-sans text-xs tabular-nums text-ink-soft">{rows.length}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {rows.map((c) => (
                  <Chip key={c.id} label={c.feature_label ?? c.display_name} href={c.url_path} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {shown.map((c) => (
            <Chip key={c.id} label={c.display_name} href={c.url_path} />
          ))}
        </div>
      )}
    </>
  );
}

function group(items: Item[]): [string, Item[]][] {
  const map = new Map<string, Item[]>();
  for (const i of items) {
    const key = i.price_label ?? "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(i);
  }
  return [...map.entries()];
}