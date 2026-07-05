# Roderick: natwelch.com theming + unified dictionary

Date: 2026-07-05
Branch: `nextjs-rewrite`

## Goals

1. Adopt natwelch.com's colorscheme, header, and footer via `@icco/react-common`
   so Roderick visually belongs to the natwelch.com family.
2. Make the looked-up (highlighted) word the **middle scroll point** of a single
   infinite dictionary surface — scroll up for earlier words, down for later
   ones, like thumbing a physical dictionary to that word.

## Decisions (from brainstorming)

- **Scroll model:** one unified dictionary. `/` and `/word/[word]` render the
  same infinite alphabetical surface; they differ only in the anchored,
  highlighted word.
- **Footer:** minimal — copyright + source-repo link only.
- **Header brand:** a "Roderick" wordmark (react-common `SiteHeader` `brand`
  slot), not the icco Logo.
- **Typography:** sans-serif app-wide (Roboto), **no serif**. Restrained
  headings, muted-blue links — per Nat's documented personal-site taste
  (resume.natwelch.com: no giant serif titles, h1 ~32px/400, links ~#265c83).
  Colors are natwelch.com's daisyUI `light`/`dark` themes verbatim (its primary
  is already a muted blue).

## Architecture / dependencies

Reuse natwelch.com's stack so the chrome is the same components, not lookalikes.

- **Add:** `@icco/react-common@^2026.10627.1`, `@heroicons/react@^2` (peer),
  `daisyui@^5` (Tailwind plugin, dev). `@wrksz/themes` is pulled transitively by
  react-common's `ThemeProvider`.
- **`app/globals.css`:** replace the custom `:root` / `--accent` CSS variables
  with natwelch.com's daisyUI setup:
  - `@import "tailwindcss";`
  - `@source` directive scanning
    `node_modules/@icco/react-common/dist/lib/{Logo,ThemeProvider,ThemeToggle,WebVitals,RecurseLogo,Social,XXIIVVLogo,XXIIVVRing,RecurseRing,SiteHeader,Footer}.js`
    so their utility classes are generated.
  - `@plugin "daisyui" { themes: light --default, dark --prefersdark; }`
  - The `light` and `dark` `@plugin "daisyui/theme"` OKLCH blocks copied from
    natwelch.com.
  - `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`
  - Map `--font-sans` to the Roboto next/font variable so the app body uses
    Roboto everywhere. (Optional `@plugin "@tailwindcss/typography"` only if we
    later want `prose`; not required for MVP.)
- **Fonts (`app/layout.tsx`):** `Roboto` (UI/body, mapped to `--font-sans`) and
  `Roboto_Mono` via `next/font/google`. No serif face.

## Chrome: layout, header, search, footer

`app/layout.tsx`:

- Wrap children in react-common `ThemeProvider` (sets `data-theme`, hybrid
  storage, no SSR theme flash). `<html suppressHydrationWarning>`.
- `<body className="bg-base-100 text-base-content">`.
- Render, top to bottom: `SiteHeader`, a sticky `SearchBar`, `<main>{children}</main>`,
  `Footer`.

**Header** — react-common `SiteHeader`:
- `brand={<Link href="/">Roderick</Link>}` (wordmark; Roboto, restrained weight).
- `links={[{ name: "Random", href: "/random", icon: 🎲 }]}` (🎲 emoji, matching
  today's "Surprise me").
- Default `ThemeToggle` (light/dark, persisted) renders on the right.

**Search** — new `components/SearchBar.tsx` (client), a slim **sticky** bar
directly under the header, always available. Debounced query against the
existing `/api/search`; results render in a dropdown of links to `/word/[word]`.
This replaces the home-body search. (Ports the current `SearchBox` logic.)

**Footer** — `components/Footer.tsx` wrapping react-common `Footer`:
```
<CommonFooter
  startYear={2014}
  sourceRepo="https://github.com/icco/roderick"
  showSocial={false}
  showRecurseRing={false}
  showXXIIVVRing={false}
  showRecurseCenter={false}
  showPrivacyPolicy={false}
/>
```
→ renders copyright + source-code icon only.

## The unified dictionary

A single infinite, bidirectionally-scrollable, alphabetical list of all ~100k
entries is the body of **both** routes. They differ only by anchor:

- `/word/[word]` → list anchored & highlighted on `word`.
- `/` → list anchored & highlighted on the **word of the day**, with a small
  "Word of the day" badge on that entry (preserves the feature).

**Behavior**
- The anchor entry is highlighted (primary color + a left marker/accent) and, on
  load, scrolled to the **vertical middle** of the viewport.
- Scrolling up prepends alphabetically-earlier entries; scrolling down appends
  later ones.
- See-also cross-references (`relatedTo`) render as chips **under the highlighted
  entry only**, keeping the list clean while preserving "explore".

**Components**
- `components/Dictionary.tsx` (client) — the core list.
  - Props: `initial: Entry[]`, `initialStart: number` (global index of
    `initial[0]`), `total: number`, `anchor: string`.
  - State: `entries`, `start` (index of `entries[0]`), derived `end`.
  - Top & bottom `IntersectionObserver` sentinels (rootMargin ~600px) trigger
    prepend / append.
  - `key={anchor}` on the element so client-side navigation between words
    remounts it and re-centers.
- `components/EntryRow.tsx` — one entry, shared server/client, with a
  `highlighted` variant. Replaces `EntryCard`. Headword is `<Link href="/word/x">`
  (shareable URLs; client nav re-anchors).
- `components/SearchBar.tsx` — header search (above).

**Removed:** `components/BrowseList.tsx`, `components/SearchBox.tsx`,
`components/EntryCard.tsx`, and the word-page hero / "See also" / "Nearby words"
sections — all folded into the unified surface.

## Data flow

Both pages **server-render** the initial window (anchor ± ~60 entries) for SEO,
link sharing, and no-JS first paint, then hydrate for infinite scroll.

**`lib/dictionary.ts` additions**
- `indexOf(word: string): number` — position of a word in `sortedWords`
  (case-insensitive via `lookup`), or `-1`.
- `range(start: number, count: number): Entry[]` — clamped slice of `sortedWords`.
- `windowAround(word: string, radius: number): { entries: Entry[]; start: number; index: number; total: number } | null`
  — SSR helper: the window around `word`, the global index of its first entry,
  the anchor's own index, and total count.

**New API** — `GET /api/range?start=<n>&count=<n>` → `{ start, entries }`.
Client fetches `start = loadedStart − count` (scroll up) or `start = loadedEnd`
(scroll down), tracking the loaded `[start, end)` index range. `start`/`count`
are clamped server-side.

**Routes**
- `/word/[word]`: `generateMetadata` unchanged (title/description/OG). Body =
  `windowAround(word)` → `<Dictionary anchor={word} …/>`. Unknown word →
  `notFound()`.
- `/`: `windowAround(wordOfTheDay(today))` → `<Dictionary anchor={wotd} …/>` with
  the WOTD badge flag.
- `/random`: unchanged (redirects to `/word/[random]`).
- **Retired:** `/api/words/[page]` route, `components/BrowseList.tsx`, and the
  `page(n)` lib function are all removed (superseded by `/api/range` +
  `windowAround` + `range`).

**Scroll mechanics (the tricky part)**
- **Prepend without jump:** in a `useLayoutEffect` keyed on the prepended batch,
  record `document.documentElement.scrollHeight` and `scrollY` before the
  prepend; after React commits, set
  `scrollTo(0, scrollY + (newScrollHeight - oldScrollHeight))` so the viewport
  stays put.
- **Initial centering:** on mount, `anchorRef.current?.scrollIntoView({ block: "center" })`.
  SSR already places the anchor mid-window, so this is a small adjustment.

## Typography specifics

- Font: Roboto (sans), mapped to `--font-sans`; app-wide. No serif.
- Highlighted headword: `text-primary`, weight ~600, moderate size (≤ `text-3xl`);
  regular headwords ~`text-lg`. Restrained, per Nat's scale — not giant/bold.
- Definitions: base size, `text-base-content`, ~1.5 line-height.
- Links: daisyUI `link` / primary (the natwelch scheme's muted blue).
- Column measure: `max-w-3xl` (~768px), generous whitespace.

## Error handling & edges

- `/api/range` and `range()` clamp out-of-bounds `start`/`count`.
- Top sentinel at index 0 shows "the beginning of the dictionary"; bottom
  sentinel at the last index shows "the end of the dictionary".
- Fetch failures keep existing entries and retry on the next intersection.
- Unknown `/word/[word]` → `notFound()`.
- Client nav to a new word remounts `Dictionary` (via `key`) and re-centers.

## Testing / verification

Manual, via the `/run` + `/verify` flow (dev server + Playwright):
1. Header, footer, and theme toggle render with natwelch colors in light & dark.
2. `/word/x` loads with `x` highlighted and vertically centered.
3. Scrolling up and down both load more without the viewport jumping.
4. Clicking a headword re-centers on it; URL updates to `/word/<clicked>`.
5. `/` centers on the word of the day with its badge.
6. Search bar returns results and links to word pages.

No test runner exists in the repo today; this stays manual unless we add one
(out of scope for this change).

## Out of scope

- Adding a unit/integration test runner.
- Changing the dictionary data or `/api/search` ranking.
- Any natwelch.com footer extras (social, webrings, privacy) — explicitly
  excluded by the "minimal footer" decision.
