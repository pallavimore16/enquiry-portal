import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-accent/30 bg-sheet">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-display text-base font-semibold tracking-tight">
                Enquiry Portal
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              A considered way to reach the right seller — browse the catalogue,
              send your requirement, and hear back directly.
            </p>
          </div>

          <nav className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="font-display text-xs uppercase tracking-[0.16em] text-accent">
                Explore
              </span>
              <Link href="/c" className="text-ink-soft transition-colors hover:text-ink">
                Catalogue
              </Link>
              <Link href="/login" className="text-ink-soft transition-colors hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="text-ink-soft transition-colors hover:text-ink">
                Create account
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-rule pt-6 text-xs text-ink-soft">
          © {new Date().getFullYear()} Enquiry Portal. All enquiries are reviewed by a seller before any reply is sent.
        </div>
      </div>
    </footer>
  );
}