import Link from "next/link";

/* A monogram in an accent-coloured ring, standing in for imagery we don't have —
   the way a boutique's letterhead uses an initial instead of a photo.
   Reads as considered, not like a missing-image placeholder. */
const RING_COLORS = [
  { text: "text-coral", border: "border-coral/50", hoverBg: "group-hover:bg-coral" },
  { text: "text-orchid", border: "border-orchid/50", hoverBg: "group-hover:bg-orchid" },
  { text: "text-accent", border: "border-accent/50", hoverBg: "group-hover:bg-accent" },
];

export default function CategoryCard({
  name,
  href,
  colorIndex = 0,
}: {
  name: string;
  href: string;
  colorIndex?: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  const ring = RING_COLORS[colorIndex % RING_COLORS.length];

  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-rule
                 bg-sheet p-6 shadow-[0_1px_2px_rgba(36,17,40,0.05),0_12px_32px_-18px_rgba(173,86,196,0.22)]
                 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60
                 hover:shadow-[0_1px_2px_rgba(36,17,40,0.06),0_24px_48px_-20px_rgba(173,86,196,0.32)]"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full border font-display text-lg
                    font-semibold transition-colors group-hover:text-white ${ring.text} ${ring.border} ${ring.hoverBg}`}
      >
        {initial}
      </span>

      <div className="flex items-end justify-between gap-2">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
          {name}
        </h3>
        <span className="mb-0.5 shrink-0 text-accent opacity-0 transition-all duration-300
                          group-hover:translate-x-0.5 group-hover:opacity-100">
          →
        </span>
      </div>

      {/* A hairline that draws itself in the accent colour on hover — quiet motion, not decoration for its own sake. */}
      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}