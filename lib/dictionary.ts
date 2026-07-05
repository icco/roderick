import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";

export const PER_PAGE = 100;

export type Entry = { word: string; definition: string };

type Dict = {
  /** word -> definition */
  entries: Map<string, string>;
  /** headwords sorted case-insensitively (stable browse/pagination order) */
  sortedWords: string[];
  /** lowercased headword -> actual headword, for case-insensitive lookup */
  lowerToKey: Map<string, string>;
};

// Cache the loaded dictionary on globalThis so Next.js dev hot-reloads and
// separate route modules share one copy instead of re-parsing 100k+ entries.
const cache = globalThis as unknown as { __roderickDict?: Dict };

function load(): Dict {
  const file = path.join(process.cwd(), "data", "dict.json.gz");
  const raw = gunzipSync(readFileSync(file)).toString("utf8");
  const obj = JSON.parse(raw) as Record<string, string>;

  const entries = new Map<string, string>(Object.entries(obj));
  const sortedWords = [...entries.keys()].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" }),
  );
  const lowerToKey = new Map<string, string>();
  for (const w of sortedWords) {
    const l = w.toLowerCase();
    if (!lowerToKey.has(l)) lowerToKey.set(l, w);
  }

  return { entries, sortedWords, lowerToKey };
}

function dict(): Dict {
  if (!cache.__roderickDict) cache.__roderickDict = load();
  return cache.__roderickDict;
}

/** Total number of headwords. */
export function count(): number {
  return dict().entries.size;
}

/** Look up a single entry, case-insensitively. */
export function lookup(word: string): Entry | null {
  const d = dict();
  const key = d.entries.has(word)
    ? word
    : d.lowerToKey.get(word.toLowerCase());
  if (!key) return null;
  return { word: key, definition: d.entries.get(key)! };
}

/** One page (100) of entries in browse order. Pages are 1-indexed. */
export function page(n: number): Entry[] {
  const d = dict();
  const p = Math.max(1, n);
  const start = (p - 1) * PER_PAGE;
  return d.sortedWords
    .slice(start, start + PER_PAGE)
    .map((word) => ({ word, definition: d.entries.get(word)! }));
}

/**
 * Full-text search over headwords, then definitions. Ranked: exact word,
 * word prefix, word substring, then definition substring. Definitions are
 * only scanned if word matches don't already fill the limit.
 */
export function search(q: string, limit = 50): Entry[] {
  const d = dict();
  const ql = q.trim().toLowerCase();
  if (!ql) return [];

  const exact: string[] = [];
  const prefix: string[] = [];
  const contains: string[] = [];
  for (const word of d.sortedWords) {
    const wl = word.toLowerCase();
    if (wl === ql) exact.push(word);
    else if (wl.startsWith(ql)) prefix.push(word);
    else if (wl.includes(ql)) contains.push(word);
  }

  let results = [...exact, ...prefix, ...contains];
  if (results.length < limit) {
    const seen = new Set(results);
    for (const word of d.sortedWords) {
      if (results.length >= limit) break;
      if (seen.has(word)) continue;
      if (d.entries.get(word)!.toLowerCase().includes(ql)) results.push(word);
    }
  }

  return results
    .slice(0, limit)
    .map((word) => ({ word, definition: d.entries.get(word)! }));
}

/** A random headword. */
export function random(): Entry {
  const d = dict();
  const word = d.sortedWords[Math.floor(Math.random() * d.sortedWords.length)];
  return { word, definition: d.entries.get(word)! };
}

/** Deterministic word-of-the-day for a given YYYY-MM-DD date string. */
export function wordOfTheDay(dateKey: string): Entry {
  const d = dict();
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % d.sortedWords.length;
  const word = d.sortedWords[idx];
  return { word, definition: d.entries.get(word)! };
}

/** Alphabetical neighbors around a word (for "keep exploring"). */
export function neighbors(word: string, span = 6): Entry[] {
  const d = dict();
  const entry = lookup(word);
  if (!entry) return [];
  const idx = d.sortedWords.indexOf(entry.word);
  const out: Entry[] = [];
  for (let i = idx - span; i <= idx + span; i++) {
    if (i < 0 || i >= d.sortedWords.length || i === idx) continue;
    const w = d.sortedWords[i];
    out.push({ word: w, definition: d.entries.get(w)! });
  }
  return out;
}

/**
 * "See also" links parsed from GCIDE cross-references embedded in the
 * definition ("See Foo", "Cf. Bar", "See under Baz"), resolved to real
 * headwords. Deliberately conservative — we don't link every word that
 * happens to appear in a definition.
 */
export function relatedTo(word: string): string[] {
  const entry = lookup(word);
  if (!entry) return [];
  const d = dict();
  const out: string[] = [];
  const seen = new Set<string>([entry.word]);
  const re = /\b(?:See(?:\s+under)?|Cf\.)\s+([A-Z][A-Za-z-]{1,})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(entry.definition)) !== null) {
    const key = d.lowerToKey.get(m[1].toLowerCase());
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}
