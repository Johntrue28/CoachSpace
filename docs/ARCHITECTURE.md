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
      page.tsx           Calendar page (/calendar)
    library/
      page.tsx           Exercise library (/library); /videos redirects here
      new/page.tsx       Create an exercise
      [id]/page.tsx      Exercise detail and "Used in" groups
      [id]/assign/       Assign to a group or selected participants (?edit= to edit)
    participants/
      page.tsx           Participant-facing experience (planned)
    layout.tsx            Shared layout
    globals.css           Global styles and design tokens

  components/
    Avatar.tsx            Initials avatar for groups and participants
    ParticipantList.tsx   Searchable participant list (client component)
    BottomNav.tsx         Shared navigation
    ComingSoon.tsx        Consistent placeholder for unavailable features
    Icons.tsx             Shared inline SVG icons
    Form.tsx              Shared form fields and button styles
    DeviceOnlyNotice.tsx  "Saved on this device only" demo label
    ResetDemoButton.tsx   "Reset demo data" action (demo store)
    format.ts             Shared date formatting in the viewer's time zone
    announcements/        Announcement board, form and cards (demo store)
    library/              Library screens (client components using the demo store)
    chat/                 Chat screens and date formatting (client components using the chat store)

  data/
    types.ts              Shared TypeScript data types
    groups.ts             Fictional coach, groups and participants
    messages.ts           Fictional announcements, conversations and chat messages
    calendar.ts           Fictional sessions and attendance
    exercises.ts          Fictional exercises and seed assignments
    store.tsx             Demo store (React context): exercises, assignments and announcements,
                          saved to localStorage on this device only
    chat-store.tsx        Chat store (React context): messages kept in memory only,
                          lost on reload (D-024)

docs/
  PRODUCT.md
  ROADMAP.md
  ARCHITECTURE.md
  DECISIONS.md
  IMPLEMENTATION_PROMPTS.md

.github/
  workflows/              CI configuration (lint, typecheck, build)
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
- Data the coach can change in the demo (exercises, assignments, announcements) lives in `DemoStoreProvider` (`src/data/store.tsx`), mounted once in `layout.tsx`, and is read with `useDemoStore()`.
- The store starts from seed data, then loads saved changes from `localStorage` (key `coachspace-demo-v1`). Reads and writes are wrapped in try/catch so the demo works when storage is blocked.
- Screens must show the "saved on this device only" label wherever the coach creates or edits data (D-023).
- In Phase 3, the store's actions are the natural boundary to replace with real database calls.
- Chat messages live in a separate `ChatStoreProvider` (`src/data/chat-store.tsx`), also mounted in `layout.tsx` and read with `useChatStore()`. Messages are kept in memory only: they survive navigation inside the app but not a reload, and they are never saved to `localStorage` (D-024). `sendMessage` is the boundary for a future real messaging backend.

### Styling
- Use Tailwind CSS and the existing project configuration.
- Keep design tokens and shared styles consistent.
- The project uses Tailwind CSS v4; design tokens are defined in the `@theme` block of `src/app/globals.css`.
- Avoid scattered arbitrary colour values when a shared design token is appropriate.

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
