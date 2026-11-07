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
| D-077 | 2026-11-07 | **S1 removals.** Besides the items listed in S1, the code that only existed for them goes too: the sport-specific words ("Instructor", "class", renamed plan blocks) and the exercise safety note, which only Pilates used; the unused tactics-board cover drawings and their colours; the activity bell's rules (only "sessions without a register" is kept, in `attendance.ts`, for "Registers to take"); the old dashboard, its figures and its widgets. Settings becomes one page with the Demo section (Language is added in S7). Saves from before still load: their old `features` and `claps` fields are simply no longer read. |
| D-078 | 2026-11-07 | **S2 Home and session page.** The read-only plan view is its own page (`/calendar/<id>/plan` for the coach, `/me/calendar/<id>/plan` for the player, one component) and shows only real YouTube/Vimeo videos, never search links. The pinned announcement each viewer closed is kept in the demo store (`hiddenPins`, per scenario, cleared by Reset). Home no longer links to the month calendar (it is in Profile). The player's group page `/me/groups/<id>` is removed: its only entry was the group card under the session, which DEMO_SPEC removes. The coach's cancel stays a two-step confirmation with an optional reason. |
| D-079 | 2026-11-07 | **S3 Groups.** A group's attendance is the share of "present" marks in its saved registers (season average and the list's "Attendance 84%"); "Missed most" lists up to three players with at least one absence, lowest attendance first. The register log (`AttendanceLog`) is one component, reused by the Attendance page in S6; a row opens the session's saved register. The group-first assign page and its rule are removed; the Exercises tab lists what is assigned and links to the Library, where the single assign flow lives (finished in S4). Announcements are no longer a group tab: they live in Messages, filterable by group. |
| D-080 | 2026-11-07 | **S4 Library and plans.** A plan has a group (or "Any group") and the list of sessions it is used in (`sessionIds`); a session has one plan at most, so "Use in session" takes the session off its previous plan. "Use in session" offers the next 12 sessions of the plan's group (of every group for "Any group"). Templates are gone: the scenarios' former templates are ordinary plans, and the seeded plan is used directly in its group's next session (a copy when a plan is already used). Saves from before are converted when read (`migrateSavedPlans`). The single assign flow is the exercise's Assign page; from a group's Exercises tab the Library opens with "Choose an exercise to assign to <group>" and that group starts chosen. The per-group "Edit" links on the exercise page go (the one Assign button covers editing). The sport filter is removed from the Library and from the list rules. |
| D-081 | 2026-11-07 | **S5 Lifts.** Rules in `src/data/lifts.ts`: one offer per driver and session (offering again replaces it), 1–8 seats, a departure time and a note of up to 120 characters; a person is in one car at most and a driver never rides; joining or being taken ("I can take you") ends that person's request; only the driver removes an offer. The store keeps the lifts per scenario with one generic `updateLifts(rule)`. Example lifts are seeded in the browser on the next session of the first group and of the demo player's first group (the demo player is never in them). The session pages lose their footer demo line so the Lifts line is the only one; no lifts on a cancelled session. |
| D-082 | 2026-11-07 | **S6 Calendar, Profile, Attendance, Create.** The Calendar is the month grid with the selected day below on every screen size (the week board, the phone agenda, the upcoming list and the player's calendar page `/me/calendar` are removed); its one primary action is New session, and changing a session happens on the session page (no Reschedule buttons in the day list). Profile keeps the `/more` address, shows the coach's name and avatar and the three links; the sidebar's secondary list is labelled Profile. The Attendance page lists the registers of the last 14 days still to take, then the log by date for every group with chips (the same `AttendanceLog` as the group tab). Create has exactly New session, Announcement, Invite players and New group. "Reset demo data" lives only in Settings → Demo (it was also in the Library and Announcements). |
| D-083 | 2026-11-07 | **S7 Language.** No library: `src/i18n/en.ts` and `es.ts` (same keys, checked by a unit test with the same `{placeholders}`), `t(key, params)` and `tn(key, count)` for plurals in `src/i18n/index.ts`. The active language is a module binding like the demo scenario: the server and first render are English, `LanguageProvider` applies the language saved in this browser (`coachspace-language`) before the first paint and mounts the app again, so components and the pure data rules (labels, validation messages, counts, countdowns) and the dates (`Intl` with en-GB / es-ES) all switch together; `<html lang>` follows. Settings → Language has English / Español. Not translated, on purpose: the fictional demo content (group, exercise and session names, announcements, chat messages, the example lifts' notes), which is data, and the browser-tab titles set by the server. |
| D-084 | 2026-11-07 | **S8 Check and document.** `tests/e2e/screenshots.mjs` makes the DEMO_SPEC screenshots (390 and 1440 px, English and Spanish, Tennis Coaching on 14 October 2026) and checks the coach's Home is about two phone screens tall; it runs with the other scripts in `run-all.sh`. The screenshots are not committed (they are re-created on demand and shared with the owner). `ARCHITECTURE.md` is rewritten to match the code. |
