"use client";

import { useState } from "react";
import CategoryCard from "./CategoryCard";

export type CategoryItem = {
  id: number;
  display_name: string;
  url_path: string;
};

export default function CategoryGrid({
  items,
  searchable = true,
}: {
  items: CategoryItem[];
  searchable?: boolean;
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
      {searchable && items.length > 8 && (
        <div className="mb-8 max-w-sm">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${items.length} categories`}
          />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-ink-soft">No entry matches that. Try a shorter word.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c, i) => (
            <CategoryCard key={c.id} name={c.display_name} href={c.url_path} colorIndex={i} />
          ))}
        </div>
      )}
    </>
  );
}