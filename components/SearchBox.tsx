"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = { word: string; definition: string };

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        setResults(await res.json());
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search 100,000+ words and definitions…"
        aria-label="Search the dictionary"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-lg outline-none focus:border-[var(--accent)]"
      />
      {q.trim() && (
        <div className="mt-3">
          {loading && results.length === 0 ? (
            <p className="text-[var(--muted)]">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-[var(--muted)]">No matches for “{q.trim()}”.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card)]">
              {results.map((e) => (
                <li key={e.word}>
                  <Link
                    href={`/word/${encodeURIComponent(e.word)}`}
                    className="block px-4 py-3 hover:bg-[var(--background)]"
                  >
                    <span className="font-serif font-semibold text-[var(--accent)]">
                      {e.word}
                    </span>
                    <span className="ml-2 text-sm text-[var(--muted)] line-clamp-1">
                      {e.definition}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
