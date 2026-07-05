"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import EntryRow from "./EntryRow";

type Entry = { word: string; definition: string };

const BATCH = 50;

// One infinite, bidirectionally-scrollable slice of the whole dictionary,
// anchored on `anchor` (highlighted + scrolled to the vertical middle on load).
// Scrolling up prepends earlier words; scrolling down appends later ones.
export default function Dictionary({
  initial,
  initialStart,
  total,
  anchor,
  badge,
  related,
}: {
  initial: Entry[];
  initialStart: number;
  total: number;
  anchor: string;
  badge?: string;
  related?: string[];
}) {
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [start, setStart] = useState(initialStart); // global index of entries[0]
  const [loadingUp, setLoadingUp] = useState(false);
  const [loadingDown, setLoadingDown] = useState(false);
  const end = start + entries.length; // exclusive global index

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // scrollHeight captured just before a prepend, so we can restore position.
  const preScrollHeight = useRef<number | null>(null);

  // Center the anchor on mount (before paint). Component is keyed by anchor
  // upstream, so a new word remounts and re-centers.
  useLayoutEffect(() => {
    document.getElementById("dict-anchor")?.scrollIntoView({ block: "center" });
  }, []);

  // After a prepend, add the height that appeared above the viewport back to
  // the scroll position so the user's view doesn't jump.
  useLayoutEffect(() => {
    if (preScrollHeight.current !== null) {
      const delta =
        document.documentElement.scrollHeight - preScrollHeight.current;
      window.scrollBy(0, delta);
      preScrollHeight.current = null;
    }
  }, [entries]);

  const loadUp = useCallback(async () => {
    if (loadingUp || start <= 0) return;
    setLoadingUp(true);
    const newStart = Math.max(0, start - BATCH);
    const gap = start - newStart;
    try {
      const res = await fetch(`/api/range?start=${newStart}&count=${gap}`);
      const data: { start: number; entries: Entry[] } = await res.json();
      if (data.entries.length) {
        preScrollHeight.current = document.documentElement.scrollHeight;
        setEntries((prev) => [...data.entries, ...prev]);
        setStart(newStart);
      }
    } finally {
      setLoadingUp(false);
    }
  }, [loadingUp, start]);

  const loadDown = useCallback(async () => {
    if (loadingDown || end >= total) return;
    setLoadingDown(true);
    try {
      const res = await fetch(`/api/range?start=${end}&count=${BATCH}`);
      const data: { start: number; entries: Entry[] } = await res.json();
      if (data.entries.length) {
        setEntries((prev) => [...prev, ...data.entries]);
      }
    } finally {
      setLoadingDown(false);
    }
  }, [loadingDown, end, total]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (obsEntries) => {
        for (const en of obsEntries) {
          if (!en.isIntersecting) continue;
          if (en.target === topRef.current) loadUp();
          if (en.target === bottomRef.current) loadDown();
        }
      },
      { rootMargin: "400px" },
    );
    if (topRef.current) obs.observe(topRef.current);
    if (bottomRef.current) obs.observe(bottomRef.current);
    return () => obs.disconnect();
  }, [loadUp, loadDown]);

  return (
    // overflow-anchor:none disables the browser's native scroll anchoring so our
    // manual prepend compensation (useLayoutEffect above) is the only correction —
    // otherwise the two stack and the viewport jumps by one batch height.
    <div className="mx-auto max-w-3xl px-4 py-8" style={{ overflowAnchor: "none" }}>
      <div ref={topRef} className="py-4 text-center text-sm text-base-content/60">
        {start <= 0
          ? "The beginning of the dictionary."
          : "Loading earlier words…"}
      </div>
      {entries.map((e) => (
        <EntryRow
          key={e.word}
          entry={e}
          highlighted={e.word === anchor}
          badge={e.word === anchor ? badge : undefined}
          related={e.word === anchor ? related : undefined}
        />
      ))}
      <div
        ref={bottomRef}
        className="py-4 text-center text-sm text-base-content/60"
      >
        {end >= total ? "The end of the dictionary." : "Loading more words…"}
      </div>
    </div>
  );
}
