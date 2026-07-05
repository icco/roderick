import Link from "next/link";

type Entry = { word: string; definition: string };

/** A word linking to its page, with its definition. Used by server and client. */
export default function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article className="border-b border-[var(--border)] py-4">
      <Link
        href={`/word/${encodeURIComponent(entry.word)}`}
        className="font-serif text-xl font-semibold text-[var(--accent)] hover:underline"
      >
        {entry.word}
      </Link>
      <p className="mt-1 font-serif leading-relaxed text-[var(--foreground)]">
        {entry.definition}
      </p>
    </article>
  );
}
