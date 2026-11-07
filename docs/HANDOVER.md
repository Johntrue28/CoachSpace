# CoachSpace — Session Handover

Snapshot of the project state on 2026-10-14 (updated after the pre-outreach polish, D-062 to D-066, and on 2026-11-06 after the event-centred redesign, D-071 to D-073), after the Figma redesign (D-040, steps 1–12), the
Calendar group filter (D-047), the demo scenarios and mobile speed work (D-053, D-054, merged in #32)
and the definitive demo work (D-055 to D-061: welcome screen, attendance for phones, plans shared
with participants, group-first assignment, saved demo chat, honest video links). It is written so a new session can continue safely. The current phase is
recorded in `docs/ROADMAP.md`; decisions in `docs/DECISIONS.md`.

## 0. Update of 6 November 2026 — event-centred redesign (D-071)

The redesign is a chain of pull requests, each stacked on the previous one; merge them **in this order**, each after checking its preview:

1. #38, branch `claude/teamplus-path-redesign`: the strategy pack `docs/strategy/teamplus-path/` and steps R1–R6. These are the RSVP answers, the four-place navigation with the demo switch in the header, the Agenda home, "Who's coming" on the session page with a demo reminder, the register pre-filled from answers, the player agenda with one-tap answers, and the Chats/Announcements switch under Messages.
2. #39, branch `claude/sharp-keller-xg9nvh`: step R7, demo group management (D-072). It adds New group, Edit, Add member (with an optional guardian) and Invite (a fictional link and a QR placeholder; nobody is invited).
3. #40, branch `claude/sharp-keller-xg9nvh-r8`: step R8, the visual pass (D-073). Lists become rows of one surface, each screen has one primary action, and phones show the calendar as an agenda.
4. The R10 pull request, branch `claude/sharp-keller-xg9nvh-r10`: the browser scripts in `tests/e2e/` follow the new navigation (with the new `agenda.mjs`, `rsvp.mjs` and `group-admin.mjs`), and this handover, `ARCHITECTURE.md` and the README are updated.

All four were merged on 7 November 2026. Then step R11, the visual polish the owner asked for after
a review of TeamPlus, Strava and TeamSnap (D-074), on branch `claude/sharp-keller-xg9nvh`: palette B (court
blue and lime), a colour per group, the week strip and the next-session card with photos on the Agenda,
the session sheet, the coach's Create (+) menu, group tabs with claps, swipe to answer and "My season" for
the player, short animations and illustrated empty states. Photos and licences: `DEMO_CONTENT_SOURCES.md` §4.

R9 (Spanish and Dutch) waits for the owner to change `CLAUDE.md` §3. The plan and its status are in `docs/strategy/teamplus-path/05-demo-redesign-plan.md`.

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
- **Demo scenarios and mobile speed (D-053, D-054)** were merged into `main` through #32 (13 October 2026,
  with the owner's permission to merge each step).
- **Definitive demo (D-055 to D-061)** was merged into `main` through #33 (13 October 2026). The audit
  follow-up is `docs/AUDIT_FOLLOW_UP.md`.
- **Post-demo audit and email-first proposal** (`docs/POST_DEMO_AUDIT.md`) was merged through #34
  (14 October 2026). It is a proposal: no decision was changed by it.
- **Pre-outreach polish (D-062 to D-066)**, fixing audit findings R-03, R-04, R-05 and R-08 and
  syncing tabs, then the welcome screen on every new visit (D-068) and the security and load review
  (D-069), are on branch `claude/relaxed-albattani-hoes7y`, **not merged**. Results are in
  `POST_DEMO_AUDIT.md` §16 and §17.
- Always start new work from `origin/main`.

## 2. What exists

Status means "implemented and checked" (unit tests, CI, the browser scripts and audits in
`tests/e2e/`), not "validated with coaches".

| Area | Status | Notes |
|---|---|---|
| App shell | Done (redesigned) | Four places (Agenda, Groups, Library, Messages); Calendar, Attendance and Settings in the desktop sidebar's "More" list and in the avatar menu (`/more`) on phones; activity bell on desktop; Coach/Player demo switch in the header (D-029, D-040, D-041, D-071) |
| Coach Agenda (home) | Done | The next seven days with who is coming, group filter, at most two "needs you" items, dismissible demo guide (D-071). The dashboard of D-044 is kept in the code, unused |
| "Are you coming?" (RSVP) | Done, simulated | Going / Maybe / Can't go per member and session, seeded for the fictional members, the visitor's answers saved per scenario; Who's coming and a reminder that is prepared, never sent; registers start from the answers (D-071) |
| Welcome screen | Done | First visit to `/` opens `/demo`: four sport cards; choosing one opens its dashboard (D-055) |
| Settings | Done | Demo (scenario switcher, resets), Features (global attendance switch), General and Notifications "Coming soon" (D-042, D-043, D-055) |
| Calendar | Done | The month as an agenda below 768 px and as a grid with the selected day and group codes from 768 px, week board, Today, colours by state, multi-group filter saved in the browser, upcoming sessions (D-045, D-047, D-061, D-073) |
| Session management | Done | One-off sessions, reschedule/move, change place/title, cancel/restore (D-031) |
| Groups and participants | Done | One list of rows, group page with Invite as the primary action, side list from 1280 px (D-046, D-073) |
| Coach group management | Done, simulated | New group, Edit, Add member with an optional guardian, Invite with a fictional link and a QR placeholder; saved per scenario in this browser; nobody is invited (D-072) |
| Exercise Library and Session plans | Done | Search, sport and category filters, cards, exercise page, assignments (exercise-first and group-first), templates and plans, plans prepared for the next sessions, search links labelled as searches (D-028, D-032, D-048, D-057, D-058, D-059) |
| Chat | Done, simulated | List and conversation side by side from 1024 px; typed messages and read state saved in this browser per scenario, never delivered (D-049, D-060) |
| Announcements | Done | Board, filter, form beside the list, participant read-only page; saved in the browser (D-025, D-050) |
| Attendance | Done | Global switch, group → session, form where everyone starts present with a sticky Save, saved attendance, corrections (D-027, D-036, D-042, D-051, D-056) |
| Coach notes | Done | "From last time" (D-033) |
| Participant view (`/me`) | Done | Jordan Hale: Agenda with one-tap answers, calendar with the coach's session plans, Exercises, Messages, group pages (D-029, D-052, D-058, D-071) |
| Design system | Done | Tokens in `globals.css` (D-039, D-041), shared UI in `src/components/ui/` |
| Demo scenarios | Done | Tennis Coaching (an independent coach at two venues, D-064), Football Academy, Basketball Club, Pilates Studio; chosen on the welcome screen, in Settings → Demo or with a direct link `/demo?sport=<id>` (D-065); each scenario saves its own changes (D-053, D-055) |
| Change preview | Done (branch) | After a cancel, move or new place, the coach's session page shows "What participants would see — demo preview" and opens the participant's view of the same session (D-063) |
| Mobile speed | Done | Pages built in advance and prefetched; session pages cached after their first visit; loading placeholder (D-054, `PERFORMANCE.md`) |

## 3. Demo limitations (must stay honest in the UI)

- No backend, no real authentication, no notifications, no payments, no real-time features.
- The Coach/Participant switch is a demo view, not a sign-in. Hiding screens is not access control.
- Coach edits (exercises, assignments, announcements, attendance, calendar changes, plans, notes,
  groups and members created or edited in the demo, "Are you coming?" answers and prepared reminders,
  the attendance switch and the calendar group filter) are saved in this browser's `localStorage`
  only, per scenario (key `coachspace-demo-v2:<scenario>`; the chosen scenario is `coachspace-scenario`),
  and cleared by "Reset demo data" (active scenario) or "Reset all scenarios" (Settings → Demo). Nothing
  is shared between devices or users.
- The welcome screen (`/demo`) and Settings → Demo are not a sign-in and not protected.
- Scenario cover images are original illustrations, not photographs: no licensed photo could be
  downloaded or checked from the cloud session (`DEMO_CONTENT_SOURCES.md` lists candidates to check).
- Chat messages typed in the demo and the read state are saved in this browser per scenario (D-060).
  Sent messages are labelled "Not delivered (demo)" and never reach anyone.
- Exercise "videos" in the seed data are YouTube searches, labelled as such (D-057): no specific video
  could be checked from the cloud session.
- Groups, participants and the weekly schedule are fictional data per scenario; groups and members added
  or edited in the demo are kept on top of them in this browser (D-072). A new group's sessions start on the
  day it was created; editing a scenario group's schedule changes every week shown. The invite link and QR
  code are pictures of how joining would work: they do not work and nobody is invited. Three weeks of
  attendance history and plans for the next sessions are seeded in the browser.
- Sessions are generated relative to today's date (D-026). Since D-062 the seeded messages,
  announcements, assignments, plans and notes are moved in the browser by whole weeks to the current
  week, so they stay a few days old. Changes a visitor saved keep the dates they had when saved.
- Opening `/` in a new tab always shows the welcome screen first (D-068); a reload keeps the dashboard.
- Taps on a phone never look ignored (D-070): card links work while the page loads, touch feedback,
  a progress bar for slow pages; measured in `PERFORMANCE.md` §7.
- Security headers, checks on saved data, an error screen and a not-found page protect the public
  link (D-069). There is no server data, account or secret to protect.
- Two tabs of the same browser share one storage: they show the same data and update each other
  (D-066). They are not separate visitors. Different browsers or devices share nothing.
- The navigation history lives in memory: after a reload, back links use the parent page.
- Not implemented on purpose: deleting groups or members, real invitations and sign-up, guardian accounts,
  editing/deleting announcements,
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

- **Owner decisions:** approve or reject D-053 to D-066 (all Provisional) and the email-first proposal
  (D-067, To decide); the checklist is in `POST_DEMO_AUDIT.md` §16.
- **Owner-only release steps** before the first email: a correctly spelt Vercel alias (D-020), the
  phone walkthrough, and checking the Vercel plan terms (`POST_DEMO_AUDIT.md` §16).
- **Videos:** pick and watch 3–5 public coaching videos to replace the tennis search links; candidates
  (unverified) are in `DEMO_CONTENT_SOURCES.md` §1.
- Optional: replace the scenario illustrations with licensed photographs (`DEMO_CONTENT_SOURCES.md` §4).

- **Phase 1 quality and demonstration:** a walkthrough of the deployed version, a three-minute demo
  script, and showing the demo to coaches (see the roadmap).
- **Redesign:** merge #38, #39, #40 and the R10 pull request in order after checking each preview on a phone;
  R9 (Spanish and Dutch) after the owner changes `CLAUDE.md` §3.
- D-020: the repository name and the Vercel URL contain a typo ("Scpace"). Decide before sharing.
- D-017: Next.js 16 upgrade (remaining `npm audit` findings), to decide.
- Before any real pilot (Phase 3): data model and access rules, Supabase, authentication, server and
  database permissions, GDPR and safeguards for minors. None of this exists yet.
