# CoachSpace — Session Handover

Snapshot of the project state on 2026-10-12, after the Figma redesign (D-040, steps 1–12), the
Calendar group filter (D-047), and the demo scenarios with the Demo Studio plus the mobile speed work
(D-053, D-054; draft pull request awaiting the owner's approval). It is written so a new session can continue safely. The current phase is
recorded in `docs/ROADMAP.md`; decisions in `docs/DECISIONS.md`.

## 1. Git and deployment state

- Everything is merged into `main` through pull requests. The redesign PRs are #18–#23, then #24
  (Calendar group filter), #25 (Library), #26 (Chat), #27 (Announcements), #28 (Attendance),
  #31 (participant view; it replaced #29 after Vercel kept failing instantly on that branch name,
  while the same commits deployed from another branch) and #30 (final QA and documentation).
- GitHub CI (lint, typecheck, unit tests, build) runs on every pull request and on `main`.
- Vercel builds a preview for every pull request and deploys `main` to production
  (https://coach-scpace.vercel.app). The cloud sessions that built the redesign could not open
  `vercel.app` (network policy), so the previews were only checked through their GitHub status
  ("Deployment has completed"), never looked at. **Check production by hand.**
- Some feature branches could not be deleted from the cloud session (the git proxy refuses branch
  deletion). They are fully merged and safe to delete on GitHub: see the final report of the session
  or the "Branches" page of the repository.
- **Demo scenarios, Demo Studio and mobile speed (D-053, D-054)** are on branch
  `claude/relaxed-albattani-hoes7y` in a draft pull request. They are **not merged**: the owner reviews the
  Vercel preview first. Until it is merged, `main` still has the single mixed-sport data set.
- Always start new work from `origin/main`.

## 2. What exists

Status means "implemented and checked" (unit tests, CI, the browser scripts and audits in
`tests/e2e/`), not "validated with coaches".

| Area | Status | Notes |
|---|---|---|
| App shell | Done | Sidebar from 1024 px, bottom navigation and `/more` below; activity bell ("Activity in this demo"); Coach/Participant demo switch (D-029, D-040, D-041) |
| Coach dashboard | Done | Greeting, three figures from the data, next and upcoming sessions, new messages, groups, quick actions, month widget, attendance overview, announcements (D-044) |
| Settings | Done | Features (global attendance switch), General with Reset demo data, Notifications "Coming soon" (D-042, D-043) |
| Calendar | Done | Month grid with the selected day, week board, Today, colours by state, multi-group filter saved in the browser, upcoming sessions (D-045, D-047) |
| Session management | Done | One-off sessions, reschedule/move, change place/title, cancel/restore (D-031) |
| Groups and participants | Done (read-only) | Cards, group page with actions and sections, side list from 1280 px (D-046) |
| Coach group management | **Not started** | Create/edit groups and members; planned as its own task |
| Exercise Library and Session plans | Done | Search, sport and category filters, cards, exercise page, assignments, templates and plans (D-028, D-032, D-048) |
| Chat | Done, simulated | List and conversation side by side from 1024 px; messages and read state in memory only (D-024, D-030, D-049) |
| Announcements | Done | Board, filter, form beside the list, participant read-only page; saved in the browser (D-025, D-050) |
| Attendance | Done | Global switch, group → session, form, saved attendance, corrections (D-027, D-036, D-042, D-051) |
| Coach notes | Done | "From last time" (D-033) |
| Participant view (`/me`) | Done | Jordan Hale: home, calendar, My Videos, chat, group pages, announcements (D-029, D-052) |
| Design system | Done | Tokens in `globals.css` (D-039, D-041), shared UI in `src/components/ui/` |
| Demo scenarios and Demo Studio | Draft PR, awaiting approval | Tennis Club (default), Football Academy, Basketball Club, Pilates Studio; `/demo` to preview, activate and reset; each scenario saves its own changes (D-053) |
| Mobile speed | Draft PR, awaiting approval | Pages built in advance and prefetched; session pages cached after their first visit; loading placeholder (D-054, `PERFORMANCE.md`) |

## 3. Demo limitations (must stay honest in the UI)

- No backend, no real authentication, no notifications, no payments, no real-time features.
- The Coach/Participant switch is a demo view, not a sign-in. Hiding screens is not access control.
- Coach edits (exercises, assignments, announcements, attendance, calendar changes, plans, notes,
  the attendance switch and the calendar group filter) are saved in this browser's `localStorage`
  only, per scenario (key `coachspace-demo-v2:<scenario>`; the chosen scenario is `coachspace-scenario`),
  and cleared by "Reset demo data" (active scenario) or in the Demo Studio. Nothing is shared between
  devices or users.
- The Demo Studio (`/demo`) is a presenter tool. It is not in the navigation but it is not protected.
- Scenario cover images are original illustrations, not photographs: no licensed photo could be
  downloaded or checked from the cloud session (`DEMO_CONTENT_SOURCES.md` lists candidates to check).
- Chat messages and read state live in memory only and reset on reload (D-024, D-030). Sent
  messages are labelled "Not delivered (demo)".
- Groups, participants and the weekly schedule are fixed fictional data per scenario. Two weeks of
  attendance history are seeded in the browser.
- Sessions are generated relative to today's date (D-026); seed chat and announcements have fixed
  dates (8–11 October 2026).
- The navigation history lives in memory: after a reload, back links use the parent page.
- Not implemented on purpose: creating groups or participants, editing/deleting announcements,
  starting new conversations, participant profiles, attendance statistics per participant, video
  uploads (videos are YouTube/Vimeo links only).

## 4. Architecture to preserve

- Demo scenarios (D-053): data in `src/data/scenarios/`; `applyScenario()` (`scenario.ts`) switches every
  data module at once; `ScenarioProvider` (`scenario-store.tsx`) applies the saved scenario and mounts the
  app again on a change. Server components must not read scenario data (see `ARCHITECTURE.md`).
- `src/data/` holds the data and the rules as plain modules (unit tested): `calendar.ts` and
  `schedule.ts` (the only source of sessions), `calendar-filter.ts`, `attendance.ts`, `activity.ts`,
  `dashboard.ts`, `unread.ts`, `plans.ts`, `notes.ts`, `exercises.ts`, `features.ts`.
- `src/data/store.tsx` (demo store), `chat-store.tsx` (chat) and `persistence.ts` (the only
  `localStorage` access) are what a backend would replace.
- `src/components/navigation/`: in-app history and `BackLink`; never hard-code back routes.
- `src/components/ui/`: Button, Card, Badge, EmptyState, StatusMessage, PageHeader. Use them instead
  of copying class strings. Colours only through the tokens in `src/app/globals.css`.
- See `docs/ARCHITECTURE.md` for the full map.

## 5. How to check a change

```sh
npm run check                         # lint, typecheck, unit tests, build
sh tests/e2e/run-all.sh /tmp/e2e-out  # every browser script and the audits (needs Playwright)
```

The browser scripts and the audits (layout at 360, 390, 768, 1024 and 1440 px, WCAG AA contrast,
link crawl) are described in `tests/e2e/README.md`. They are run by hand, not in CI.

## 6. Pending work

- **Owner review of the draft pull request** for D-053 and D-054 (Vercel preview), then merge or changes.
- Optional: replace the scenario illustrations with licensed photographs (`DEMO_CONTENT_SOURCES.md` §4).

- **Phase 1 quality and demonstration:** a walkthrough of the deployed version, a three-minute demo
  script, and showing the demo to coaches (see the roadmap).
- **Coach group management** (create/edit groups and members), if coaches ask for it.
- D-020: the repository name and the Vercel URL contain a typo ("Scpace"). Decide before sharing.
- D-017: Next.js 16 upgrade (remaining `npm audit` findings), to decide.
- Before any real pilot (Phase 3): data model and access rules, Supabase, authentication, server and
  database permissions, GDPR and safeguards for minors. None of this exists yet.
