# Browser tests (manual)

Scripted Playwright checks of the main demo flows, run in a mobile (390×844) and a desktop
(1280×800) viewport with the browser clock fixed at Wednesday 14 October 2026, 12:00 (Madrid). They use the default demo
scenario, Tennis Coaching (D-053), unless a script activates another one. `newPage()` makes each page a
returning visitor (Tennis Coaching already chosen, dashboard introduction closed, D-055); pass
`{ fresh: true }` to start as a first-time visitor, as `scenarios.mjs` does. Run several builds side by
side with `E2E_PORT=<port>` (default 3100).

They are **not** part of `npm test`, `npm run check` or CI, and Playwright is **not** a project
dependency. They follow the simplified demo of phase 1 (`DEMO_SPEC.md`, steps S1–S8): the coach's Home, Groups,
Library and Messages with the + in the middle; Calendar, Attendance and Settings through Profile (the avatar on
phones, the sidebar on desktop, `openSecondary()` in `lib.mjs`); the player's Home, Exercises and Messages. The
scripts run in English (the default); `settings.mjs` and `screenshots.mjs` also check Spanish.

| Script | Covers |
|---|---|
| `chat-page.mjs` | Chat layout: list and conversation side by side from 1024 px, separate pages on phones, search, keyboard sending, simulated labels, participant view |
| `chat.mjs` | Chat list, group and one-to-one conversations, simulated sending |
| `unread.mjs` | Unread badges and marking as read |
| `calendar.mjs` | Home and calendar coherence, the month view and a session's details |
| `calendar-page.mjs` | Calendar (D-076) at 390, 768 and 1280 px: month only, one New session on the selected date, the grid with group colours and the day list, month navigation, Today, keyboard selection, cancelled colours, `?group=`, Profile as the current item, no player calendar |
| `attendance-page.mjs` | Attendance page (D-076): Registers to take, the log by date per group with chips, taking a register, the log updated and a row opening for correction, the player view (own percentage only) |
| `attendance.mjs` | Taking and correcting attendance, group rosters |
| `announcements-page.mjs` | Announcements board: cards, filter, side form from 1280 px or the New announcement page, honest confirmation, participant read-only announcements |
| `announcements.mjs` | Announcement board, filter and posting |
| `library-page.mjs` | Library (D-076): navigation, tabs Exercises and Plans, one list of rows and their links, search and category filters (no sport filter), empty state, keyboard, exercise detail with Edit and one Assign, the Plans list (group, minutes, sessions used in) and New plan |
| `library.mjs` | Exercise library, create/edit, assign to groups |
| `workflow.mjs` | Session changes, cancel/restore, the read-only plan in the session and its plan view, a change made in Library shown in the session, Duplicate and Use in session, coach notes |
| `participant-page.mjs` | Player Home (next sessions with the one-tap answer, the pinned announcement, exercises preview), the Exercises list and filters, the video page, no coach actions |
| `participant.mjs` | Participant view (`/me`) |
| `ux.mjs` | Month calendar, the Messages badge (not repeated on Home), the register only once a session has started, registers to take, back navigation for coach and player |
| `settings.mjs` | Settings page: navigation, only Demo and Language (no Coming soon, no switches), the three scenarios, Reset demo data with a confirmation, switching to Español (navigation, Home, `<html lang>`, kept after a reload) and back to English |
| `calendar-filter.mjs` | Calendar group filter: all by default, select one or several, deselect, clear, restore, empty states, the grid and the day list, across months and after opening a session, persistence after reload, reset, keyboard (Space, Escape), phones |
| `groups.mjs` | Groups: one list of rows with size, schedule and next session, New group, group page header with Invite as the one primary action, sections, participant search, side list from 1280 px, participant group page (D-073) |
| `group-admin.mjs` | Demo group management (D-072): New group with checks per field and one session per day, the new group's page, Add member with a guardian, the Invite sheet (fictional link, Copy link, QR placeholder, demo line, Escape), the new group on Home and in the session pages from its first day only, Edit group, kept after a reload, not shown in another scenario |
| `lifts.mjs` | Lifts (D-076): the example lifts, one demo line, Offer a lift with its checks, I can take you, Remove offer, Join and Leave as the player, a full car, Need a lift and Withdraw, kept after a reload, empty state, none on a cancelled session |
| `rsvp.mjs` | "Are you coming?" (D-071): the player's one-tap Going / Maybe / Can't go on Home and the session page, taking an answer back, kept after a reload, the coach's Who's coming, "Remind N who haven't replied" prepared and never sent, a new register pre-filled from the answers, no answers on a cancelled session |
| `scenarios.mjs` | Welcome screen and demo scenarios (D-053, D-055), as a first-time visitor: / opens the welcome screen without app navigation, deep links are not redirected, each of the three cards opens its scenario, back and forward, reload, the dashboard introduction and closing it for good, Settings → Demo switcher, every page following the active scenario (dashboard, groups, calendar and filter, library, announcements, chat, attendance, participant view), separate saved data per scenario, resets with confirmation (reset all returns to the welcome screen), stale data |
| `coach-to-participant.mjs` | Plans used in the next sessions and shown read-only to players (same plan view, no Edit), and the one assign flow from a group's Exercises tab reaching the player (D-076) |
| `change-preview.mjs` | After cancelling, moving or restoring a session: the honest notice, no preview card, the small links (Reschedule or move, Cancel session, See it as a player), the player's view of the same change and the way back, reload, a group without the demo player, and reset (D-076) |
| `isolation.mjs` | Visitor isolation with two independent browser contexts (Tennis and Basketball): changes saved per visitor, reloads, one visitor's reset leaves the other untouched, no cross-scenario contamination when switching, repeated resets without duplicates, and two tabs of one profile that stay in step instead of overwriting each other (D-066). Uses the mobile viewport only |
| `future-date.mjs` | The clock on 10 November 2026: dashboard, chat, a conversation, announcements and the participant home of all three scenarios show no October date and no seeded message as "Today", with no hydration errors (D-062). Mobile viewport only |
| `direct-link.mjs` | `/demo?sport=<id>` for the three scenarios: opens the dashboard without showing the cards, kept after a reload, Back does not reopen the link, a link wins over the example explored before; invalid values show the welcome screen and choose nothing; a plain first visit is unchanged (D-065) |
| `return-visit.mjs` | Opening the link again (D-068), with one browser profile and several tabs: the first visit, a reload and the Dashboard link keep the dashboard; a new tab opening `/` shows the three sports with the example explored before marked; saved changes are still there; another sport can be chosen; deep links and direct links are not redirected |
| `security.mjs` | Security headers on pages, an on-demand session page, a script file and a 404; a full visit contacts only this site with no Content Security Policy violations; malformed saved data still shows every page; a saved `javascript:` link is shown as text; unknown addresses get the not-found page (D-069). Mobile viewport only |
| `coach-journey.mjs` | A coach opening the email link on a phone, as realistically as a script allows (D-070): mobile Chrome profile with touch taps, 4× CPU slowdown, slow 4G, the real clock, human pauses and typing. Taps a sport before the page has loaded, follows the demo guide, cancels and restores a session and sees it as a player, takes attendance from Home's "registers to take", writes in the chat, answers "Going" with one tap in the participant view, switches sport in Settings, and opens the link again. Every step is timed; one over `STEP_LIMIT_MS` (default 3,000) fails |
| `perf.mjs` | Interaction timing on a simulated phone (4× CPU, slow 4G): tap-to-feedback and tap-to-result for navigation, the calendar filter, sessions, Settings, the demo view, Settings → Demo and the welcome screen (D-054, `docs/PERFORMANCE.md`). Prints a table; not a pass/fail test, so `run-all.sh` skips it |
| `home.mjs` | Coach Home (D-076): Home title, the next seven days from today without repeating the card's session, the pinned latest announcement (opens Messages, × hides it until a newer one), the next-session card opening the session as a whole while Remind keeps its action, only "registers to take", the group filter, a row opening the session page; no week strip, no session sheet |
| `screenshots.mjs` | Screenshots of the main screens of DEMO_SPEC at 390 and 1440 px in English and Spanish (JPEG in the output folder), each page in the right language, and the coach's Home about two phone screens tall |

Load smoke test (not a browser script, not run by `run-all.sh`): with a production build running,
`node tests/load/load.mjs 5000 300` sends 5,000 requests with 300 at a time to pages, session pages
and scripts, and prints status codes and response times.

## Audits (`audit/`)

| Script | Covers |
|---|---|
| `audit/layout.mjs` | The main routes at 360, 390, 768, 1024 and 1440 px: no horizontal overflow, one visible main navigation, sidebar from 1024 px and bottom bar below, nothing hidden behind the bottom bar (content in inner scroll areas excluded), no console errors |
| `audit/contrast.mjs` | WCAG AA contrast of every visible text element on the main routes at 390 and 1440 px, measured against its real background (text in disabled controls, hidden or transparent elements excluded) |
| (all audits) | `SCENARIO=football` (or `basketball`) runs an audit with that demo scenario; the default is Tennis Coaching |
| `audit/layout.mjs` in Spanish | `LANGUAGE=es` runs the layout audit with the interface in Spanish (longer words); `run-all.sh` does this once for Tennis Coaching |
| `audit/links.mjs` | Follows every visible internal link from the coach and participant pages and reports pages that fail or show "not found" |

## How to run

Needs Playwright with Chromium installed outside the project (for example `npm install -g playwright`
and `npx playwright install chromium`).

Everything at once (builds, starts the app on port 3100, runs every script and audit, prints a
summary and exits with an error if anything fails):

```sh
sh tests/e2e/run-all.sh /tmp/e2e-out
```

One script:

```sh
npm run build
mkdir -p /tmp/e2e-out
sh tests/e2e/serve.sh /tmp/e2e-out
PW=$(npm root -g)/playwright node tests/e2e/ux.mjs /tmp/e2e-out
PW=$(npm root -g)/playwright node tests/e2e/audit/contrast.mjs
```

Each script prints `PASS`/`FAIL` lines and ends with `ALL PASSED` or `N FAILED`; screenshots are
written to the output folder. Each viewport uses a fresh browser context, so demo data saved by one
run never affects the next.

Since the redesign's app shell (D-040 step 2), use `mainNav(page)` from `lib.mjs` for the visible main
navigation (the sidebar from 1024 px, the bottom navigation below) and scope other selectors to
`main` when the header or sidebar could match too (for example the "New session" button).

After the redesign, selectors that depend on text, roles or structure (for example
`section:has(h2:text('Attendance'))`) may need updating together with the screens. Update the
tests when a flow changes on purpose; do not weaken them to hide a regression.
