"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EntryCard from "./EntryCard";

type Entry = { word: string; definition: string };

// Infinite-scroll browse. Page 1 is server-rendered and passed in as `initial`
// so there's content before JS loads; subsequent pages stream from /api/words.
export default function BrowseList({ initial }: { initial: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [nextPage, setNextPage] = useState(2);
  const [done, setDone] = useState(initial.length === 0);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/words/${nextPage}`);
      const data: Entry[] = await res.json();
      setEntries((e) => [...e, ...data]);
      setNextPage((p) => p + 1);
      if (data.length === 0) setDone(true);
    } finally {
      setLoading(false);
    }
  }, [loading, done, nextPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (obsEntries) => {
        if (obsEntries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div>
      {entries.map((e) => (
        <EntryCard key={e.word} entry={e} />
      ))}
      <div ref={sentinel} className="py-6 text-center text-[var(--muted)]">
        {done ? "You've reached the end of the dictionary." : "Loading more…"}
      </div>
    </div>
  );
}
