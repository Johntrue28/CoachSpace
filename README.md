# CoachSpace

**CoachSpace is a provisional name.** A mobile-first app for coaches and sports schools: players answer
"Are you coming?", the coach sees who is coming, changes a session once, takes the register in seconds and
keeps exercises, plans and notes in one place. The goal is to become the TeamPlus (ex-PlayerPlus) of Spain
and the Netherlands.

Today it is an **interactive demo with fictional data**: no sign-in, nothing is sent to anyone, changes stay
in the visitor's browser. Public demo: https://coach-scpace.vercel.app/demo

## Documentation

| File | Read it for |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Working rules for Claude Code and contributors |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | What CoachSpace is, for whom, the core loop, what is in and out |
| [`docs/DEMO_SPEC.md`](docs/DEMO_SPEC.md) | What every screen of the demo should contain |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | The current phase and the next steps |
| [`docs/STRATEGY.md`](docs/STRATEGY.md) | Competitors (TeamPlus, Teamy, Spond…), market, pricing hypotheses |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How the code is organised |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Decisions in force and new decisions |
| [`docs/DEMO_CONTENT_SOURCES.md`](docs/DEMO_CONTENT_SOURCES.md) | Fictional content and photo licences |
| [`tests/e2e/README.md`](tests/e2e/README.md) | Browser scripts and audits |

## Run locally

Requires Node.js 22 and npm. From the project folder:

```bash
npm install
npm run dev        # then open http://localhost:3000
```

## Checks

```bash
npm run check      # lint, typecheck, unit tests and build
```

Individual checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Demo examples

The welcome screen (`/demo`) offers one example per sport: **Tennis** (an independent coach at two venues),
**Football** (an academy) and **Basketball** (a club). A direct link opens one example at once:
`/demo?sport=tennis` (or `football`, `basketball`). Switch or reset the example in **Settings → Demo**.

## Deployment

Every pull request gets a Vercel preview; `main` deploys to production. CI runs the checks on every pull request.
