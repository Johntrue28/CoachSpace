# CoachSpace — Architecture

## 1. Current Architecture

CoachSpace uses Next.js App Router, TypeScript, and Tailwind CSS.

The first version is an interactive demo with fictional data. There is no production backend, authentication system, or cloud persistence during this phase.

## 2. Intended Project Structure

```text
src/
  app/
    page.tsx             Coach dashboard (/): header, figures, sessions, messages, groups, quick actions,
                         calendar, attendance and announcements (D-044)
    groups/
      page.tsx           Groups list (/groups): one card per group (D-046)
      [id]/page.tsx      Group page (/groups/g1 …, D-046): details and actions, participants, sessions,
                         announcements and exercises; the other groups beside it from 1280 px
    chat/
      layout.tsx         List beside the open conversation from 1024 px (ChatShell, D-049)
      page.tsx           Conversation list (/chat): group chats and one-to-one chats
      [id]/page.tsx      Conversation with simulated sending (/chat/c-g1 …), statically generated
    announcements/
      page.tsx           Announcement board with group filter (/announcements?group=g1)
      new/page.tsx       Post an announcement for one group or all groups
    calendar/
      page.tsx           Calendar (D-045): month grid with the selected day (/calendar?date=YYYY-MM-DD)
                         or week board (?view=week&week=YYYY-MM-DD), then upcoming sessions;
                         the coach's group filter is saved in the store (D-047); ?group= sets it to one group
      new/page.tsx       Add a one-off session
      [id]/page.tsx      Session detail: changes, cancel/restore, plan, attendance, coach notes
      [id]/edit/         Reschedule, change the place or title of one session
      [id]/attendance/   Take or correct attendance for that session (?group= checks the group)
    attendance/
      page.tsx           Take attendance: choose a group, then one of its sessions (D-036); saved attendance (D-051)
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
      groups/[id]/       One of my groups (only the participant's own groups) (shared GroupHeader, no coach actions)
      calendar/          My calendar and session detail (no attendance controls)
      announcements/     Announcements for my groups, read-only (D-050)
      chat/              My chats as the participant (own groups + chat with the coach)
      videos/            My Videos: exercises from all my groups, each listed once
    settings/page.tsx     Settings (D-043, D-055): Demo (scenario switcher, link to the welcome screen, resets),
                          General and Notifications ("Coming soon") and Features (the global attendance
                          switch); ?section= picks the section
    demo/page.tsx         Welcome screen (D-055): the first page of a new visitor, four sport cards; shown
                          without the app frame (AppFrame). Also linked from Settings → Demo
    groups/[id]/assign/   Group-first assignment (D-059): several exercises for one group at once
    more/page.tsx         Mobile "More" page: Library, Announcements, Attendance, Settings, the attendance
                          switch (Features), demo view switch and reset (D-040, D-042)
    layout.tsx            App shell: desktop sidebar (from 1024 px), sticky header, mobile demo strip and
                          bottom navigation; pages render inside it
    globals.css           Global styles and design tokens

  components/
    ui/                   Shared UI building blocks (D-038, D-039): Button/ButtonLink/buttonClass, Card/cardClass,
                          Badge/CountBadge, StatusMessage/LiveStatus, EmptyState/Loading, PageHeader
    Avatar.tsx            Initials avatar for groups and participants
    SectionCard.tsx       Titled card with an optional link or action, used on both homes
    ParticipantList.tsx   Searchable participant list (client component)
    BottomNav.tsx         Mobile and tablet bottom navigation (coach or participant items, from the URL)
    shell/                App shell (D-040 step 2): Sidebar, TopBar, ActivityBell ("Activity in this demo"
                          panel), Logo, NavIcon; sections.ts holds the navigation items, the active-item
                          rules and the header titles (pure, unit tested)
    RoleSwitcher.tsx      Demo view switch (Coach / Participant); not a sign-in. Compact strip on mobile,
                          panel in the sidebar and on /more
    ComingSoon.tsx        Consistent placeholder for unavailable features
    Icons.tsx             Shared inline SVG icons
    Form.tsx              Shared form fields and button styles
    DeviceOnlyNotice.tsx  "Saved on this device only" demo label
    ResetDemoButton.tsx   "Reset demo data" action (demo store)
    format.ts             Shared date formatting in the viewer's time zone
    useNow.ts             Viewer's current date/time, known only in the browser
    announcements/        Announcement board (coach, and read-only for the participant), form (its own page and
                          beside the board from 1280 px) and cards (demo store, D-050)
    calendar/             Calendar page (D-045): CalendarView, GroupFilter (D-047), MonthGrid, DayAgenda, WeekBoard and the
                          state colours (sessionStyles); the dashboard's compact MonthCalendar widget;
                          UpcomingSessions and SessionTile (date cards, also on the dashboard); session
                          rows and lists, session detail and form, badges
    attendance/           Attendance form, group/session chooser, session summary and dashboard
                          summary; AttendanceSwitch (the global switch), AttendanceOnly (renders only while
                          attendance is on) and AttendanceOff (disabled state) (D-042);
                          summary (demo store)
    participant/          My Videos (cards and filters), the home's My Videos preview, the video page,
                          participant session detail and participant-only pieces (D-052)
    plans/                Session plan card, plan editor and plans library
    notes/                Coach notes form and "From last time" panel
    library/              Library screens (client components using the demo store); LibraryTabs switches
                          between Exercises and Session plans (D-048)
    chat/                 Chat screens (D-049): ChatShell (list and conversation side by side from 1024 px,
                          used by the /chat and /me/chat layouts), ConversationList, ConversationView,
                          NoConversation; unread badges and the "New messages" card (chat store)
    dashboard/            Dashboard pieces (D-044): DashboardHeader (date and greeting, also on /me),
                          StatCards, QuickActions, AttendanceOverview, GroupsList
    groups/               Groups pieces (D-046): GroupCard (Groups page card and the side list beside an
                          open group) and GroupHeader (top of a group page, coach and participant)
    settings/             Settings pieces (SettingsView, FeatureSettings: attendance switch with a confirmation)
    demo/                 Welcome screen (D-055) and ScenarioCover (original tactics-board SVG illustrations)
    shell/AppFrame.tsx    Sidebar, header and bottom navigation around every page except the welcome screen
    navigation/           In-app history, BackLink and confirmation messages after forms (D-035)

  data/
    types.ts              Shared TypeScript data types
    scenarios/            The four demo scenarios (D-053): tennis.ts (default), football.ts, basketball.ts,
                          pilates.ts, each a typed ScenarioData; index.ts (profiles for the Studio, loading
                          on request); all.ts (every scenario, server only, for generateStaticParams)
    scenario.ts           applyScenario(): points every data module at one scenario (no React; unit tested)
    scenario-store.tsx    ScenarioProvider: remembers and applies the scenario, mounts the app again on a change
    groups.ts             Coach, groups and participants of the active scenario (one entry per group
                          membership; the same person can be in several groups)
    messages.ts           Announcements, conversations and chat messages of the active scenario
    calendar.ts           Sessions from each group's weekly slots with calendar changes applied
                          (sessionById, sessionsOn, weekDays, monthGrid, upcomingSessions), date helpers
    attendance.ts         Attendance roster per group and sessions to choose from (pure, D-036)
    schedule.ts           Calendar changes: one-off sessions, reschedule, place, cancel (pure)
    plans.ts              Session plans and templates: blocks, order, copies (pure)
    notes.ts              Coach notes per session and previous notes of a group (pure)
    coaching.ts           Seed templates and one seed note of the active scenario
    use-sessions.ts       Hook binding the calendar functions to the saved changes
    persistence.ts        The only module that reads and writes localStorage
    exercises.ts          Exercises and seed assignments of the active scenario, YouTube/Vimeo link
                          validation, exercisesForParticipant()
    store.tsx             Demo store (React context): exercises, assignments, announcements, attendance,
                          calendar changes, plans and notes, saved on this device only
    chat-store.tsx        Chat store (React context): messages and read state, saved per scenario in this
                          browser and never delivered (D-060)
    calendar-filter.ts    Calendar group filter rules: shown/hidden group ids (no React; unit tested, D-047)
    dashboard.ts          Dashboard figures: greeting, sessions this week, attendance totals (no React; unit tested)
    features.ts           Global feature switches (D-042): attendance on/off, defaults for older saves,
                          which navigation items a switched-off feature hides (no React; unit tested)
    activity.ts           "Activity in this demo": unread conversations, sessions without attendance and
                          upcoming changed sessions, worked out from the demo data (no React; unit tested)
    unread.ts             Unread counts, "mark as read" rules and the compact badge text (no React;
                          unit tested)

tests/
  *.test.ts               Unit tests (Node's built-in test runner, `npm test`)
  fixtures/               The original mixed-sport data, used by the rule tests (not by the app)
  resolve-ts.mjs          Lets the tests import the app's modules ("@/…", no extensions)
  e2e/                    Browser test scripts (Playwright, run by hand; not in CI — see its README);
                          audit/ for the layout, contrast and link audits; run-all.sh runs everything

docs/
  PRODUCT.md
  ROADMAP.md
  ARCHITECTURE.md
  DECISIONS.md
  IMPLEMENTATION_PROMPTS.md
  HANDOVER.md             Latest project state and the starting point for the next session
  DEMO_CONTENT_SOURCES.md Sources behind the scenario content, image decisions and their limits
  PERFORMANCE.md          Mobile interaction audit: measurements, root cause and changes (D-054)

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
- The store starts from the active scenario's seed data, then loads that scenario's saved changes from `localStorage` (key `coachspace-demo-v2:<scenario>`, D-053); with nothing saved it adds three weeks of seeded attendance history (D-056) and plans for the next sessions (D-058, `seed-plans.ts`) in the browser. Reads and writes are wrapped in try/catch so the demo works when storage is blocked.
- Screens must show the "saved on this device only" label wherever the coach creates or edits data (D-023).
- In Phase 3, the store's actions are the natural boundary to replace with real database calls.
- Calendar changes (D-031) are applied on top of the generated sessions by the same functions everywhere; components get them through `useSessions()`. Session pages are client components because one-off sessions only exist in the browser; they show "not found" in the browser for ids that do not exist in the active scenario.
- Session plans (D-032) and coach notes (D-033) reference sessions, groups and library exercises by id. Their rules are pure functions in `plans.ts` and `notes.ts`; the store only calls them.
- Calendar sessions are not stored: `src/data/calendar.ts` generates them from each group's weekly `slots`, so the demo always shows real dates around today. A session id is `<groupId>-<YYYY-MM-DD>`. Anything that depends on "today" is computed in the browser (`useNow`), because pages are built ahead of time (D-026).
- The participant view lives under `/me` and reuses the coach components with options (group filters, link paths, `viewerId`, `canPost`). The view is chosen by the URL, not by a stored role, so coach pages are unchanged and management controls never appear under `/me`. This is a visual simulation only: there is no authentication or permission check (D-029).
- Unread badges (chat icon, Chat tab, groups list, chat list) are calculated from the messages by `src/data/unread.ts`; the chat store only keeps where each demo user has read up to (D-030).
- Back links and form returns use `NavigationProvider` (`src/components/navigation/`), mounted in `layout.tsx`. It keeps an in-memory list of the pages visited in this tab; `history.ts` holds the pure rules (unit tested). `BackLink` uses the browser history when the previous page is known and a fixed parent page when the page was opened directly (D-035). Never hard-code a back route in a page; pass the parent as `fallback`.
- The app shell lives in `layout.tsx`: `Sidebar` (from 1024 px), a sticky `TopBar`, the compact demo strip and `BottomNav` (below 1024 px). Each page renders its own `<main>`; pages not yet redesigned use a centred column up to 768 px wide. Sticky and fixed elements use the CSS variables `--shell-header-h` and `--bottom-nav-h` from `globals.css`, so content never hides behind the header or the bottom navigation.
- Optional features (D-042) are switched in the demo store (`features`, saved like other coach data). Read them through `useAttendanceSetting()` or wrap an entry point in `<AttendanceOnly>`; navigation lists are filtered with `visibleItems()` from `src/data/features.ts`. Never delete data when a feature is switched off.
- Chat messages live in a separate `ChatStoreProvider` (`src/data/chat-store.tsx`), also mounted in `layout.tsx` and read with `useChatStore()`. Typed messages and the read state are saved in this browser per scenario since D-060 (they used to be in memory only, D-024); they are never delivered. `sendMessage` is the boundary for a future real messaging backend.

### Demo scenarios (D-053)
- One application, four sets of fictional data. A scenario (`src/data/scenarios/<id>.ts`) only supplies data; every page, component and rule is shared. Never add sport-specific pages or components; when a sport needs different words, put them in the scenario data (for example `planBlockLabels`, `coach.role`).
- The data modules (`groups.ts`, `messages.ts`, `exercises.ts`, `coaching.ts`, the session topics in `calendar.ts`, the plan block names in `plans.ts`) keep `export let` bindings to the active scenario. Only `applyScenario()` in `src/data/scenario.ts` changes them, all at once, so data from two scenarios can never be mixed. Code keeps importing `groups`, `participants`, `coach`… as before.
- The server and the first render in the browser always use the default scenario (Tennis Coaching). `ScenarioProvider` (outermost in `layout.tsx`) then applies the scenario saved in this browser (key `coachspace-scenario`) and mounts the app again under a new key, so no component keeps state from the previous scenario. An inline script in `<head>` hides the page (`data-scenario-loading`) while a non-default scenario is applied, so the default never flashes; CSS shows the page after 3 s in any case.
- Because of that, **server components must not read scenario data** (`groups`, `coach`, …): their output would always be the default scenario. Pages are thin server files that render a client component; `generateStaticParams` uses `src/data/scenarios/all.ts` to build the ids of every scenario.
- The default scenario is in the main bundle; the other three are separate chunks loaded only when the saved scenario needs them, or in the background on the welcome screen and in Settings → Demo so a switch is instant.
- Each scenario's changes are saved under its own key and tagged with the scenario id, so switching never deletes anything. Resets are per scenario or for all four, always after a confirmation.
- Entry (D-055): the same inline `<head>` script sends a visitor who opens `/` without a saved scenario to the welcome screen (`/demo`) with `location.replace`, before the first paint, and only when storage is writable (no loop when it is blocked). Deep links are never redirected. The welcome screen and Settings → Demo both call `activate()` of the one scenario store. Neither is a sign-in or access control.
- The dashboard introduction (D-055) is hidden before the first paint by `html[data-intro-dismissed]`, set by the same script from `coachspace-intro-dismissed`, so it never flashes.
- The demo chat (`chat-store.tsx`, D-060) saves typed messages and the read state under `coachspace-demo-v2:<scenario>:chat`, only after the visitor sends or reads something; `parseSavedChat()` ignores anything malformed. Reset demo data clears it with the rest.
- Seed dates (D-062): every scenario's seed is written for the week of Monday 12 October 2026 (`SEED_WEEK`). In the browser, `ScenarioProvider` calls `applyScenario(data, new Date())`, which first moves every seeded timestamp, date and session id by whole weeks to the current week (`datedScenario()` in `src/data/seed-dates.ts`, pure and unit tested; the seed objects are never modified). This happens in a layout effect, before the stores read their seed in their effects. The server and the first render use the unshifted seed; pages show seeded dates only once the stores are `ready`. Write new seed content for that week, and never name a month in seed text.
- Direct links (D-065): `/demo?sport=<id>` is read on the welcome screen by `scenarioFromLink()` (`src/data/scenario-link.ts`; only the four ids are accepted) in a layout effect, so the cards never show; the inline `<head>` script hides the page meanwhile. It then calls the same `activate()` and `router.replace("/")`.
- Tabs (D-066): `onSavedElsewhere()` in `persistence.ts` listens to the browser's `storage` event, so the store and the chat reload a scenario's saved data when another tab of this browser saves or resets it.
- Words that differ by sport come from the scenario data, never from conditions in components: `coachRole()` ("Coach"/"Instructor"), `sessionWords()` ("session"/"class"), `planBlockLabels`, `Group.short` (D-061).

### Rendering and performance (D-054)
- Every page that does not depend on data created in the browser is built in advance (static). Do not read `searchParams` in a page: read the URL in a client component with `useSearchParams()`, inside `<Suspense>` whose fallback renders the same screen without the query (see `CalendarRoute`, `AnnouncementsRoute`, `SettingsView`).
- Pages with ids from the scenarios use `generateStaticParams`; session pages (ids depend on the date) return `[]`, so each is rendered on its first visit and then cached. The `loading.tsx` files of the session, exercise, plan and video routes (`PageLoading`) give immediate feedback while such a page loads; never add one at the top level, because it would wrap every static page too.
- `tests/e2e/perf.mjs` measures tap-to-feedback times on a simulated phone; see `docs/PERFORMANCE.md`.

### Styling
- Use Tailwind CSS and the existing project configuration.
- Keep design tokens and shared styles consistent.
- The project uses Tailwind CSS v4; design tokens are defined in the `@theme` block of `src/app/globals.css`.
- Avoid scattered arbitrary colour values when a shared design token is appropriate.
- Tokens (D-039 for the Figma look, D-041 for the colour palette). Brand: `brand` `#16a366` (accents, icons on white, focus rings, active indicators), `brand-strong` `#087a4a` (primary actions, selected states with white text, links and brand-coloured text), `brand-soft` `#eaf8f1` (mint: selected items, active surfaces), `brand-hover` and `brand-muted` mixed from them. Neutrals: `ink` `#202b26` (headings, body), `ink-soft` `#66756d` (descriptions, metadata), `ink-muted` (icons, placeholders, decoration only), `line` `#e5ebe8`, `line-strong`, `canvas` `#f7f9f8` (page background), `surface` (subtle fills inside cards), `sunken` (segmented controls, inactive chips), `card` `#ffffff`. Meaning colours, each with `-soft`: `info` `#3567c8` (information, calendar distinctions), `attention` `#a15c00` (warnings, pending actions, changed sessions), `planning` `#7050b5` (planning and library accents), `danger` `#be3455` (errors, destructive actions), `success`. Tones (`tone-green`, `tone-blue`, `tone-amber`, `tone-violet`, `tone-rose`) map to those meanings for icon tiles, avatars and category labels. `on-brand` for text on brand surfaces, `rounded-card` (16 px), `rounded-control` (12 px), `shadow-card`, `shadow-raised`, `shadow-brand`. Font: DM Sans through `next/font` (part of Next.js, no extra dependency). Neutral surfaces are the default; semantic colours carry meaning, not decoration.
- Contrast (WCAG AA, checked with the real colour pairs): white text only on `brand-strong` (5.4:1), never on bright `brand` (3.3:1); `ink-soft` text only on `card`, `canvas` or `surface` (4.6–4.9:1), use `ink` on `brand-soft` and `sunken`; icons on `brand-soft` use `brand-strong`; every meaning colour passes on white and on its own `-soft` background (4.7:1 or more).
- Text: normal text is never below 12 px (`text-xs`); `text-label` (11 px) is only for short labels such as navigation labels and chips. Links and brand-coloured text use `text-brand-strong` (AA contrast on white); the bright `brand` is for fills, icons and focus rings. Form fields use 16 px text on phones (so iOS does not zoom) and 14 px from the `sm` breakpoint.
- Tailwind's own palette (`sky-*`, `rose-*`, `amber-*`…) is not used in components: use the tokens above.
- To change the brand, change the three brand colours in `globals.css` and `brandColour` in `layout.tsx` (browser bar colour). Nothing else.
- Use the components in `src/components/ui/` for buttons, cards, badges, unread counts, status messages, empty states and loading text instead of copying class strings. Unread counts use `brand-strong` with white text (the Figma green badge); amber (`attention`) is for warnings, pending actions and changed sessions; red (`danger`) only for errors and destructive actions.

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
