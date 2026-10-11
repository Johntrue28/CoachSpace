# CoachSpace — Architecture

## 1. Current Architecture

CoachSpace uses Next.js App Router, TypeScript, and Tailwind CSS.

The first version is an interactive demo with fictional data. There is no production backend, authentication system, or cloud persistence during this phase.

## 2. Intended Project Structure

```text
src/
  app/
    page.tsx             Coach dashboard (/)
    groups/
      page.tsx           Groups list (/groups)
      [id]/page.tsx      Group detail (/groups/g1 …), statically generated
    chat/
      page.tsx           Conversation list (/chat): group chats and one-to-one chats
      [id]/page.tsx      Conversation with simulated sending (/chat/c-g1 …), statically generated
    announcements/
      page.tsx           Announcement board with group filter (/announcements?group=g1)
      new/page.tsx       Post an announcement for one group or all groups
    calendar/
      page.tsx           Calendar: month view (/calendar?date=YYYY-MM-DD) or week view
                         (?view=week&week=YYYY-MM-DD); ?group= shows one group
      new/page.tsx       Add a one-off session
      [id]/page.tsx      Session detail: changes, cancel/restore, plan, attendance, coach notes
      [id]/edit/         Reschedule, change the place or title of one session
      [id]/attendance/   Take or correct attendance for that session (?group= checks the group)
    attendance/
      page.tsx           Take attendance: choose a group, then one of its sessions (D-036)
    library/
      page.tsx           Exercise library (/library); /videos redirects here
      new/page.tsx       Create an exercise
      [id]/page.tsx      Exercise detail and "Used in" groups
      [id]/edit/         Edit the exercise itself
      [id]/assign/       Assign to several groups at once: whole group or selected
                         participants per group (?group= scrolls to one group)
      plans/             Session plans and templates (list) and the plan editor (plans/[id])
    me/                  Participant view (demo participant Jordan Hale, D-029)
      page.tsx           Participant home: next session, new messages, calendar, my groups, announcements
      groups/[id]/       One of my groups (only the participant's own groups)
      calendar/          My calendar and session detail (no attendance controls)
      chat/              My chats as the participant (own groups + chat with the coach)
      videos/            My Videos: exercises from all my groups, each listed once
    layout.tsx            Shared layout
    globals.css           Global styles and design tokens

  components/
    ui/                   Shared UI building blocks (D-038, D-039): Button/ButtonLink/buttonClass, Card/cardClass,
                          Badge/CountBadge, StatusMessage/LiveStatus, EmptyState/Loading
    Avatar.tsx            Initials avatar for groups and participants
    SectionCard.tsx       Titled card with an optional link or action, used on both homes
    ParticipantList.tsx   Searchable participant list (client component)
    BottomNav.tsx         Shared navigation (coach or participant items, from the URL)
    RoleSwitcher.tsx      Demo view switch (Coach / Participant); not a sign-in
    ComingSoon.tsx        Consistent placeholder for unavailable features
    Icons.tsx             Shared inline SVG icons
    Form.tsx              Shared form fields and button styles
    DeviceOnlyNotice.tsx  "Saved on this device only" demo label
    ResetDemoButton.tsx   "Reset demo data" action (demo store)
    format.ts             Shared date formatting in the viewer's time zone
    useNow.ts             Viewer's current date/time, known only in the browser
    announcements/        Announcement board, form and cards (demo store)
    calendar/             Month calendar widget, week view, session rows and lists, session detail
                          and form, badges
    attendance/           Attendance form, group/session chooser, session summary and dashboard
                          summary (demo store)
    participant/          My Videos, participant session detail and participant-only pieces
    plans/                Session plan card, plan editor and plans library
    notes/                Coach notes form and "From last time" panel
    library/              Library screens (client components using the demo store)
    chat/                 Chat screens, unread badges, the chat icon and "New messages" card
                          (client components using the chat store)
    navigation/           In-app history, BackLink and confirmation messages after forms (D-035)

  data/
    types.ts              Shared TypeScript data types
    groups.ts             Fictional coach, groups and participants (one entry per group
                          membership; the same person can be in several groups)
    messages.ts           Fictional announcements, conversations and chat messages
    calendar.ts           Sessions from each group's weekly slots with calendar changes applied
                          (sessionById, sessionsOn, weekDays, monthGrid, upcomingSessions), date helpers
    attendance.ts         Attendance roster per group and sessions to choose from (pure, D-036)
    schedule.ts           Calendar changes: one-off sessions, reschedule, place, cancel (pure)
    plans.ts              Session plans and templates: blocks, order, copies (pure)
    notes.ts              Coach notes per session and previous notes of a group (pure)
    coaching.ts           Fictional seed templates and one seed note
    use-sessions.ts       Hook binding the calendar functions to the saved changes
    persistence.ts        The only module that reads and writes localStorage
    exercises.ts          Fictional exercises and seed assignments, YouTube/Vimeo link
                          validation, exercisesForParticipant()
    store.tsx             Demo store (React context): exercises, assignments, announcements, attendance,
                          calendar changes, plans and notes, saved on this device only
    chat-store.tsx        Chat store (React context): messages and read state kept in
                          memory only, lost on reload (D-024, D-030)
    unread.ts             Unread counts, "mark as read" rules and the compact badge text (no React;
                          unit tested)

tests/
  *.test.ts               Unit tests (Node's built-in test runner, `npm test`)
  resolve-ts.mjs          Lets the tests import the app's modules ("@/…", no extensions)
  e2e/                    Browser test scripts (Playwright, run by hand; not in CI — see its README)

docs/
  PRODUCT.md
  ROADMAP.md
  ARCHITECTURE.md
  DECISIONS.md
  IMPLEMENTATION_PROMPTS.md
  HANDOVER.md             Latest project state and the starting point for the next session

.github/
  workflows/              CI configuration (lint, typecheck, unit tests, build)
  pull_request_template.md
```

This is the intended structure, not permission to create every file immediately. Inspect the existing repository and add files only when needed for the current task. Use the project's existing naming conventions if they differ, and document significant deviations.

## 3. Architectural Principles

### Pages and components
- Pages live in `src/app/` and follow Next.js App Router conventions.
- Shared UI components live in `src/components/`.
- Keep components focused and reusable where reuse improves clarity.
- Do not introduce unnecessary abstraction or a large component library.

### Demo data
- Keep fictional demo data in `src/data/`, separate from UI components.
- Define shared types in TypeScript.
- Avoid duplicating the same sample information across multiple pages.
- Pages and components should access data through the agreed data layer.
- Do not connect to a real backend during the demo phase.

### Demo store (editable demo data)
- Read-only fictional data (coach, groups, participants, sessions) is imported directly from `src/data/*.ts`.
- Data the coach can change in the demo (exercises, assignments, announcements, attendance) lives in `DemoStoreProvider` (`src/data/store.tsx`), mounted once in `layout.tsx`, and is read with `useDemoStore()`.
- The store starts from seed data, then loads saved changes from `localStorage` (key `coachspace-demo-v1`). Reads and writes are wrapped in try/catch so the demo works when storage is blocked.
- Screens must show the "saved on this device only" label wherever the coach creates or edits data (D-023).
- In Phase 3, the store's actions are the natural boundary to replace with real database calls.
- Calendar changes (D-031) are applied on top of the generated sessions by the same functions everywhere; components get them through `useSessions()`. Session pages are client components because one-off sessions only exist in the browser; the server only rejects ids that can never exist.
- Session plans (D-032) and coach notes (D-033) reference sessions, groups and library exercises by id. Their rules are pure functions in `plans.ts` and `notes.ts`; the store only calls them.
- Calendar sessions are not stored: `src/data/calendar.ts` generates them from each group's weekly `slots`, so the demo always shows real dates around today. A session id is `<groupId>-<YYYY-MM-DD>`. Anything that depends on "today" is computed in the browser (`useNow`), because pages are built ahead of time (D-026).
- The participant view lives under `/me` and reuses the coach components with options (group filters, link paths, `viewerId`, `canPost`). The view is chosen by the URL, not by a stored role, so coach pages are unchanged and management controls never appear under `/me`. This is a visual simulation only: there is no authentication or permission check (D-029).
- Unread badges (chat icon, Chat tab, groups list, chat list) are calculated from the messages by `src/data/unread.ts`; the chat store only keeps where each demo user has read up to (D-030).
- Back links and form returns use `NavigationProvider` (`src/components/navigation/`), mounted in `layout.tsx`. It keeps an in-memory list of the pages visited in this tab; `history.ts` holds the pure rules (unit tested). `BackLink` uses the browser history when the previous page is known and a fixed parent page when the page was opened directly (D-035). Never hard-code a back route in a page; pass the parent as `fallback`.
- Chat messages live in a separate `ChatStoreProvider` (`src/data/chat-store.tsx`), also mounted in `layout.tsx` and read with `useChatStore()`. Messages are kept in memory only: they survive navigation inside the app but not a reload, and they are never saved to `localStorage` (D-024). `sendMessage` is the boundary for a future real messaging backend.

### Styling
- Use Tailwind CSS and the existing project configuration.
- Keep design tokens and shared styles consistent.
- The project uses Tailwind CSS v4; design tokens are defined in the `@theme` block of `src/app/globals.css`.
- Avoid scattered arbitrary colour values when a shared design token is appropriate.
- Tokens (D-039, from the Figma Make design): one brand colour (`--color-brand`, `#16a366`; `brand-strong`, `brand-hover`, `brand-muted` and `brand-soft` are mixed from it with `color-mix`), green-tinted neutrals (`ink`, `ink-soft` for secondary text, `ink-muted` for icons, placeholders and timestamps only, `line`, `line-strong`, `canvas` for the page background, `surface` for subtle fills inside cards, `sunken`, `card`), meaning colours independent of the brand (`attention`, `danger`, `success`, each with `-soft` and `-ink`), tones for icon tiles, avatars and category labels (`tone-green`, `tone-blue`, `tone-amber`, `tone-violet`, `tone-rose`, each with `-soft`), `on-brand` for text on brand surfaces, `rounded-card` (16 px), `rounded-control` (12 px), `shadow-card` (resting cards), `shadow-raised` (hover, popovers) and `shadow-brand` (primary buttons). Font: DM Sans through `next/font` (part of Next.js, no extra dependency).
- Text: normal text is never below 12 px (`text-xs`); `text-label` (11 px) is only for short labels such as navigation labels and chips. Links and brand-coloured text use `text-brand-strong` (AA contrast on white); the bright `brand` is for fills, icons and focus rings. Form fields use 16 px text on phones (so iOS does not zoom) and 14 px from the `sm` breakpoint.
- Tailwind's own palette (`sky-*`, `rose-*`, `amber-*`…) is not used in components: use the tokens above.
- To change the brand colour, change `--color-brand` in `globals.css` and `brandColour` in `layout.tsx` (browser bar colour). Nothing else.
- Use the components in `src/components/ui/` for buttons, cards, badges, unread counts, status messages, empty states and loading text instead of copying class strings. Red (`danger`) is only for errors and destructive actions; amber (`attention`) is for unread counts and changed sessions.

### Interaction
- Every visible control must work or be labelled `Coming soon`.
- Demo-only interactions may use local state.
- Do not imply local changes are synchronised between users or stored in the cloud.
- Use fictional content only.

## 4. Future Backend Boundary

Supabase is not part of the current demo architecture.

If a real pilot is approved:
- Define the data model before implementing database access.
- Introduce authentication and access control deliberately.
- Enforce permissions at the server/database layer.
- Test access isolation across coaches, groups, and participants.
- Keep secrets out of source control and client-side bundles.
- Review privacy and data-retention requirements before real personal data is introduced.

Do not implement these future capabilities until the roadmap authorises them.

## 5. Future Data Source Replacement

The separation between `src/data/` and the UI is intended to reduce future rework.

When the project moves to a real backend, propose a clear data-access boundary so that UI components do not need to contain database queries throughout the application.

Do not introduce a complex repository or service abstraction during the demo unless it solves a real current problem.

## 6. Architecture Change Rules

Before changing the framework, directory structure, data flow, styling system, or major dependencies:
1. Inspect the existing implementation.
2. Explain the problem with the current approach.
3. Present the proposed change and its trade-offs.
4. Obtain the owner's approval.
5. Update this document and `docs/DECISIONS.md` after approval.


==================== END OF DOCUMENTS ====================
