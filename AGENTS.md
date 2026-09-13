# AGENTS.md

Guidance for coding agents working on roderick.

## Project Overview

Personal web application built with Next.js, React, Tailwind CSS, and daisyUI (`@icco/react-common`).

## Commands

Use pnpm:
- `pnpm dev` — Start dev server on port 8080
- `pnpm build` — Build production application
- `pnpm start` — Run production build on port 8080
- `pnpm test` — Run unit tests with Vitest (`vitest run`)
- `pnpm lint` — Run ESLint
- `pnpm typecheck` — Run TypeScript type checking (`tsc --noEmit`)

## Architecture & Layout

- `src/app/` — Next.js App Router pages and layouts.
- `src/components/` — Reusable React UI components.
- `src/lib/` — Utilities and helper modules.

## Conventions

- TypeScript with strict type checking.
- Vitest tests adjacent to code under test.
- PR titles and commits must follow Conventional Commits with lowercase subjects.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before submitting PRs.
