# Browser tests (manual)

Scripted Playwright checks of the main demo flows, run in a mobile (390×844) and a desktop
(1280×800) viewport with the browser clock fixed at Wednesday 14 October 2026, 12:00 (Madrid). They use the default demo
scenario, Tennis Coaching (D-053), unless a script activates another one. `newPage()` makes each page a
returning visitor (Tennis Coaching already chosen, dashboard introduction closed, D-055); pass
`{ fresh: true }` to start as a first-time visitor, as `scenarios.mjs` does. Run several builds side by
side with `E2E_PORT=<port>` (default 3100).

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
| `scenarios.mjs` | Welcome screen and demo scenarios (D-053, D-055), as a first-time visitor: / opens the welcome screen without app navigation, deep links are not redirected, each of the four cards opens its scenario, back and forward, reload, the dashboard introduction and closing it for good, Settings → Demo switcher, every page following the active scenario (dashboard, groups, calendar and filter, library, announcements, chat, attendance, participant view), Pilates "class" wording, separate saved data per scenario, resets with confirmation (reset all returns to the welcome screen), stale data |
| `coach-to-participant.mjs` | Plans prepared for the next sessions and shown read-only to participants with the sport's block names (D-058), the coach's note and link, and group-first assignment of several exercises reaching the participant (D-059) |
| `change-preview.mjs` | After cancelling, moving or restoring a session: the honest notice, the labelled "What participants would see — demo preview", no fake delivery, the participant's view of the same session and the way back, reload, a group without the demo participant, and reset (D-063) |
| `isolation.mjs` | Visitor isolation with two independent browser contexts (Tennis and Basketball): changes saved per visitor, reloads, one visitor's reset leaves the other untouched, no cross-scenario contamination when switching, repeated resets without duplicates, and two tabs of one profile that stay in step instead of overwriting each other (D-066). Uses the mobile viewport only |
| `future-date.mjs` | The clock on 10 November 2026: dashboard, chat, a conversation, announcements and the participant home of all four scenarios show no October date and no seeded message as "Today", with no hydration errors (D-062). Mobile viewport only |
| `direct-link.mjs` | `/demo?sport=<id>` for the four scenarios: opens the dashboard without showing the cards, kept after a reload, Back does not reopen the link, a link wins over the example explored before; invalid values show the welcome screen and choose nothing; a plain first visit is unchanged (D-065) |
| `return-visit.mjs` | Opening the link again (D-068), with one browser profile and several tabs: the first visit, a reload and the Dashboard link keep the dashboard; a new tab opening `/` shows the four sports with the example explored before marked; saved changes are still there; another sport can be chosen; deep links and direct links are not redirected |
| `security.mjs` | Security headers on pages, an on-demand session page, a script file and a 404; a full visit contacts only this site with no Content Security Policy violations; malformed saved data still shows every page; a saved `javascript:` link is shown as text; unknown addresses get the not-found page (D-069). Mobile viewport only |
| `perf.mjs` | Interaction timing on a simulated phone (4× CPU, slow 4G): tap-to-feedback and tap-to-result for navigation, the calendar filter, sessions, Settings, the demo view, Settings → Demo and the welcome screen (D-054, `docs/PERFORMANCE.md`). Prints a table; not a pass/fail test, so `run-all.sh` skips it |
| `dashboard.mjs` | Coach dashboard: greeting, figures from the demo data, upcoming sessions, quick actions, groups, attendance figures and card hidden when attendance is off and restored when on |

Load smoke test (not a browser script, not run by `run-all.sh`): with a production build running,
`node tests/load/load.mjs 5000 300` sends 5,000 requests with 300 at a time to pages, session pages
and scripts, and prints status codes and response times.

## Audits (`audit/`)

| Script | Covers |
|---|---|
| `audit/layout.mjs` | 33 routes at 360, 390, 768, 1024 and 1440 px: no horizontal overflow, one visible main navigation, sidebar from 1024 px and bottom bar below, nothing hidden behind the bottom bar (content in inner scroll areas excluded), no console errors; the activity panel (inside the screen, Escape, focus, closes after navigating); Settings section labels fit |
| `audit/contrast.mjs` | WCAG AA contrast of every visible text element on 35 routes at 390 and 1440 px, measured against its real background (text in disabled controls, hidden or transparent elements excluded), plus the activity panel |
| (all audits) | `SCENARIO=football` (or `basketball`, `pilates`) runs an audit with that demo scenario; the default is Tennis Coaching |
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
