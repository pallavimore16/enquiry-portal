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

  const link = "block py-2.5 text-slate-700 hover:text-teal-800";
  const row = "border-b border-slate-200";

  return (
    <>
      {items.length > 20 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${items.length} items`}
          className="mb-6 w-full max-w-sm rounded border border-slate-300 px-3 py-2
                     focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
        />
      )}

      {shown.length === 0 && (
        <p className="text-slate-500">Nothing matches. Try a shorter word.</p>
      )}

      {/* Level 2: 100 children = 10 price bands x 10 features. Group them or
          it is an unreadable wall of near-identical lines. */}
      {groupByPrice && !q ? (
        <div className="space-y-8">
          {groupItems(shown).map(([price, group]) => (
            <section key={price}>
              <h2 className="mb-2 border-b-2 border-slate-800 pb-1 font-semibold text-slate-900">
                {price}
              </h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((c) => (
                  <li key={c.id} className={row}>
                    <Link href={c.url_path} className={link}>
                      {c.feature_label ?? c.display_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <li key={c.id} className={row}>
              <Link href={c.url_path} className={link}>{c.display_name}</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function groupItems(items: Item[]): [string, Item[]][] {
  const map = new Map<string, Item[]>();
  for (const i of items) {
    const key = i.price_label ?? "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(i);
  }
  return [...map.entries()];
}