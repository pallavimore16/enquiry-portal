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

/* An index, not a grid of cards: name on the left, an accent leader line
   drawing the eye across to a small arrow at the margin — the way a
   fine restaurant menu sets its courses against their prices. */
function Row({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="group flex items-baseline gap-3 py-2.5 text-[0.9375rem]">
      <span className="font-display text-ink-soft transition-colors group-hover:text-ink">
        {label}
      </span>
      <span className="mb-[0.3em] flex-1 border-b border-dotted border-rule transition-colors group-hover:border-accent" />
      <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">→</span>
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
        <div className="space-y-10">
          {group(shown).map(([price, rows]) => (
            <section key={price}>
              <h2 className="mb-2 flex items-baseline gap-3 border-b border-accent/50 pb-2">
                <span className="font-display text-base font-semibold tracking-tight">{price}</span>
                <span className="ml-auto font-sans text-xs tabular-nums text-ink-soft">
                  {rows.length}
                </span>
              </h2>
              <div className="columns-1 sm:columns-2 sm:gap-x-12 lg:columns-3">
                {rows.map((c) => (
                  <div key={c.id} className="break-inside-avoid">
                    <Row label={c.feature_label ?? c.display_name} href={c.url_path} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 sm:gap-x-12 lg:columns-3">
          {shown.map((c) => (
            <div key={c.id} className="break-inside-avoid">
              <Row label={c.display_name} href={c.url_path} />
            </div>
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