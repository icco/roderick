import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lookup, neighbors, relatedTo } from "@/lib/dictionary";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ word: string }> };

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { word } = await params;
  const entry = lookup(decodeURIComponent(word));
  if (!entry) return { title: "Word not found" };
  const description = entry.definition.slice(0, 155);
  return {
    title: entry.word,
    description,
    openGraph: {
      title: `${entry.word} · Roderick`,
      description,
      type: "article",
    },
  };
}

export default async function WordPage({ params }: Params) {
  const { word } = await params;
  const entry = lookup(decodeURIComponent(word));
  if (!entry) notFound();

  const related = relatedTo(entry.word);
  const nearby = neighbors(entry.word);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="mb-8 flex items-center justify-between text-sm">
        <Link href="/" className="text-[var(--accent)] hover:underline">
          ← Roderick
        </Link>
        <a href="/random" className="text-[var(--accent)] hover:underline">
          🎲 Surprise me
        </a>
      </nav>

      <article>
        <h1 className="font-serif text-5xl font-bold text-[var(--accent)]">
          {entry.word}
        </h1>
        <p className="mt-4 font-serif text-lg leading-relaxed">
          {entry.definition}
        </p>
      </article>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            See also
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {related.map((w) => (
              <li key={w}>
                <Link
                  href={`/word/${encodeURIComponent(w)}`}
                  className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm text-[var(--accent)] hover:border-[var(--accent)]"
                >
                  {w}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Nearby words
          </h2>
          {nearby.map((e) => (
            <EntryCard key={e.word} entry={e} />
          ))}
        </section>
      )}
    </main>
  );
}
