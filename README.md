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
npm test
npm run build
```

Run these commands from the project root.

## Documentation

- `CLAUDE.md` — project rules for AI coding assistants.
- `docs/PRODUCT.md` — product definition and validation hypotheses.
- `docs/ROADMAP.md` — phases, priorities, and exit criteria.
- `docs/ARCHITECTURE.md` — code structure and technical principles.
- `docs/DECISIONS.md` — important product and technical decisions.
- `docs/IMPLEMENTATION_PROMPTS.md` — implementation order and prompts for the next features.
- `docs/HANDOVER.md` — latest project state, the starting point for a new session.
- `docs/DEMO_CONTENT_SOURCES.md` — sources behind the demo scenarios, and image decisions.
- `docs/PERFORMANCE.md` — mobile interaction measurements and the changes that came from them.
- `docs/PRODUCT_AUDIT.md`, `docs/PRODUCT_STRATEGY.md`, `docs/FEATURE_ROADMAP.md`, `docs/VALIDATION_PLAN.md` — product audit and strategy (12 October 2026).
- `docs/AUDIT_FOLLOW_UP.md` — what was done with each audit finding.
- `docs/POST_DEMO_AUDIT.md` — post-demo audit (14 October 2026), the email-first validation proposal, and the results of the pre-outreach polish with the owner's release checklist (§16).
- `tests/e2e/README.md` — the browser scripts and audits, and how to run them.

## Demo scenarios

The demo works for four kinds of customer: Tennis Coaching (an independent coach at two venues),
Football Academy, Basketball Club and Pilates Studio. The first visit to the site opens a welcome
screen (`/demo`) with one card per sport; choosing one opens that example's dashboard, and every page
then shows its fictional data. A direct link opens one example at once: `/demo?sport=tennis` (or
`football`, `basketball`, `pilates`). To change sport later, use **Settings → Demo** (or open `/demo`
again). The choice and any changes are saved
only in this browser; "Reset demo data" and "Reset all scenarios" are in Settings → Demo. There is no
sign-in and nothing is sent to anyone.

## Architecture Principles

- Next.js App Router, TypeScript, and Tailwind CSS.
- Fictional demo data is separated from UI components.
- No production backend during the interactive demo phase.
- Mobile-first, responsive interface.
- Real user data must not be introduced before privacy and access controls are reviewed.

## Deployment

Live demo: **https://coach-scpace.vercel.app** (provisional URL).

- Every merge into `main` deploys to production on Vercel.
- Pull requests run CI (lint, typecheck, unit tests, build) on GitHub Actions.
- Every pull request gets a Vercel preview deployment; review it before merging.

## Project Status and Contributions

Keep `main` working. Use small changes, review pull requests, and update the documentation when important decisions change.
