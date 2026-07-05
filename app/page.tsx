import Link from "next/link";
import { count, page, wordOfTheDay } from "@/lib/dictionary";
import SearchBox from "@/components/SearchBox";
import BrowseList from "@/components/BrowseList";

// The landing page is dynamic: word-of-the-day depends on today's date and the
// dictionary is loaded from disk at runtime.
export const dynamic = "force-dynamic";

export default function Home() {
  const total = count();
  const dateKey = new Date().toISOString().slice(0, 10);
  const wotd = wordOfTheDay(dateKey);
  const firstPage = page(1);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold">Roderick</h1>
        <p className="mt-1 text-[var(--muted)]">
          A dictionary for exploring words — wander from one to the next.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Word of the day
          </h2>
          <a
            href="/random"
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            🎲 Surprise me
          </a>
        </div>
        <Link
          href={`/word/${encodeURIComponent(wotd.word)}`}
          className="mt-3 block font-serif text-3xl font-semibold text-[var(--accent)] hover:underline"
        >
          {wotd.word}
        </Link>
        <p className="mt-2 font-serif leading-relaxed">{wotd.definition}</p>
      </section>

      <section className="mb-10">
        <SearchBox />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Browse all {total.toLocaleString()} words
        </h2>
        <BrowseList initial={firstPage} />
      </section>
    </main>
  );
}
