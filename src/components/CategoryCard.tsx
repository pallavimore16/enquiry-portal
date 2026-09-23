"use client";

import { useState } from "react";
import Link from "next/link";

/* A brick: small, rectangular, tightly packed. Sits inside a masonry
   column (see CategoryGrid), so its own height is whatever its text
   needs — that's what lets neighbouring columns drift out of line
   with each other, the way real brick courses do.

   The toggle in the corner is a placeholder for now — visually wired
   (flips on click, doesn't navigate) but not connected to anything yet.
   Swap the onClick body once its real purpose is defined. */
export default function CategoryCard({
  name,
  href,
}: {
  name: string;
  href: string;
}) {
  const [on, setOn] = useState(true);

  return (
    <div
      className="group relative mb-2.5 flex min-h-[3.25rem] break-inside-avoid items-center
                 rounded-md border border-rule bg-sheet px-3 py-2
                 shadow-[0_1px_2px_rgba(23,24,28,0.03)] transition-all duration-200
                 hover:-translate-y-0.5 hover:border-ink/70
                 hover:shadow-[0_6px_16px_-8px_rgba(23,24,28,0.22)]"
    >
      <Link href={href} className="flex flex-1 items-center justify-between gap-1.5 pr-5" title={name}>
        <span className="font-display text-[0.8125rem] font-semibold leading-snug tracking-tight">
          {name}
        </span>
        <span className="hidden shrink-0 text-ink-soft opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 sm:group-hover:inline">
          →
        </span>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOn((v) => !v);
        }}
        aria-pressed={on}
        aria-label={on ? `Turn off ${name}` : `Turn on ${name}`}
        className="absolute right-1.5 top-1.5"
      >
        <span
          className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
            on ? "bg-approve" : "bg-rule"
          }`}
        >
          <span
            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-3" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}