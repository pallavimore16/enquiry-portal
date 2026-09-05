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

/* An index, not a grid of cards: name on the left, leader dots across to the
   right margin. The dots carry the eye across; they are structure, not decoration. */
function Row({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="group flex items-baseline gap-2 py-2 text-[0.9375rem]">
      <span className="text-ink-soft transition-colors group-hover:text-ink">{label}</span>
      <span className="mb-[0.3em] flex-1 border-b border-dotted border-rule" />
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
        <div className="mb-7 max-w-sm">
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
        <div className="space-y-9">
          {group(shown).map(([price, rows]) => (
            <section key={price}>
              <h2 className="mb-1 flex items-baseline gap-3 border-b-2 border-ink pb-1">
                <span className="font-display text-base font-semibold">{price}</span>
                <span className="ml-auto text-xs tabular-nums text-ink-soft">
                  {rows.length}
                </span>
              </h2>
              <div className="columns-1 sm:columns-2 sm:gap-x-10 lg:columns-3">
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
        <div className="columns-1 sm:columns-2 sm:gap-x-10 lg:columns-3">
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