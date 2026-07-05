"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Entry = { word: string; definition: string };

// Sticky search; debounced query to /api/search, results in a dropdown.
export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = q.trim();
    const ctrl = new AbortController();
    const t = setTimeout(
      async () => {
        if (!query) {
          setResults([]);
          return;
        }
        setLoading(true);
        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
            { signal: ctrl.signal },
          );
          setResults(await res.json());
        } catch {
          /* aborted */
        } finally {
          setLoading(false);
        }
      },
      query ? 200 : 0,
    );
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search 100,000+ words and definitions…"
        aria-label="Search the dictionary"
        className="input input-bordered w-full"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-96 overflow-auto rounded-box border border-base-300 bg-base-100 shadow-lg">
          {loading && results.length === 0 ? (
            <p className="p-3 text-base-content/60">Searching…</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-base-content/60">
              No matches for “{q.trim()}”.
            </p>
          ) : (
            <ul>
              {results.map((e) => (
                <li
                  key={e.word}
                  className="border-b border-base-200 last:border-0"
                >
                  <Link
                    href={`/word/${encodeURIComponent(e.word)}`}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 hover:bg-base-200"
                  >
                    <span className="font-medium text-primary">{e.word}</span>
                    <span className="ml-2 line-clamp-1 text-sm text-base-content/60">
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
