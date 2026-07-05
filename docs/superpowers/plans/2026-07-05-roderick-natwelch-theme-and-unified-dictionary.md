# Roderick natwelch Theme + Unified Dictionary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin Roderick with natwelch.com's colorscheme/header/footer (via `@icco/react-common` + daisyUI) and turn both routes into one infinite dictionary anchored on the highlighted word.

**Architecture:** Adopt natwelch.com's daisyUI theme and react-common chrome components in the root layout. Replace the two separate browse/word views with a single client `Dictionary` component that server-renders a window around an anchor word, centers it on load, and infinite-scrolls in both directions via a new `/api/range` endpoint.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, daisyUI 5, `@icco/react-common` 2026.x, `@heroicons/react` 2, `@wrksz/themes` (transitive), `next/font` (Roboto), pnpm.

## Global Constraints

- Package manager: **pnpm** (`pnpm@11.10.0`); Node `>=22`.
- Dev server + prod server run on **port 8080** (`pnpm dev`, `pnpm start`).
- All dictionary pages are `export const dynamic = "force-dynamic"` (dict loads from disk at runtime).
- **No serif fonts.** App font is Roboto (sans). Headings restrained (no giant/bold serif titles) — per Nat's personal-site taste.
- Colors come **only** from natwelch.com's daisyUI `light`/`dark` themes (copied verbatim in Task 1). Use daisyUI tokens (`bg-base-100`, `text-base-content`, `text-primary`, `border-base-300`, `badge`, `input`, etc.) — no hard-coded hex, no `var(--accent)`/`var(--card)` from the old scheme.
- Footer is **minimal**: copyright + source-repo icon only (`sourceRepo="https://github.com/icco/roderick"`, `startYear={2014}`, all other `show*` flags `false`).
- Header brand is the **"Roderick" wordmark** (react-common `SiteHeader` `brand` prop), not the icco Logo.
- Content column measure: `max-w-3xl` (~768px).
- Git: work stays on branch `nextjs-rewrite`. Local per-task commits are fine; **do not push or open a PR without Nat's explicit request; never force-push.**
- Clean up any dev server / background process you start before finishing a task.

---

## File Structure

**Created:**
- `app/api/range/route.ts` — index-windowed browse feed for infinite scroll.
- `components/Dictionary.tsx` — core bidirectional infinite-scroll list (client).
- `components/EntryRow.tsx` — one dictionary entry, shared server/client, `highlighted` variant.
- `components/SearchBar.tsx` — sticky header search (client).
- `components/Footer.tsx` — minimal react-common footer wrapper.

**Modified:**
- `package.json` — add deps.
- `app/globals.css` — daisyUI themes + fonts + react-common `@source`.
- `app/layout.tsx` — fonts, `ThemeProvider`, `SiteHeader`, `SearchBar`, `Footer`.
- `lib/dictionary.ts` — add `indexOf`, `range`, `windowAround`; remove `page`/`PER_PAGE`.
- `app/page.tsx` — render `Dictionary` anchored on word-of-the-day.
- `app/word/[word]/page.tsx` — render `Dictionary` anchored on the word.

**Deleted:**
- `components/BrowseList.tsx`, `components/SearchBox.tsx`, `components/EntryCard.tsx`, `app/api/words/[page]/route.ts`.

---

## Task 1: Dependencies, daisyUI theme, and fonts

**Files:**
- Modify: `package.json`
- Modify: `app/globals.css` (full rewrite)
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: daisyUI `light`/`dark` themes active; `--font-sans` = Roboto; `ThemeProvider` wrapping the app; body on `bg-base-100 text-base-content`. Later tasks rely on daisyUI tokens and react-common subpath imports resolving.

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/nat/Projects/roderick
pnpm add @icco/react-common@^2026.10627.1 @heroicons/react@^2.2.0 daisyui@^5.5.20
```

Expected: `package.json` gains the three deps; `pnpm-lock.yaml` updates; `node_modules/@icco/react-common` and `node_modules/@heroicons` exist.

- [ ] **Step 2: Verify react-common subpath + dist exist**

```bash
ls node_modules/@icco/react-common/dist/lib/{SiteHeader,Footer,ThemeProvider,ThemeToggle}.js
```

Expected: all four paths print (no "No such file"). If missing, stop — the `@source` glob in Step 3 depends on these.

- [ ] **Step 3: Rewrite `app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";
@source "../node_modules/@icco/react-common/dist/lib/{Logo,ThemeProvider,ThemeToggle,WebVitals,RecurseLogo,Social,XXIIVVLogo,XXIIVVRing,RecurseRing,SiteHeader,Footer}.js";

@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark;
  logs: false;
}

@theme {
  --font-sans: var(--font-roboto), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-roboto-mono), ui-monospace, SFMono-Regular, monospace;
}

@plugin "daisyui/theme" {
  name: "light";
  default: true;
  color-scheme: "light";

  --color-base-100: oklch(95.127% 0.007 260.731);
  --color-base-200: oklch(93.299% 0.01 261.788);
  --color-base-300: oklch(89.925% 0.016 262.749);
  --color-base-content: oklch(32.437% 0.022 264.182);
  --color-primary: oklch(59.435% 0.077 254.027);
  --color-primary-content: oklch(11.887% 0.015 254.027);
  --color-secondary: oklch(69.651% 0.059 248.687);
  --color-secondary-content: oklch(13.93% 0.011 248.687);
  --color-accent: oklch(77.464% 0.062 217.469);
  --color-accent-content: oklch(15.492% 0.012 217.469);
  --color-neutral: oklch(45.229% 0.035 264.131);
  --color-neutral-content: oklch(89.925% 0.016 262.749);
  --color-info: oklch(69.207% 0.062 332.664);
  --color-info-content: oklch(13.841% 0.012 332.664);
  --color-success: oklch(76.827% 0.074 131.063);
  --color-success-content: oklch(15.365% 0.014 131.063);
  --color-warning: oklch(85.486% 0.089 84.093);
  --color-warning-content: oklch(17.097% 0.017 84.093);
  --color-error: oklch(60.61% 0.12 15.341);
  --color-error-content: oklch(12.122% 0.024 15.341);

  --radius-selector: 1rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

@plugin "daisyui/theme" {
  name: "dark";
  default: false;
  color-scheme: "dark";

  --color-base-100: oklch(32.44% 0.0229 264.18);
  --color-base-content: oklch(95.13% 0.0074 260.73);
  --color-primary: oklch(37.92% 0.029 266.47);
  --color-primary-content: oklch(95.13% 0.0074 260.73);
  --color-secondary: oklch(41.57% 0.0324 264.13);
  --color-secondary-content: oklch(95.13% 0.0074 260.73);
  --color-accent: oklch(69.65% 0.0591 248.69);
  --color-neutral: oklch(45.23% 0.0352 264.13);
  --color-info: oklch(59.44% 0.0772 254.03);
  --color-info-content: oklch(59.44% 0.0772 254.03);
  --color-success: oklch(76.83% 0.0749 131.06);
  --color-success-content: oklch(76.83% 0.0749 131.06);
  --color-warning: oklch(69.29% 0.0963 38.24);
  --color-warning-content: oklch(69.29% 0.0963 38.24);
  --color-error: oklch(60.61% 0.1206 15.34);
  --color-error-content: oklch(60.61% 0.1206 15.34);

  --radius-selector: 1rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

- [ ] **Step 4: Update `app/layout.tsx` (fonts + ThemeProvider only)**

Replace the file with (header/footer are added in Task 2):

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

import { ThemeProvider } from "@icco/react-common/ThemeProvider";
import { Roboto, Roboto_Mono } from "next/font/google";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roderick.natwelch.com"),
  title: {
    default: "Roderick — a dictionary for exploring words",
    template: "%s · Roderick",
  },
  description:
    "A dictionary that promotes exploring of words. Wander from word to word, discover the word of the day, or take a random leap.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-base-100 text-base-content antialiased">
        <ThemeProvider>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Typecheck / build**

Run: `pnpm build`
Expected: build completes with no TypeScript or CSS errors. (It will still render the OLD home/word pages — that's fine; they use daisyUI-less markup but must still compile. If `@source`/`@plugin` errors appear, recheck Step 2/3.)

- [ ] **Step 6: Visual smoke check**

```bash
pnpm dev
```
Open http://localhost:8080. Expected: page background is the light daisyUI base (soft off-white/grey), not the old `#fbfaf7`. Stop the dev server (Ctrl-C / kill) when done.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml app/globals.css app/layout.tsx
git commit -m "feat: adopt natwelch daisyUI theme + Roboto fonts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Chrome — header, search bar, footer

**Files:**
- Create: `components/Footer.tsx`
- Create: `components/SearchBar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ThemeProvider` and daisyUI theme from Task 1; existing `GET /api/search?q=` returning `Array<{ word, definition }>`.
- Produces: `SiteHeader` (Roderick brand + Random link + theme toggle), sticky `SearchBar`, and minimal `Footer` present on every route.

- [ ] **Step 1: Create `components/Footer.tsx`**

```tsx
import { Footer as CommonFooter } from "@icco/react-common/Footer";

// Minimal footer: copyright + source-repo icon only. All social/webring/
// privacy extras from the shared component are disabled.
export default function Footer() {
  return (
    <CommonFooter
      startYear={2014}
      sourceRepo="https://github.com/icco/roderick"
      showSocial={false}
      showRecurseRing={false}
      showXXIIVVRing={false}
      showRecurseCenter={false}
      showPrivacyPolicy={false}
    />
  );
}
```

- [ ] **Step 2: Create `components/SearchBar.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Entry = { word: string; definition: string };

// Sticky, always-available dictionary search. Debounced query against
// /api/search; results render in a dropdown of links to word pages.
export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

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
    <div className="sticky top-0 z-20 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div ref={boxRef} className="relative mx-auto max-w-3xl px-4 py-3">
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
          <div className="absolute left-4 right-4 top-full z-30 mt-1 max-h-96 overflow-auto rounded-box border border-base-300 bg-base-100 shadow-lg">
            {loading && results.length === 0 ? (
              <p className="p-3 text-base-content/60">Searching…</p>
            ) : results.length === 0 ? (
              <p className="p-3 text-base-content/60">No matches for “{q.trim()}”.</p>
            ) : (
              <ul>
                {results.map((e) => (
                  <li key={e.word} className="border-b border-base-200 last:border-0">
                    <Link
                      href={`/word/${encodeURIComponent(e.word)}`}
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
    </div>
  );
}
```

- [ ] **Step 3: Wire chrome into `app/layout.tsx`**

Add imports below the existing ones:

```tsx
import { SiteHeader } from "@icco/react-common/SiteHeader";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
```

Replace the `<ThemeProvider>…</ThemeProvider>` block with:

```tsx
<ThemeProvider>
  <SiteHeader
    brand={
      <Link href="/" className="text-xl font-medium tracking-tight">
        Roderick
      </Link>
    }
    links={[
      { name: "Random", href: "/random", icon: <span aria-hidden>🎲</span> },
    ]}
  />
  <SearchBar />
  <main>{children}</main>
  <Footer />
</ThemeProvider>
```

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: compiles clean. (The old home page still shows its own in-body search box too; that's expected until Task 5.)

- [ ] **Step 5: Visual + interaction check**

```bash
pnpm dev
```
Open http://localhost:8080. Expected:
- Header shows "Roderick" (left), a theme toggle + "🎲 Random" (right).
- A sticky search bar sits under the header; typing shows a results dropdown; clicking a result navigates to `/word/<word>`.
- Footer at the bottom shows "© 2014 - <year> Nat Welch. All rights reserved." and a source-code (`</>`) icon linking to the roderick repo. No social/webring links.
- Toggling the theme switches the whole page between light and dark (colors from Task 1).

Stop the dev server when done.

- [ ] **Step 6: Commit**

```bash
git add components/Footer.tsx components/SearchBar.tsx app/layout.tsx
git commit -m "feat: natwelch site header, sticky search, minimal footer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Dictionary data layer — index/range/window + `/api/range`

**Files:**
- Modify: `lib/dictionary.ts`
- Create: `app/api/range/route.ts`

**Interfaces:**
- Consumes: existing `dict()` internal (`sortedWords`, `entries`) and `lookup()`.
- Produces:
  - `indexOf(word: string): number`
  - `range(start: number, count: number): Entry[]`
  - `windowAround(word: string, radius: number): { entries: Entry[]; start: number; index: number; total: number } | null`
  - `GET /api/range?start=<n>&count=<n>` → `{ start: number; entries: Entry[] }` (count clamped to 1..200, start clamped to ≥0).

- [ ] **Step 1: Add functions to `lib/dictionary.ts`**

Add these exports (place near `neighbors`; do NOT remove `page`/`PER_PAGE` yet — other files still import them until Task 5):

```ts
/** Position of a word in browse order (case-insensitive); -1 if absent. */
export function indexOf(word: string): number {
  const d = dict();
  const entry = lookup(word);
  if (!entry) return -1;
  return d.sortedWords.indexOf(entry.word);
}

/** A clamped slice of the browse order, by global index. */
export function range(start: number, count: number): Entry[] {
  const d = dict();
  const s = Math.max(0, Math.min(start, d.sortedWords.length));
  const e = Math.max(s, Math.min(s + count, d.sortedWords.length));
  return d.sortedWords
    .slice(s, e)
    .map((word) => ({ word, definition: d.entries.get(word)! }));
}

/**
 * SSR window centered on a word. Returns the entries spanning
 * [index - radius, index + radius], the global index of the first entry
 * (`start`), the anchor's own index, and the total headword count.
 * Null if the word is absent.
 */
export function windowAround(
  word: string,
  radius: number,
): { entries: Entry[]; start: number; index: number; total: number } | null {
  const d = dict();
  const index = indexOf(word);
  if (index < 0) return null;
  const start = Math.max(0, index - radius);
  const end = Math.min(d.sortedWords.length, index + radius + 1);
  const entries = d.sortedWords
    .slice(start, end)
    .map((w) => ({ word: w, definition: d.entries.get(w)! }));
  return { entries, start, index, total: d.sortedWords.length };
}
```

- [ ] **Step 2: Create `app/api/range/route.ts`**

```ts
import { NextResponse } from "next/server";
import { range } from "@/lib/dictionary";

// Index-windowed browse feed for bidirectional infinite scroll.
// start = global index of the first entry to return; count is clamped 1..200.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawStart = parseInt(searchParams.get("start") ?? "0", 10);
  const rawCount = parseInt(searchParams.get("count") ?? "50", 10);
  const start = Number.isFinite(rawStart) ? Math.max(0, rawStart) : 0;
  const count = Number.isFinite(rawCount)
    ? Math.min(Math.max(rawCount, 1), 200)
    : 50;
  return NextResponse.json({ start, entries: range(start, count) });
}
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: compiles clean.

- [ ] **Step 4: Verify the API returns alphabetical windows**

```bash
pnpm dev   # in one shell (background it or use a second shell)
sleep 3
curl -s "http://localhost:8080/api/range?start=0&count=3"
curl -s "http://localhost:8080/api/range?start=0&count=3" | python3 -c "import sys,json; d=json.load(sys.stdin); print('start', d['start']); print('words', [e['word'] for e in d['entries']])"
```
Expected: `start 0` and a list of 3 headwords in ascending alphabetical order (the very first entries in the dictionary). Then check clamping:
```bash
curl -s "http://localhost:8080/api/range?start=-50&count=5" | python3 -c "import sys,json; d=json.load(sys.stdin); print('start', d['start'], 'n', len(d['entries']))"
```
Expected: `start 0 n 5`. Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add lib/dictionary.ts app/api/range/route.ts
git commit -m "feat: index-windowed dictionary range API

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `EntryRow` and `Dictionary` components

**Files:**
- Create: `components/EntryRow.tsx`
- Create: `components/Dictionary.tsx`

**Interfaces:**
- Consumes: `GET /api/range?start=&count=` → `{ start, entries }` (Task 3).
- Produces:
  - `EntryRow` — props `{ entry: {word,definition}; highlighted?: boolean; badge?: string; related?: string[] }`. The highlighted row carries `id="dict-anchor"`.
  - `Dictionary` (default export) — props `{ initial: Entry[]; initialStart: number; total: number; anchor: string; badge?: string; related?: string[] }`. Centers `anchor` on mount, infinite-scrolls both directions. Consumed by pages in Task 5, which must render it with `key={anchor}`.

- [ ] **Step 1: Create `components/EntryRow.tsx`**

```tsx
import Link from "next/link";

type Entry = { word: string; definition: string };

// One dictionary entry. The highlighted (anchor) entry is emphasized with the
// theme primary color + a left rule, carries an optional badge and "see also"
// chips, and gets id="dict-anchor" so Dictionary can scroll it to center.
export default function EntryRow({
  entry,
  highlighted = false,
  badge,
  related,
}: {
  entry: Entry;
  highlighted?: boolean;
  badge?: string;
  related?: string[];
}) {
  return (
    <article
      id={highlighted ? "dict-anchor" : undefined}
      className={
        "border-b border-base-300 py-4" +
        (highlighted ? " -ml-4 border-l-4 border-l-primary pl-4" : "")
      }
    >
      {highlighted && badge && (
        <span className="badge badge-primary badge-sm mb-2">{badge}</span>
      )}
      <Link
        href={`/word/${encodeURIComponent(entry.word)}`}
        className={
          highlighted
            ? "block text-2xl font-semibold text-primary hover:underline"
            : "block text-lg font-medium hover:text-primary hover:underline"
        }
      >
        {entry.word}
      </Link>
      <p className="mt-1 leading-relaxed text-base-content/90">
        {entry.definition}
      </p>
      {highlighted && related && related.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {related.map((w) => (
            <li key={w}>
              <Link
                href={`/word/${encodeURIComponent(w)}`}
                className="badge badge-outline hover:badge-primary"
              >
                {w}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Create `components/Dictionary.tsx`**

```tsx
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
    document
      .getElementById("dict-anchor")
      ?.scrollIntoView({ block: "center" });
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div
        ref={topRef}
        className="py-4 text-center text-sm text-base-content/60"
      >
        {start <= 0 ? "The beginning of the dictionary." : "Loading earlier words…"}
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
```

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: compiles clean. (Components aren't wired into any route yet — that happens in Task 5. This gate is a reviewer reading the component + a green typecheck.)

- [ ] **Step 4: Commit**

```bash
git add components/EntryRow.tsx components/Dictionary.tsx
git commit -m "feat: bidirectional dictionary list + entry row

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Wire routes, remove old browse, end-to-end verify

**Files:**
- Modify: `app/word/[word]/page.tsx`
- Modify: `app/page.tsx`
- Modify: `lib/dictionary.ts` (remove `page`/`PER_PAGE`)
- Delete: `components/BrowseList.tsx`, `components/SearchBox.tsx`, `components/EntryCard.tsx`, `app/api/words/[page]/route.ts`

**Interfaces:**
- Consumes: `windowAround`, `relatedTo`, `wordOfTheDay`, `lookup` (lib); `Dictionary` (Task 4).
- Produces: `/` anchored on word-of-the-day (with badge); `/word/[word]` anchored on the word. No remaining references to `page`, `BrowseList`, `SearchBox`, `EntryCard`, or `/api/words`.

- [ ] **Step 1: Rewrite `app/word/[word]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lookup, relatedTo, windowAround } from "@/lib/dictionary";
import Dictionary from "@/components/Dictionary";

export const dynamic = "force-dynamic";

const RADIUS = 60;

type Params = { params: Promise<{ word: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
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

  const win = windowAround(entry.word, RADIUS);
  if (!win) notFound();

  return (
    <Dictionary
      key={entry.word}
      initial={win.entries}
      initialStart={win.start}
      total={win.total}
      anchor={entry.word}
      related={relatedTo(entry.word)}
    />
  );
}
```

- [ ] **Step 2: Rewrite `app/page.tsx`**

```tsx
import { relatedTo, windowAround, wordOfTheDay } from "@/lib/dictionary";
import Dictionary from "@/components/Dictionary";

// The landing page is the same dictionary surface, anchored on today's
// word-of-the-day. Dynamic: depends on today's date and runtime dict.
export const dynamic = "force-dynamic";

const RADIUS = 60;

export default function Home() {
  const dateKey = new Date().toISOString().slice(0, 10);
  const wotd = wordOfTheDay(dateKey);
  const win = windowAround(wotd.word, RADIUS)!;

  return (
    <Dictionary
      key={wotd.word}
      initial={win.entries}
      initialStart={win.start}
      total={win.total}
      anchor={wotd.word}
      badge="Word of the day"
      related={relatedTo(wotd.word)}
    />
  );
}
```

- [ ] **Step 3: Remove `page`/`PER_PAGE` from `lib/dictionary.ts`**

Delete the `PER_PAGE` export and the entire `page(n)` function (the block starting `/** One page (100) of entries in browse order. Pages are 1-indexed. */`). Leave everything else (`count`, `lookup`, `range`, `windowAround`, `search`, `random`, `wordOfTheDay`, `neighbors`, `relatedTo`, `indexOf`) intact.

- [ ] **Step 4: Delete superseded files**

```bash
git rm components/BrowseList.tsx components/SearchBox.tsx components/EntryCard.tsx "app/api/words/[page]/route.ts"
```

- [ ] **Step 5: Confirm no dangling references**

```bash
grep -rnE "BrowseList|SearchBox|EntryCard|api/words|PER_PAGE" app components lib
grep -rn "page(" app components lib
```
Expected: both print nothing. (`page(1)` etc. only existed in the old home page and words route, now gone.) If anything prints, fix it before continuing.

- [ ] **Step 6: Build**

Run: `pnpm build`
Expected: compiles clean; route list shows `/`, `/word/[word]`, `/api/range`, `/api/search`, `/api/random`, `/random`, `/healthz`, and NO `/api/words/[page]`.

- [ ] **Step 7: End-to-end verification (Playwright MCP or browser)**

```bash
pnpm dev
```
Then verify at http://localhost:8080 (use the Playwright MCP browser tools where possible; take screenshots in light and dark):

1. **Home centers on WOTD:** `/` loads with one entry highlighted (primary color, left rule) bearing a "Word of the day" badge, sitting in the vertical middle of the viewport, with other words above and below it.
2. **Word page centers:** navigate to a known word, e.g. `/word/serendipity`. That word is highlighted and vertically centered; earlier words are above, later below.
3. **Scroll down appends:** scroll down — later alphabetical words load ("Loading more words…" briefly), no console errors.
4. **Scroll up prepends without jump:** scroll back up past the anchor — earlier words load and the content you were reading does NOT jump under you (the viewport stays anchored to what you were looking at).
5. **Reaches ends:** it is acceptable to only spot-check; near index 0 the top shows "The beginning of the dictionary."
6. **Click re-centers:** click a nearby headword; URL becomes `/word/<clicked>` and that word becomes the highlighted, centered anchor.
7. **Search:** type in the header search bar; pick a result; it opens that word centered.
8. **Theme:** toggle dark mode; colors switch and the highlight remains legible.

Record any failures and fix before committing. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx "app/word/[word]/page.tsx" lib/dictionary.ts
git commit -m "feat: unified dictionary anchored on highlighted word

Home and word pages render one infinite alphabetical surface centered on
the highlighted word; removes the old paged browse.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** natwelch colorscheme (Task 1), header/wordmark + minimal footer (Task 2), sans/no-serif + restrained type + `max-w-3xl` (Tasks 1/4), unified dictionary + centered highlight + bidirectional scroll (Tasks 3–5), WOTD anchor + badge (Task 5), see-also chips on anchor (Task 4), `/api/range` + lib window/index/range (Task 3), retired `/api/words`+`page()`+old components (Task 5), metadata/`/random` preserved (Task 5). All spec sections map to a task.
- **Type consistency:** `windowAround` returns `{ entries, start, index, total }`; `Dictionary` consumes `initial`/`initialStart`/`total`/`anchor`; `/api/range` returns `{ start, entries }` matching `loadUp`/`loadDown`. Anchor is always the canonical `entry.word` (post-`lookup`), matching `e.word === anchor`.
- **No test runner:** repo has none and adding one is out of scope; lib is verified via the range API (Task 3) and window centering is verified via the word page (Task 5). Verification is build + curl + Playwright, matching repo reality.
```

