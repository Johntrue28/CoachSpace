# CoachSpace — Architecture

> How the code is organised after the phase 1 simplification (roadmap S1–S8, `DEMO_SPEC.md`).
> Rewritten in step S8 to match the code. Keep it short: update it when a rule here changes.

## 1. What it is

An interactive demo built with **Next.js (App Router), TypeScript and Tailwind CSS v4**, Node 22, deployed on
Vercel. There is no backend, no sign-in and no cloud storage: every change stays in the visitor's browser
(`localStorage`). Three fictional example sports (tennis, football, basketball). Interface in British English by
default and Spanish (es-ES) selectable in Settings.

## 2. Folders

```text
src/
  app/            Routes (thin server files that render one client component; see §4)
  components/     UI, by area (below)
  data/           Data, rules and stores (no UI)
  i18n/           Translation files and the language provider
tests/
  *.test.ts       Unit tests of the pure rules (Node's test runner, `npm test`)
  fixtures/       Mixed-sport test data used by some rule tests (not by the app)
  e2e/            Browser scripts and audits (Playwright, run by hand; see tests/e2e/README.md)
docs/             PRODUCT, DEMO_SPEC, ROADMAP, ARCHITECTURE, DECISIONS, STRATEGY, DEMO_CONTENT_SOURCES
public/photos/    Demo photographs (Pexels; licences in DEMO_CONTENT_SOURCES.md)
```

### Routes

| Route | Screen |
|---|---|
| `/` | Coach **Home**: pinned announcement, next-session card, registers to take, the next seven days |
| `/calendar/[id]` | **Session**: details, Who's coming, Plan (read-only), Register, Notes, Lifts, small change links |
| `/calendar/[id]/plan`, `/me/calendar/[id]/plan` | Read-only **plan view** (coach and player, one component) |
| `/calendar/[id]/edit`, `/calendar/new` | Change one session / add an extra session |
| `/calendar/[id]/attendance` | Take or correct a register (pre-filled from the answers) |
| `/calendar` | **Calendar**, month only, with the group filter (from Profile) |
| `/groups`, `/groups/[id]`, `/groups/new`, `/groups/[id]/edit` | Groups list; group page with tabs Players, Sessions, Attendance, Exercises; group form |
| `/library`, `/library/[id]`, `/library/new`, `/library/[id]/edit`, `/library/[id]/assign` | Exercises; the one assign flow (`?group=` from a group's Exercises tab) |
| `/library/plans`, `/library/plans/[id]` | Plans list; plan editor with Use in session and Duplicate |
| `/chat`, `/chat/[id]`, `/announcements`, `/announcements/new` | Messages: chats and announcements |
| `/more` | **Profile** (the avatar): Calendar, Attendance, Settings |
| `/attendance` | Registers to take and the attendance log by group |
| `/settings` | Demo (example and resets) and Language |
| `/me`, `/me/calendar/[id]`, `/me/videos`, `/me/videos/[id]`, `/me/chat`, `/me/chat/[id]`, `/me/announcements` | Player view |
| `/demo` | Welcome screen with the three sports; `/demo?sport=<id>` opens one directly |

### Components (`src/components/`)

`shell/` (sidebar, header, bottom bar, Create menu, Profile, navigation items in `sections.ts`), `home/`, `calendar/`
(session page, header, month grid, day list, filter, session form), `rsvp/` (answers and Who's coming), `plans/`
(plan card, plan view, plans list, editor, Use in session), `attendance/` (register form, `AttendanceLog`, Attendance
page), `notes/`, `lifts/`, `groups/`, `library/`, `participant/`, `chat/`, `announcements/`, `messages/`, `settings/`,
`demo/`, `errors/`, `navigation/` (back links and messages after forms) and `ui/` (buttons, cards, sheet, chips,
empty and loading states, photo).

### Data and rules (`src/data/`)

| Module | What it holds |
|---|---|
| `scenarios/` | The three fictional data sets (`tennis.ts` is the default), profiles for the welcome screen, loading on request |
| `scenario.ts`, `scenario-store.tsx` | Applies one scenario everywhere; remembers it; resets |
| `groups.ts`, `group-admin.ts` | Coach, groups, members; group and member forms (rules) |
| `calendar.ts`, `schedule.ts`, `use-sessions.ts` | Sessions generated from weekly slots; one-off sessions and changes |
| `rsvp.ts`, `use-rsvp.ts` | "Are you coming?" answers, summaries, register defaults |
| `attendance.ts`, `season.ts` | Rosters, seeded history, registers to take, the attendance log, group and player rates |
| `plans.ts`, `seed-plans.ts` | Plans (blocks, minutes, Use in session, Duplicate, the read-only timeline) |
| `lifts.ts` | Lifts: offer, join, leave, ask, take, remove, seed |
| `pinned.ts` | The latest announcement pinned on Home |
| `notes.ts`, `exercises.ts`, `library.ts`, `messages.ts`, `unread.ts`, `look.ts` | Notes, exercises and video links, library list rules, chat and announcements, unread counts, group colours and photos |
| `store.tsx`, `chat-store.tsx` | React stores: the visitor's changes (saved per scenario) |
| `persistence.ts`, `saved-state.ts` | The only module that touches `localStorage`; checks on saved data |
| `seed-dates.ts`, `scenario-link.ts`, `calendar-filter.ts` | Seed moved to the current week; direct links; calendar filter |

## 3. Rules

- **Pure rules, thin stores.** Every rule (what a summary says, who can join a car, which sessions need a register…)
  is a pure TypeScript function in `src/data/` with unit tests. The React stores only keep state and call the rules,
  so a future backend can replace the store actions without rewriting screens.
- **One source of data.** Pages read data through `src/data/` (`useDemoStore`, `useSessions`, `useRsvp`, the scenario
  bindings); sample data is never copied into components.
- **Scenarios** (D-053): one app, three data sets. Data modules keep `export let` bindings that `applyScenario()`
  changes all at once. The server and the first render use the default scenario; the browser applies the saved one
  before the first paint. Server components therefore never read scenario data.
- **Dates**: seed content is written for the week of 12 October 2026 and moved to the current week in the browser.
  Anything that depends on "today" is computed in the browser (`useNow`).
- **Saved data**: each scenario saves under its own key; malformed saved data falls back to the seed. Saves from older
  versions are converted when read (for example plans, D-080).
- **Language** (D-083): `src/i18n/en.ts` and `es.ts` hold every interface text with the same keys (a unit test checks
  keys and placeholders). Components and rules call `t(key, params)` or `tn(key, count)`; dates use `Intl` with the
  active locale. `LanguageProvider` applies the saved language before the first paint and mounts the app again. The
  fictional demo content (names, exercises, messages) is data and is not translated.
- **Honest demo**: anything that would reach another person (reminders, invitations, messages, lifts) says it is
  simulated, with at most one short demo line per screen.

## 4. Rendering

- Pages are built in advance (static) whenever they do not depend on data created in the browser. A page never reads
  `searchParams`; a client component reads the URL with `useSearchParams()` inside `<Suspense>`.
- Session pages (ids depend on the date) are rendered on their first visit; their `loading.tsx` gives immediate
  feedback.
- An inline script in `<head>` sends a new visitor of `/` to the welcome screen and hides the page while a saved
  scenario is applied.
- Security headers and the Content-Security-Policy live in `next.config.ts`.

## 5. Look

Palette B "Pista" (`globals.css` tokens: court blue `brand`, lime accent with navy text, navy), six accessible group
colours (`look.ts`), Pexels photographs, WCAG AA contrast, touch targets of at least 44 px, mobile first. Use the
components in `components/ui/` and the tokens; Tailwind's own colour palette is not used in components.

## 6. Checks

- `npm run check`: lint, typecheck, unit tests and build (also in CI on every pull request).
- `sh tests/e2e/run-all.sh <folder>`: builds, starts the app and runs every browser script and the layout, contrast
  and link audits for the three sports, plus the layout audit once in Spanish (see `tests/e2e/README.md`).
- `node tests/e2e/screenshots.mjs <folder>` (with the app running): the main screens at 390 and 1440 px in English and
  Spanish, and the height of the coach's Home.

## 7. Future backend

Not part of the demo. Before a real pilot (roadmap phase 3, needs the owner's approval): define the data model,
authentication and server-side access control (tested between coaches, groups and players), keep secrets out of the
client and review GDPR obligations for minors. The store actions are the boundary to replace.
