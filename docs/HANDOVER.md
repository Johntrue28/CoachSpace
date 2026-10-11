# CoachSpace — Session Handover

Snapshot of the project state on 2026-10-11, written so a new session can continue safely.
The current phase is recorded in `docs/ROADMAP.md`; decisions in `docs/DECISIONS.md`.

## 1. Git and deployment state (verified 2026-10-11)

- `main` is at `ae8b8ca` ("Merge pull request #15"). Everything built so far is merged into `main`.
- No pull requests are open. PRs #1–#15 are all merged.
- GitHub CI (lint, typecheck, unit tests, build) passed on `main` at `ae8b8ca`.
- The Vercel preview of PR #15 (commit `c8a200f`, same content as `main`) was reported Ready by the
  Vercel bot. The production URL could not be opened from the cloud session (blocked by its network
  policy), so the production deployment of `ae8b8ca` must be checked by hand in Vercel.
- Feature branches were deleted on GitHub after merging. Old local copies in a cloud container are
  not a source of truth: always start from `origin/main`.
- The browser test scripts used to verify PRs #7–#15 are now kept in `tests/e2e/` (see its README).

## 2. What exists (all merged in `main`)

Status means "implemented and checked" (unit tests, CI and the browser scripts in `tests/e2e/`),
not "validated with coaches".

| Area | Status | Notes |
|---|---|---|
| Groups and participants | Done (read-only) | Static fictional data in `src/data/groups.ts`; one entry per membership |
| Coach group management (create/edit groups, assign members) | **Not started** | Planned as its own PR; see §6 |
| Chat (group and one-to-one) | Done, simulated | Messages and read state in memory only |
| Unread indicators | Done | Compact badge (hidden at 0, 1–5, then "5+"), per-group badges, "New messages" card |
| Announcements | Done | Board, filter, posting; device only |
| Calendar | Done | Month view (default) and week view, group filter, session detail |
| Session management | Done | One-off sessions, reschedule/move, change place/title, cancel/restore (D-031) |
| Attendance | Done | Always for one group's session; `/attendance` chooser (D-027, D-036) |
| Exercise library | Done | Create/edit, YouTube/Vimeo links, assign to several groups or selected participants |
| Session plans and templates | Done | Blocks, order, durations, copies never change the source (D-032) |
| Coach notes ("From last time") | Done | One note per session (D-033) |
| Participant view (`/me`) | Done | Demo participant Jordan Hale; role switch is not a sign-in (D-029) |
| Back navigation | Done | In-app history with parent fallbacks (D-035) |
| Visual identity / design system | **Not started** | Next session; see §5 |

### PR #14 — Integrated coaching workflow
Session management (one-offs, reschedule, place, cancel/restore stored as exceptions), the session
builder with reusable templates and group adaptations, coach notes, and isolation of all
`localStorage` access in `src/data/persistence.ts`. Session pages became client components gated on
the store being ready (fixes a hydration mismatch).

### PR #15 — UX clean-up
Month calendar widget (Calendar and both homes), Home without summary tiles, compact unread badge,
attendance tied to a group (`/attendance`, roster and mismatch checks), shared `BackLink` with
in-app history, form returns and in-memory confirmations instead of `?saved=` URLs.
Decisions D-035, D-036 and D-037.

## 3. Demo limitations (must stay honest in the UI)

- No backend, no real authentication, no notifications, no payments.
- Coach edits (exercises, assignments, announcements, attendance, calendar changes, plans, notes) are
  saved in this browser's `localStorage` only (key `coachspace-demo-v1`) and cleared by
  "Reset demo data". Nothing is shared between devices or users.
- Chat messages and read state live in memory only and reset on reload (D-024, D-030).
- The navigation history lives in memory: after a reload, back links use the parent page.
- Groups, participants and the weekly schedule are fixed fictional data.
- Sessions are generated relative to today's date (D-026); seed chat and announcements have fixed
  dates (8–11 October 2026).

## 4. Architecture to preserve during the redesign

Keep the logic independent of the look. A redesign should only touch `src/app/**` markup,
`src/components/**` markup and `src/app/globals.css`.

**Do not duplicate or move into components:**
- `src/data/calendar.ts`, `schedule.ts`: the only source of sessions (weekly slots + changes).
- `src/data/use-sessions.ts`: the hook every screen uses to read sessions.
- `src/data/unread.ts`: unread counts and badge text (`formatBadgeCount`).
- `src/data/attendance.ts`: rosters and session/group checks.
- `src/data/plans.ts`, `notes.ts`, `exercises.ts`: pure rules and validation.
- `src/data/store.tsx` (demo store), `chat-store.tsx` (chat), `persistence.ts` (only `localStorage` access).
- `src/components/navigation/` (`history.ts`, `NavigationProvider`, `BackLink`): never hard-code back routes.
- `src/components/format.ts`: shared date/time formatting (British English, 24-hour).

**Reusable UI pieces that already exist:** `Form.tsx` (`Field`, `PrimaryButton`, `inputClass`),
`SectionCard`, `Avatar`, `Icons.tsx`, `DeviceOnlyNotice`, `ComingSoon`, `ResetDemoButton`,
`BottomNav`, `RoleSwitcher`, `calendar/SessionRow`, `calendar/SessionBadges`, `calendar/MonthCalendar`,
`chat/UnreadBadge`, `chat/ChatNotification` (`CountDot`), `announcements/AnnouncementCard`.

## 5. Visual audit (input for the redesign — nothing changed yet)

### Screens
- **Coach:** `/` Home · `/groups` · `/groups/[id]` · `/chat` · `/chat/[id]` · `/announcements` ·
  `/announcements/new` · `/calendar` (month/week) · `/calendar/new` · `/calendar/[id]` ·
  `/calendar/[id]/edit` · `/calendar/[id]/attendance` · `/attendance` · `/library` · `/library/new` ·
  `/library/[id]` · `/library/[id]/edit` · `/library/[id]/assign` · `/library/plans` ·
  `/library/plans/[id]`.
- **Participant:** `/me` · `/me/groups/[id]` · `/me/calendar` · `/me/calendar/[id]` · `/me/chat` ·
  `/me/chat/[id]` · `/me/videos` · `/me/videos/[id]`.

### How styling is organised today
- Tailwind CSS v4. Tokens are only colours and the font, in the `@theme` block of
  `src/app/globals.css`: `ink`, `ink-soft`, `surface`, `card`, `line`, `brand`, `brand-soft`,
  `accent`, plus a system font stack. No tokens for radius, shadow, spacing scale, type scale or
  semantic states (danger, warning, success).
- No dark mode (`dark:` is not used anywhere).
- Styles are written inline as Tailwind classes in each component; only forms have shared helpers.

### Problems found
1. **Desktop is a phone column:** the layout is fixed at `max-w-md` (448 px) and no `sm:`/`md:`/`lg:`
   breakpoints are used, so desktop shows a narrow column on a grey page.
2. **Buttons are copied, not shared:** the primary button style appears in about 12 places with
   different paddings (`py-1.5`, `py-2`, `py-2.5`, `py-3`). Only `PrimaryButton` is shared; there is no
   secondary, outline, danger or icon button component.
3. **Cards are copied:** `rounded-2xl bg-card p-4 ring-1 ring-line` is repeated in about 22 files;
   `SectionCard` is only used on the homes. The session detail stacks many separate cards.
4. **Page headers vary:** `h1` appears as `text-2xl font-bold` with `mt-4`, `mt-1` or no margin; page
   padding is `pt-6` on some pages and `pt-8` on others. There is no `PageHeader` component.
5. **Colours outside the tokens:** `red-700` for errors, cancel and the chat badge; `#8a5a10` for amber
   text (`ComingSoon`, `SessionBadges`); `text-white`/`bg-white/15` on the green header; the theme
   colour hex is repeated in `layout.tsx`.
6. **Two unread colours:** the chat icon and Chat tab use a red bubble (`CountDot`), while group and
   conversation badges use the amber `accent` pill. `ConversationList` repeats the pill instead of
   using `UnreadBadge`.
7. **Loading and empty states are plain text:** "Loading…" appears 9 times, and there are about 20
   different empty-state sentences with different spacing. There are no `EmptyState` or skeleton
   components.
8. **Status messages repeat their styling:** confirmations (`role="status"`, `bg-brand-soft`) and
   errors (`role="alert"`, `text-red-700`) are styled in each component.
9. **Hierarchy and density:** heavy use of `text-xs`. The demo banner (`RoleSwitcher`) takes about 80 px
   at the top of every screen. Home is long on mobile.

### What to change so the look can change globally
- Add semantic tokens (danger, warning, success, radius, shadow, type scale) in `@theme` and replace
  the raw colours.
- Create a small set of UI primitives (for example in `src/components/ui/`): `Button` (variants and
  sizes), `Card`, `PageHeader`, `EmptyState`, `StatusMessage`, `Badge`/`CountBadge`, `Loading`.
- Then replace the copied class strings screen by screen, without touching `src/data/`.
- Re-run `tests/e2e/` and `npm run check` after each step.

## 6. Pending work (not started)

- **Coach group management:** create a group (name, discipline, description, venue, weekly slots),
  assign existing participants, edit details and membership, and persist with the demo store. Groups
  are currently static and are read by about 15 screens (several are server components) and by the
  calendar functions. This needs an editable group directory in the store, seeded from
  `groups.ts`, and client-side resolution of new groups. No second group system and no duplicated
  participant records.
- Visual identity and design system (Phase 1 "Design foundation").
- Customer interviews, demo walkthrough and the remaining Phase 1 quality tasks (see the roadmap).
- D-020: the repository name and the Vercel URL contain a typo ("Scpace"). Decide before sharing.
- D-017: Next.js 16 upgrade (remaining `npm audit` findings), to decide.

## 7. Next session: visual redesign (plan, not yet authorised to implement)

1. **Visual direction:** review references; define personality, colours, typography, spacing,
   radius, icons and components; decide whether dark mode is worth it.
2. **Design system:** consolidate tokens; build the shared primitives listed in §5; remove the
   duplicated styles.
3. **Screen redesign:** Home first, then Calendar, Groups, Library, Chat and the rest; Coach and
   Participant views; check mobile and desktop.
4. **Polish and presentation:** fix functional and visual issues; improve empty states, confirmations
   and interactions; remove confusing demo elements; consistent sample data; a demo walkthrough; check
   the main flows on the deployed version.

**Recommended first step:** create a branch from the latest `main` and agree a one-page visual
direction (palette, type, radius, density, desktop layout) with the owner, with two or three
references, before changing any code.
