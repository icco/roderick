# Roderick → Next.js dictionary explorer

Date: 2026-07-05

## Goal

Promote `roderick` to a full-time deployed service. Rewrite the app from
Ruby/Sinatra to Next.js/React, ship it as a container image
`ghcr.io/icco/roderick:main` that serves `https://roderick.natwelch.com` on
port `:8080`, and lean into "exploring words" as the product idea.

## Deploy contract (fixed by the icco.me PR)

- Image: `ghcr.io/icco/roderick:main`
- Must listen on `:8080` (caddy reverse-proxies the public host → 8080)

## Data

- Source of truth stays `dict.json.gz`: a flat `{ word: definition }` JSON map,
  gzipped, 104,239 entries (GCIDE — public domain).
- Stored at `data/dict.json.gz` in the repo, COPYed into the runner image.
- Loaded **once at server boot** into an in-memory `Map` via a module-level
  singleton (`lib/dictionary.ts`) — the direct analog of today's
  `Dictionary.load`. No database.
- At boot the loader also builds:
  - a sorted array of headwords (for pagination, neighbors, random pick)
  - a lowercased search index (word + definition) for full-text search

## Architecture

Single Next.js app (App Router), Next **standalone** output, one container,
`node server.js` on `:8080`.

### Routes

- `/` — SSR landing page that invites exploration.
- `/word/[word]` — SSR shareable per-word page (dynamic; NOT statically
  generated — 104k pages would make builds enormous).
- `/api/words/[page]` — paginated JSON (`PER_PAGE = 100`) for infinite scroll;
  preserves today's `/words/:page.json` contract.
- `/api/search?q=` — server-side search, capped results.
- `/api/random` — returns a random headword (used by the 🎲 button).
- `/healthz` — returns `{ status: "ok", words: <count> }`; doubles as a
  data-loaded readiness probe for the uptime monitor.

### Exploration features

- **Landing page** shows: word-of-the-day (deterministic by date), a random-word
  button, a search box, and an infinite-scroll browse list underneath — a place
  to wander, not just a lookup box.
- **Full-text search:** server-side filter over the boot-time index (word +
  definition), capped. Start simple; only add a search lib (e.g. MiniSearch) if
  the naive filter proves too slow at 104k entries.
- **Shareable per-word pages:** clean `/word/pangolin` URLs with proper
  `<title>` and OpenGraph metadata.
- **Related / see-also:** parse explicit GCIDE cross-references in the
  definition (`See Foo`, `Cf. Bar`) and link any that resolve to real
  headwords; fall back to alphabetical neighbors. Do NOT link every dictionary
  word appearing in a definition — far too noisy.

## Deploy & CI

- **Dockerfile:** multi-stage `node:22-slim` (current LTS). `npm ci` →
  `next build` (standalone) → minimal non-root runner. `EXPOSE 8080`,
  `ENV PORT=8080 HOSTNAME=0.0.0.0`, `CMD ["node", "server.js"]`. `dict.json.gz`
  copied into the runner and confirmed loading at boot.
- **CI:** copy `natwelch.com/.github/workflows/docker.yml` almost verbatim
  (build on PR, push `:main` on push to `main`, build-provenance attestation),
  dropping the private-npm `npm_token` plumbing (roderick has no private deps).
  `docker/metadata-action` tags a `main`-branch push as `:main`, and
  `IMAGE_NAME = ${{ github.repository }} = icco/roderick`, so the contract image
  `ghcr.io/icco/roderick:main` is produced automatically.

## Decisions made without asking (easy to flip)

- **npm** (+ `package-lock.json`) over pnpm — simplest for a clean minimal app,
  no corepack.
- **Tailwind** for styling.
- **node:22-slim** LTS base (natwelch.com uses node:26; standalone output is
  version-agnostic — 22 LTS for reliability).

## Done when

`docker build .` succeeds, the container serves the site on `:8080`, CI
publishes `:main`, `/healthz` returns ok, and the front page invites
exploration (word-of-the-day + random + search + browse), not just search.

## Verification

Local: `docker build -t roderick .`, run with `-p 8080:8080`, then curl
`/healthz`, `/`, `/api/words/1`, `/api/search?q=...`, and a `/word/...` page
before declaring done.
