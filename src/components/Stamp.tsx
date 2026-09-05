/* A rubber stamp, not a badge. Capitals appear here because the object being
   depicted is set in capitals — this is not a label convention. */
export default function Stamp({ status }: { status: string }) {
  const look: Record<string, string> = {
    APPROVED: "text-approve border-approve",
    REJECTED: "text-stamp border-stamp",
    PENDING: "text-ink-soft border-ink-soft",
  };

  return (
    <span
      className={`stamp inline-block shrink-0 border-[3px] border-double px-3 py-1
                  font-display text-sm font-bold uppercase tracking-[0.18em]
                  ${look[status] ?? look.PENDING}`}
    >
      {status}
    </span>
  );
}