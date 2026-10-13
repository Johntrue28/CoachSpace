# Browser tests (manual)

Scripted Playwright checks of the main demo flows, run in a mobile (390×844) and a desktop
(1280×800) viewport with the browser clock fixed at Wednesday 14 October 2026, 12:00 (Madrid). They use the default demo
scenario, Tennis Club (D-053), unless a script activates another one.

They are **not** part of `npm test`, `npm run check` or CI, and Playwright is **not** a project
dependency (no new dependency was added). They were used to verify pull requests #7–#15 and every
step of the Figma redesign (#18–#31), and are kept so the same checks can be repeated after any change.

| Script | Covers |
|---|---|
| `chat-page.mjs` | Chat layout: list and conversation side by side from 1024 px, separate pages on phones, search, keyboard sending, simulated labels, participant view |
| `chat.mjs` | Chat list, group and one-to-one conversations, simulated sending |
| `unread.mjs` | Unread badges and marking as read |
| `calendar.mjs` | Calendar views and session detail |
| `calendar-page.mjs` | Calendar page: month grid and selected day, month and week navigation, Today, view switch, keyboard selection, week board, upcoming sessions, cancelled colours, group filter, participant view |
| `attendance-page.mjs` | Attendance page: group cards with reminders, session status, form summary and roster, saved attendance and correction, global switch, participant view |
| `attendance.mjs` | Taking and correcting attendance, group rosters |
| `announcements-page.mjs` | Announcements board: cards, filter, side form from 1280 px or the New announcement page, honest confirmation, participant read-only announcements |
| `announcements.mjs` | Announcement board, filter and posting |
| `library-page.mjs` | Exercise Library and Session plans: navigation, tabs, cards and their links, search, sport and category filters, empty state, keyboard, exercise detail, templates, New template |
| `library.mjs` | Exercise library, create/edit, assign to groups |
| `workflow.mjs` | Session changes, cancel/restore, session plans, coach notes |
| `participant-page.mjs` | Participant home sections and links, My Videos cards and filters, the video page, no coach actions or sections |
| `participant.mjs` | Participant view (`/me`) |
| `ux.mjs` | Month calendar, Home, compact unread badge, attendance context, back navigation |
| `features.mjs` | Global attendance switch: every entry point hidden when off, records kept, setting survives a reload, restored when on |
| `settings.mjs` | Settings page: navigation, attendance switch with confirmation and persistence, Coming soon sections, Reset demo data restores the default |
| `calendar-filter.mjs` | Calendar group filter: all by default, select one or several, deselect, clear, restore, empty states, month/week/day/upcoming consistency, persistence after reload, reset, keyboard (Space, Escape), participant view |
| `groups.mjs` | Groups: list cards with schedule and next session, group page header, actions and sections, participant search, side list from 1280 px, attendance switch, participant group page |
| `scenarios.mjs` | Demo Studio and demo scenarios (D-053): four cards, preview without changes, activation, every page following the active scenario (dashboard, groups, calendar and filter, library, announcements, chat, attendance, participant view), reload, separate saved data per scenario, return to the default, resets with confirmation, stale data, not in the navigation |
| `perf.mjs` | Interaction timing on a simulated phone (4× CPU, slow 4G): tap-to-feedback and tap-to-result for navigation, the calendar filter, sessions, Settings, the demo view and the Demo Studio (D-054, `docs/PERFORMANCE.md`). Prints a table; not a pass/fail test, so `run-all.sh` skips it |
| `dashboard.mjs` | Coach dashboard: greeting, figures from the demo data, upcoming sessions, quick actions, groups, attendance figures and card hidden when attendance is off and restored when on |

## Audits (`audit/`)

| Script | Covers |
|---|---|
| `audit/layout.mjs` | 33 routes at 360, 390, 768, 1024 and 1440 px: no horizontal overflow, one visible main navigation, sidebar from 1024 px and bottom bar below, nothing hidden behind the bottom bar (content in inner scroll areas excluded), no console errors; the activity panel (inside the screen, Escape, focus, closes after navigating); Settings section labels fit |
| `audit/contrast.mjs` | WCAG AA contrast of every visible text element on 35 routes at 390 and 1440 px, measured against its real background (text in disabled controls, hidden or transparent elements excluded), plus the activity panel |
| (all audits) | `SCENARIO=football` (or `basketball`, `pilates`) runs an audit with that demo scenario; the default is Tennis Club |
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
