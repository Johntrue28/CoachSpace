# Browser tests (manual)

Scripted Playwright checks of the main demo flows, run in a mobile (390×844) and a desktop
(1280×800) viewport with the browser clock fixed at Wednesday 14 October 2026, 12:00 (Madrid).

They are **not** part of `npm test`, `npm run check` or CI, and Playwright is **not** a project
dependency (no new dependency was added). They were used to verify pull requests #7–#15 and are
kept so the same checks can be repeated after the visual redesign.

| Script | Covers |
|---|---|
| `chat.mjs` | Chat list, group and one-to-one conversations, simulated sending |
| `unread.mjs` | Unread badges and marking as read |
| `calendar.mjs` | Calendar views and session detail |
| `attendance.mjs` | Taking and correcting attendance, group rosters |
| `announcements.mjs` | Announcement board, filter and posting |
| `library.mjs` | Exercise library, create/edit, assign to groups |
| `workflow.mjs` | Session changes, cancel/restore, session plans, coach notes |
| `participant.mjs` | Participant view (`/me`) |
| `ux.mjs` | Month calendar, Home, compact unread badge, attendance context, back navigation |
| `features.mjs` | Global attendance switch: every entry point hidden when off, records kept, setting survives a reload, restored when on |
| `settings.mjs` | Settings page: navigation, attendance switch with confirmation and persistence, Coming soon sections, Reset demo data restores the default |
| `dashboard.mjs` | Coach dashboard: greeting, figures from the demo data, upcoming sessions, quick actions, groups, attendance figures and card hidden when attendance is off and restored when on |

## How to run

Needs Playwright with Chromium installed outside the project (for example `npm install -g playwright`
and `npx playwright install chromium`).

```sh
npm run build
mkdir -p /tmp/e2e-out
sh tests/e2e/serve.sh /tmp/e2e-out
PW=$(npm root -g)/playwright node tests/e2e/ux.mjs /tmp/e2e-out
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
