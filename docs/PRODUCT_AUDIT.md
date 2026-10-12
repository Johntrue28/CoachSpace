# CoachSpace — Product Audit

> Audit of the application on `main` at commit `479f0b3` (merge of PR #30), carried out on 12 October 2026. It is an assessment only: no application code, dependency or existing document was changed. Strategy, roadmap and validation are in [`PRODUCT_STRATEGY.md`](PRODUCT_STRATEGY.md), [`FEATURE_ROADMAP.md`](FEATURE_ROADMAP.md) and [`VALIDATION_PLAN.md`](VALIDATION_PLAN.md). The current phase is still recorded only in `ROADMAP.md` (D-015).

## 1. Scope, method and limits

**Evidence tags used below:** `[code]` read in the repository; `[live]` observed or measured on https://coach-scpace.vercel.app; `[docs]` stated in the project documents; `[hypothesis]` my inference, not evidence from coaches.

| Area | What was done |
|---|---|
| Documents | Read in full: `README.md`, `CLAUDE.md`, `docs/PRODUCT.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DECISIONS.md` (D-001 to D-052), `HANDOVER.md`. Only the headings of `IMPLEMENTATION_PROMPTS.md` were read. |
| Code | Read: `src/data/` (`types`, `groups`, `store`, `persistence`, `attendance`, `calendar`, `schedule`, `dashboard`, `chat-store`, parts of `messages` and `exercises`) and these components: `AttendanceForm`, `AttendanceSwitch`, `ConversationView`, `SessionForm`, `SessionDetail`, `NewAnnouncementForm`, `ParticipantList`, `ParticipantSessionDetail`, `QuickActions`, `AssignForm`, the first 150 lines of `PlanEditor`, the first 70 of `MyVideos`, `layout.tsx` and `shell/sections.ts`. **Not read:** the other components (for example `LibraryView`, `GroupFilter`, `MonthCalendar`, `WeekBoard`, `ActivityBell`, `Sidebar`, `BottomNav`) and the contents of the browser scripts. |
| Live demo | The deployment responds and matches `main` (Library tabs, Settings, Groups all present). **Visually inspected: one screenshot, the coach dashboard at 375×812.** The browser pane was then hidden by the app, so the rest was checked through page text and DOM measurements at 375 px on the attendance form, `/calendar` and `/chat`, plus text fetches of `/library`, `/attendance`, `/settings` and `/groups`. **Not visually inspected:** every other screen, all desktop layouts, the participant view in a browser, keyboard and screen-reader use. |
| Checks | `npm run check` and the Playwright scripts were **not run** (they need dependencies installed, which the brief forbids). Verified instead: the latest GitHub Actions run on `main` (push of the PR #30 merge, 12 October 2026, 13:24 UTC) completed successfully. The repository holds 14 unit-test files with 107 test cases (run in CI) and 20 browser scripts plus 3 audits (manual, not in CI, per `tests/e2e/README.md`). |
| Customers | No interviews, usage data or customer evidence exist yet (`ROADMAP.md`: "Begin contacting coaches" is unchecked). Every statement about what coaches need is a hypothesis. |

## 2. Summary

CoachSpace is a careful, honest prototype. It labels every simulation, keeps its rules in tested pure modules, and the main flows exist end to end. As a *product for a real coach* it has three large problems.

1. **The coordination loop is open (F-28, F-31).** A coach can cancel, reschedule or announce, but nobody is told and nobody can answer. Every one of those actions ends in "Participants have not been notified (demo)". This is the problem the product exists to solve, and it is the part that is only simulated. Participants cannot say "I can't come", so attendance is bookkeeping after the fact rather than coordination before it.
2. **A coach cannot put in their own groups (F-15).** Groups, participants, weekly slots and venues are imported constants (`src/data/groups.ts`). There is no create or edit, no invite, no account. The demo cannot be personalised for an interviewee and cannot start a pilot.
3. **Build is far ahead of evidence (F-01, F-02, §6).** Fifty-two decisions, a 12-step redesign and 107 tests exist; no coach conversation is logged. The demo is also persona-incoherent: one coach of one academy coaches football, basketball, tennis and Pilates, and nowhere does the app say what problem it solves. An interviewee can tell it is a coach dashboard within seconds; they cannot tell why it beats what they use now.

## 3. Findings

Severity: **Critical** blocks any real use; **High** would cause a real coach to stop; **Medium** causes friction or errors; **Low** polish.

### 3.1 First impression, value proposition, onboarding

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-01 | High | `/`, `layout.tsx` `[live][code]` | `/` opens straight into a signed-in coach ("Good afternoon, Laura", Harbour Sports Academy) under a "Demo view · not a real sign-in" strip. The only product sentence is the metadata description ("Manage your groups, training and communication in one place"), which is never shown on screen. A visitor can tell it is a coach dashboard in 30 seconds; the app does not say which problem it solves or why it is better than what they use. | One dismissible "What this demo shows" card on first load: the problem in one line, three things to try, "nothing is sent". It keeps the rule that every control works. |
| F-02 | High | `src/data/groups.ts` `[code]` | One coach runs U12 Football, Senior Basketball, Junior Tennis and Morning Pilates. This is deliberate (D-014) until a niche is chosen, but for any interviewee three of four groups are irrelevant, and the demo matches none of the customer profiles. | After the niche decision, one seed set per segment (see `FEATURE_ROADMAP.md`, DF-08). |
| F-03 | Medium | `store.tsx`, dashboard `[live][code]` | The first screen shows "Average attendance –" because the seed holds no attendance (`attendance: []`). The dashboard ring, "Saved attendance" and the overview are empty until the demo user enters data. | Seed about three weeks of attendance so the summary can be shown at once. |
| F-04 | Medium | whole app `[code]` | No onboarding exists, because there are no accounts. The real first-run path (account, group, participants, schedule, invite) is absent; the nearest thing is "Reset demo data". | Designed in the pilot phase, not the demo. |
| F-05 | Low | URL, repository `[docs]` | The URL and repository still contain "Scpace" (D-020, undecided). It is the first thing an interviewee sees. | Decide D-020 before sharing the link. |

### 3.2 Dashboard

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-06 | Medium | `StatCards`, `/groups` `[live][code]` | "31 participants" counts different people (`uniqueParticipantCount()`), while the group cards add up to 32 (10 + 8 + 6 + 8) because Jordan Hale is in two groups. `/groups` shows both numbers on one screen. | Label it "31 people" or add "(32 memberships)". |
| F-07 | Medium | `/`, `NextSessionCard` `[code]` | The dashboard reports what happened (attendance totals) better than what is about to go wrong. There is no expected headcount, no unanswered change, and "Take attendance" is offered before the 18:00 session starts. | Once availability exists, show "6 of 10 confirmed" on the next-session card. |
| F-08 | Low | `QuickActions` `[code]` | "Send message" opens the chat list, not a composer; "Schedule session" duplicates "Create session" on the calendar. | Keep until the real action set is known. |

### 3.3 Calendar and scheduling

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-09 | High | `Group.slots`, `generatedOn()` in `calendar.ts`, `schedule.ts` `[code]` | Recurrence is a fixed weekly pattern with no start or end date and no exceptions other than single occurrences. Sessions are computed from the current slots, while attendance, plans and notes are keyed by `<groupId>-<date>`. A group cannot change its regular day or time (slots are constants); if they were editable, past sessions would silently move. No term dates, no holidays, no "move every Wednesday from 4 November". | In the pilot data model, either store generated sessions for a rolling window or give each schedule rule effective dates. Decide before any database design. |
| F-10 | High | `SessionDetail` `[code]` | Cancelling works one session at a time. A closed court or a holiday affecting four groups means four separate cancellations, each with no notification. | Bulk cancel or move by date range and by venue. |
| F-11 | Medium | `validateSessionInput()` `[code]` | Validation checks fields only. `place` is free text, so two sessions at the same time, place or coach can be created. `[hypothesis]` For a coach with shared courts this is a frequent error; confirm in interviews. | A venue entity and an overlap warning (not a block). |
| F-12 | Medium | `SessionDetail`, `ParticipantSessionDetail` `[code]` | There is no coach on a session; both views print `coach.name` from a static import. No substitute, no assistant coach. | A `coachId` on the session and a "cover" action, when multi-coach is needed (P2). |
| F-13 | Medium | `/calendar` on a phone `[live]` | Month cells are 48×80 px and show only start times (for example "29 / 08:30 / 19:30"). Groups are not colour-coded (D-045), so which group is at 08:30 needs a tap; the group filter (D-047) is the workaround. | Group initials or dots in the cell on phones. |
| F-14 | Medium | `SessionDetail` footer `[code]` | No calendar export or subscription; the footer says "Nothing is synced with an external calendar". `[hypothesis]` Participants live in phone calendars. | A per-group calendar feed (see roadmap, rank 10). |

### 3.4 Groups and participants

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-15 | **Critical** | `groups.ts`, `/groups` `[code][live]` | No create or edit for groups, participants, slots or venues. `SessionForm`, `AssignForm` and `NewAnnouncementForm` all import the constant `groups`. The live Groups page has no create or add control. `ROADMAP.md` lists this as the only unchecked coach feature. | Group and participant management with invite links (roadmap, rank 4). |
| F-16 | High | `types.ts` `Participant` `[code][live]` | The model is too thin and the wrong shape for a database: one row per group membership repeating the same `id`; no contact route; no guardian for minors (U12 and the 12–15 junior group); no capacity on `Group`; no status (trial, active, paused). `detail` is free text and already carries health information ("Returning after injury", Morning Pilates), which also appears in the chat list subtitle for Diana Cruz on the live site. Health data is special-category under GDPR; the real product must not keep it in an unstructured field. I am not a lawyer. | Separate `Person` and `Membership`; structured, minimal fields; a guardian link for minors. |
| F-17 | Medium | `attendanceSummary()` in `calendar.ts` `[code]` | A record is measured against the group's current participants, not those on the session date. When someone joins, leaves or moves group, past percentages change. | Store a roster snapshot or per-participant rows with each record. |
| F-18 | Low | `ParticipantList` `[code]` | Search only. Adequate for 10 people, thin for a 40-person academy list. | Later. |

### 3.5 Exercise library and training plans

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-19 | High | `SessionPlanCard`, `AssignForm`, `MyVideos`, `ParticipantSessionDetail` `[code]` | The stated differentiator is not connected to what the participant sees. A session plan (`SessionPlan`) is shown only on the coach's `SessionDetail`. An assignment (`Assignment`) is written only by `AssignForm`. Participant screens show assignments and no plan. A coach who builds tomorrow's plan must assign its exercises separately for participants to see them: double entry in the workflow meant to save time. | Publishing a plan to its group makes its exercises visible to participants (roadmap, rank 9). |
| F-20 | Medium | `yt()` in `exercises.ts` `[code]` | The seeded videos are YouTube *search-result* URLs (`youtube.com/results?search_query=…`), not videos. The "Video" badge and "Watch video" lead to a search page, exactly when a coach tests the video feature. User-added links are validated as YouTube or Vimeo videos (D-028); the seeds are not. | Replace with specific, checked public video links. |
| F-21 | Medium | `/library/[id]/assign` `[code]` | Assignment starts from one exercise and visits every group. That suits "one exercise to many groups" but not the more frequent "this week's work for U12" (many exercises to one group). | Add a group-first path. |
| F-22 | Low | `plans.ts` `[code]` | Plan blocks are fixed (warm-up, technical, tactical, cool-down). "Tactical" means little for Pilates. | Revisit after the niche is chosen. |

Context: the idea of reusable drills and practice plans is not unique (TeamSnap's coach page lists drills, practice plans and assignments; see `PRODUCT_STRATEGY.md` §6). `PRODUCT.md` already says so.

### 3.6 Attendance

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-23 | High | `AttendanceForm` at 375 px `[live][code]` | Each row is 113 px tall; ten participants make a 1,129 px list, and a 20-person group would be about 2,260 px. Present and Absent are two 153×40 px buttons stacked under each name. "Mark everyone present", the most useful control, is a 155×20 px text link. With the sticky counters, header and bottom bar, roughly five or six rows are visible at once (my estimate from the viewport). This is the wrong shape for a task done standing at a court. | Default everyone to present and tap only the absentees; rows of about 56 px; a full-width "All present" button; sticky save. |
| F-24 | Medium | `AttendanceMark` `[code]` | Only present or absent (D-040 deliberately drops "late"). Without advance availability, an absence announced yesterday looks the same as a no-show. | Add "told in advance" only after interviews show coaches use it (P2). |
| F-25 | Medium | `AttendanceForm` `[code]` | Saving is blocked until every participant is marked (D-027). Sensible for complete records, but with a default-present list the friction disappears. | See F-23. |
| F-26 | Low | `AttendanceSwitch.tsx` `[live][code]` | The switch copy is chosen from `enabled`, which is false until the store is `ready`. The server-rendered `/attendance` therefore reads "Off for all groups…" before hydration (seen in the fetched HTML). The button is disabled until then, so it is a brief flash, and it contradicts the store's "never flashes" intent. | Choose the copy from `ready` first. |
| F-27 | Low | D-042 `[docs]` | A global on/off switch adds settings surface for what should be a default feature. | Revisit after interviews. |

### 3.7 Announcements and messaging

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-28 | **Critical** | announcements, `SessionForm`, `SessionDetail`, `ConversationView` `[code]` | Nothing reaches anyone. Announcements, cancellations, reschedules and chat all end in "not delivered" or "not notified (demo)". The labelling is honest and should stay; but the promise ("stop repeating the same message to every group") cannot be demonstrated. | The change-and-notify loop (roadmap, rank 2). |
| F-29 | High | `/chat`, `/announcements` `[code]` | A solo coach has three overlapping channels (announcements, group chat, one-to-one chat) with no rule for which to use, plus WhatsApp. Chat is the most expensive feature to make real (delivery, push, persistence, moderation, safeguarding for minors), and free incumbents already provide messaging (Spond; see `PRODUCT_STRATEGY.md` §6). | Treat chat as unproven. Validate announcements plus notifications first. |
| F-30 | Medium | `NewAnnouncementForm` `[code]` | No edit, no delete, no read status; limits of 80 and 500 characters. Read status only matters once delivery exists. | After F-28. |

Technical note, not verified here: web push on iOS has historically required the web app to be installed to the Home Screen. Check the current behaviour before relying on push, and plan an email or share-link fallback.

### 3.8 Participant experience

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-31 | High | `/me`, `DEMO_PARTICIPANT_ID = "p12"` `[code]` | The participant is read-only: they can read the schedule, announcements, chats and videos. They cannot say "I can't come", confirm a change or see the session plan. The only reason to open the app is to read. | One-tap availability per session (roadmap, rank 6). |
| F-32 | High | whole product `[hypothesis]` | The coach pays but participants, often parents of minors, must join. Joining is more effort than a WhatsApp link. | Link-based access without an app install; parent-managed profiles for minors. Test in interviews. |

### 3.9 Mobile usability, accessibility, consistency

| ID | Sev. | Where | Finding | What to change |
|---|---|---|---|---|
| F-33 | Medium | attendance form `[live]` | No horizontal overflow at 375 px on the three routes measured. But of 23 interactive elements on the attendance form, 22 were under 44 px in at least one dimension; smallest were the back link (72×20) and "Mark everyone present" (155×20). The 20 px-high links may fall below the WCAG 2.2 AA target size (SC 2.5.8, 24×24 px) unless the spacing exception applies; check. | Minimum 44 px targets for primary actions. |
| F-34 | Low | whole app `[hypothesis]` | Indoor halls often have poor signal. Today everything is local, so it works offline once loaded; with a backend, attendance will need to save offline and sync. | A Phase 3 design requirement. |
| F-35 | Low | many forms `[code]` | The "Demo: … saved on this device only" notice repeats on nearly every form. | One persistent banner, plus per-action honesty only where an action implies delivery. |

Positives found in code (keep): a skip link, `lang="en-GB"`, `role="switch"`, `aria-pressed` toggles and live regions; contrast and layout audits exist in `tests/e2e/audit/` (I did not run them).

## 4. What is real and what is simulated

| Feature | Status | Where it lives |
|---|---|---|
| Authentication, roles | Simulated: the Coach/Participant switch is a view, not a sign-in (D-029) | URL decides the view |
| Exercises, assignments, announcements, attendance, calendar changes, plans, notes, filter | Local to one browser | `localStorage` key `coachspace-demo-v1` via `persistence.ts` |
| Chat messages and read state | In memory only; lost on reload | `chat-store.tsx` |
| Notifications and the bell | Derived from demo data, "not real-time or push" | `activity.ts` |
| Cancel, reschedule, announce | Change local state; "participants have not been notified" | `store.tsx` |
| Videos | Links only; the seeded ones open a search page (F-20) | `exercises.ts` |
| Groups, participants, weekly slots | Fixed constants | `groups.ts` |
| Settings: General, Notifications | "Coming soon" | `settings/page.tsx` |

The project labels these honestly (D-007, D-023, `DeviceOnlyNotice`, "Not delivered (demo)"). Apart from F-20 and F-26 I found no place where a simulation passes for the real thing.

## 5. Missing workflows that block real use

1. Create an account, create groups, add or import participants, invite them.
2. Change a recurring schedule, including holidays and bulk changes (F-09, F-10).
3. Tell participants about a change, and hear back from them (F-28, F-31).
4. Take attendance quickly on a phone (F-23) and keep a correct history (F-17).
5. Handle minors: guardian contact and consent (F-16).
6. Persist data across devices, with backup, export and deletion.
7. Put sessions in the participants' own calendars (F-14).

## 6. Documentation and process observations

- `.env.example` says the backend arrives in "Phase 2", but `ROADMAP.md` puts Supabase in Phase 3 (Phase 2 is customer validation).
- `README.md` says pull requests run lint, typecheck and build; the workflow also runs unit tests. Its documentation list omits `HANDOVER.md`.
- `HANDOVER.md` records that the previews of the redesign were never looked at. This audit looked at the production dashboard only; a full walkthrough of the deployed version is still open in `ROADMAP.md`.
- Fifteen of the 52 decisions (D-038 to D-052) concern the visual redesign; none concerns customer evidence. D-019 and D-021 chose this order knowingly, and the owner approved it. The cost is that every design choice rests on assumption.
- Open decisions that matter before sharing the demo: D-020 (URL and repository name) and D-014 (first discipline).

## 7. What to keep

- Honest simulation labelling throughout.
- Rules as pure, unit-tested modules in `src/data/`, with the store as the one boundary a backend replaces.
- Calendar changes stored as exceptions, with stable session ids so attendance, plans and notes stay linked (D-031).
- Attendance rosters tied to the group (D-036).
- Persistence isolated in `persistence.ts`.
- Coach notes shown again when preparing the next session (D-033); I could not verify whether competitors offer this, so treat it as a candidate differentiator to test.
- A green CI on `main`.
