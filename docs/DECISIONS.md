# CoachSpace — Decisions in force

> The decisions that still apply, rewritten as one short list on 7 November 2026. The full history
> (D-001 to D-074, with the reasons at the time) is in Git: `git show c6a9446:docs/DECISIONS.md`.
> Add new decisions at the end of the log in §3 with the next number.

## 1. Product and scope

- **Demo only.** Fictional data, no backend, no real sign-in, nothing sent to anyone. Simulated actions say so.
- **Target:** coaches with several groups and sports schools; Spain first, the Netherlands for validation (`STRATEGY.md`).
- **Core loop:** sessions from weekly schedules → players answer Going / Maybe / Can't go → the coach sees
  who is coming and reminds non-responders (simulated) → changes are made once → the register starts from the answers.
- **Differentiator:** exercise library, plan inside each session, notes from last time, exercises assigned to a group or a player.
- **Three example sports:** tennis/padel (an independent coach at two venues), football (academy), basketball (club).
- **Players never pay and never see ads.** No billing code in the product until 3 coaches have paid outside the app.
- **No gamification** (claps, streaks, swipe cards). The player sees only their own attendance percentage.
- **Simplicity rule:** a new feature needs a real coach asking for it or a place in the core loop.

## 2. Design and technology

- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Node 22, GitHub, Vercel. Supabase and Expo are
  proposals for Phase 3 and need the owner's approval.
- **Navigation:** coach — Home, Groups, (+) Create, Library, Messages; the avatar opens Profile with Calendar,
  Attendance, Settings. Player — Home, Exercises, Messages. Coach/Player demo switch in the header.
- **Plans** are created and edited in Library (Plans tab) and assigned to sessions; in a session the plan is read-only.
- **Lifts (carpool)** in every session: offer seats, join, ask for a lift. Simulated and saved in the browser.
- **Look:** palette B "Pista" (court blue `#1d4ed8`, lime accent `#d4f53c` with navy text, navy `#0b1f4d`),
  six accessible group colours, Pexels photographs (licences in `DEMO_CONTENT_SOURCES.md`), WCAG AA contrast,
  touch targets of at least 44 px, mobile first.
- **Language:** UI in British English by default with Spanish selectable in Settings; code and docs in English.
- **Data:** rules are pure TypeScript modules in `src/data/` with unit tests; React stores only hold state.
  Each example sport saves its changes in this browser under its own key; malformed saved data falls back to
  the seed. Seed content is written for the week of 12 October 2026 and moved to the current week in the browser.
- **Sessions** are generated from each group's weekly slots; changes are stored as overrides and one-off sessions.
- **Attendance** is always on; a new register starts with "Can't go" answers as absent and everyone else present.
- **Videos** are YouTube or Vimeo links only; a search link is never shown as a video.
- **Welcome screen** (`/demo`) on every new visit; direct links `/demo?sport=<id>`.
- **Security headers** and checks on saved data for the public link (`next.config.ts`, `src/data/saved-state.ts`).

## 3. Log of new decisions

| # | Date | Decision |
|---|---|---|
| D-075 | 2026-11-07 | **Simplification and documentation reset**, approved by the owner. PR #42 merged; then simplify to `DEMO_SPEC.md`: remove Pilates, gamification (keep the player's attendance %), the activity bell, the global attendance switch, "Coming soon" settings, the week strip and week board, the session sheet, templates and the plans list (plans list restored by D-076), the group-first assign page; keep Agenda and a month-only Calendar as separate pages; keep group and one-to-one chat; add Spanish as a selectable language. Docs reduced to PRODUCT, DEMO_SPEC, STRATEGY, ROADMAP, ARCHITECTURE, DECISIONS and DEMO_CONTENT_SOURCES. |
| D-076 | 2026-11-07 | **Owner's additions to the demo spec.** Agenda renamed **Home** (coach and player); whole cards and rows open the session; the latest announcement is pinned on everyone's Home; the group link card under Who's coming is removed; **Open plan** shows a read-only, easy-to-read plan; **plans are created and edited in Library → Plans** and assigned to sessions (reverses the D-075 removal of the plans list; no separate templates); **Lifts (carpool)** added at the bottom of every session for coach and players (offer, join, ask); the avatar opens **Profile** with Calendar, Attendance and Settings (no personal profile page); **Attendance** shows a log by date per group, and each group page gets an Attendance tab; the group form and calendar session creation stay as they are. Overviews must be easy to read, not bare. |
