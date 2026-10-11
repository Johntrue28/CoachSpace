# CoachSpace

**CoachSpace is a provisional name.**

A mobile-first, responsive web application for sports coaches and their groups. The initial goal is to validate the concept through an interactive demo using fictional data.

## Current Status

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the current phase and priorities.

## Requirements

- Node.js 22.
- npm.
- Git, if working locally.
- Access to the project repository.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Checks

Run all project checks:

```bash
npm run check
```

Individual checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Run these commands from the project root.

## Documentation

- `CLAUDE.md` — project rules for AI coding assistants.
- `docs/PRODUCT.md` — product definition and validation hypotheses.
- `docs/ROADMAP.md` — phases, priorities, and exit criteria.
- `docs/ARCHITECTURE.md` — code structure and technical principles.
- `docs/DECISIONS.md` — important product and technical decisions.

## Architecture Principles

- Next.js App Router, TypeScript, and Tailwind CSS.
- Fictional demo data is separated from UI components.
- No production backend during the interactive demo phase.
- Mobile-first, responsive interface.
- Real user data must not be introduced before privacy and access controls are reviewed.

## Deployment

Live demo: **https://coach-scpace.vercel.app** (provisional URL).

- Every merge into `main` deploys to production on Vercel.
- Pull requests run CI (lint, typecheck, build) on GitHub Actions.
- Every pull request gets a Vercel preview deployment; review it before merging.

## Project Status and Contributions

Keep `main` working. Use small changes, review pull requests, and update the documentation when important decisions change.
