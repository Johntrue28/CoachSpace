# CoachSpace — Feature Roadmap (proposal)

> Written on 12 October 2026 from the audit ([`PRODUCT_AUDIT.md`](PRODUCT_AUDIT.md)) and strategy ([`PRODUCT_STRATEGY.md`](PRODUCT_STRATEGY.md)). **This is a proposal. `ROADMAP.md` stays the single source of truth for the current phase (D-015) until the owner approves any change** (`CLAUDE.md` §13). Nothing here authorises Supabase, authentication, billing or any Phase 3 work; that needs the exit decision in `ROADMAP.md` Phase 2 first.

**Effort scale** (rough, my estimate for a solo developer working with an AI assistant): S about a day or less; M two to four days; L one to two weeks; XL three weeks or more. **Priority** follows the brief: P0 required to avoid a critical failure or validate the core product; P1 high value for the first paying customer; P2 useful after validation; P3 optional or not justified now.

> **Status note, 14 October 2026.** Most demo fixes below were done in D-053 to D-061 (see `AUDIT_FOLLOW_UP.md`), and DF-08 in its tennis form in D-064. DF-04 (specific videos) is still open: no video could be opened from the cloud session, so it waits for the owner to watch and choose candidates (`DEMO_CONTENT_SOURCES.md` §1). Everything in §2 onwards stays **deferred** until the validation criteria in `POST_DEMO_AUDIT.md` §13 are met and the owner makes the Phase 2 exit decision: no sign-in, database, real notifications, chat delivery, group creation or payments before that.

## 1. Fixes to the current demo

All of these are small and none needs a backend. They make the demo accurate and understandable before the first interview. Finding numbers refer to the audit.

| ID | Fix | Where | Effort | Why |
|---|---|---|---|---|
| DF-01 | Decide D-020: fix the URL and repository name ("Scpace") before sharing the link | Vercel, GitHub | S | F-05. First thing an interviewee sees. |
| DF-02 | A dismissible "What this demo shows" card on first load: the problem, three things to try, "nothing is sent" | `src/app/page.tsx`, new component | S | F-01. |
| DF-03 | Seed about three weeks of attendance so the dashboard average, ring and "Saved attendance" show something | `src/data/store.tsx` seed, `coaching.ts` | S | F-03. |
| DF-04 | Replace the YouTube search-result URLs with specific public video links, each checked | `src/data/exercises.ts` | S | F-20. |
| DF-05 | Attendance on a phone: everyone present by default, tap an absentee, rows of about 56 px, a full-width "All present" button, targets of 44 px or more, a sticky save | `AttendanceForm.tsx` | S–M | F-23, F-25, F-33. |
| DF-06 | Rename "31 participants" to "31 people", or note the 32 memberships | `StatCards.tsx`, `/groups` | S | F-06. |
| DF-07 | Choose the attendance-switch copy from `ready` first so the server render does not read "Off" | `AttendanceSwitch.tsx` | S | F-26. |
| DF-08 | Per-segment demo data, starting with a tennis coach (about five groups at different levels, two venues, a private-lesson slot); selectable. **Only after the niche decision.** | `src/data/groups.ts` and seeds | M | F-02. |
| DF-09 | A group-first assign path ("assign several exercises to U12") | `/library`, `AssignForm` | S–M | F-21. |
| DF-10 | Correct the documents: `.env.example` ("Phase 2" should read Phase 3), `README.md` (CI also runs unit tests; list `HANDOVER.md`) | repo root | S | Audit §6. |
| DF-11 | One persistent demo banner instead of a notice on every form; keep per-action honesty where an action implies delivery | `DeviceOnlyNotice` | S | F-35. |
| DF-12 | Optional: show the session plan on the participant's session page (display only) | `ParticipantSessionDetail.tsx` | M | F-19. Lets interviewees react to the full plan-to-participant idea. |
| DF-13 | A walkthrough of the deployed version and a three-minute script (already open in `ROADMAP.md`) | n/a | S | See `VALIDATION_PLAN.md` §8. |

DF-01 to DF-07 and DF-10 can be done in about two days in total; do them before the first interview if time allows, and say aloud what is not fixed if it does not.

## 2. Minimum requirements for the first real pilot

**Prerequisite:** the owner's go decision after validation (`ROADMAP.md` Phase 2 exit). Do not start before it.

**The smallest credible pilot:** one coach, up to three groups and about forty participants, run for two to four weeks with real people, on one job: **tell everyone about a change and know who is coming**, with attendance and the exercise library as supporting tools. Participants join by a link and do not install anything.

| Must have | Roadmap rank | Notes |
|---|---|---|
| Coach account, persistent data, access isolation between coaches | 3 | Server-side and database-level checks, tested with separate test accounts (`CLAUDE.md` §9). |
| Create and edit groups and participants; invite by link | 4 | Replaces the constants in `groups.ts`. |
| Privacy basics and minors | 5 | Before any real personal data. Not legal advice; obtain it. |
| Change-and-notify: cancel, reschedule or announce reaches participants (email plus a share link first), with who-has-seen-it | 2 | The core promise. |
| One-tap availability per session | 6 | Without it, attendance stays bookkeeping. |
| Bulk cancel or move by date range (full series editing comes later) | 7 (minimum) | A closed court or a holiday must not mean eight manual cancellations. |
| Fast phone attendance | 8 | DF-05, made persistent. |
| Library, assignments and announcements, persistent | existing | The demo versions, moved onto real data. |
| Data export and deletion; a daily backup; a way to report problems | 5 | `ROADMAP.md` Phase 3. |

**Explicitly not in the pilot:** real-time chat, payments, class packs, capacity and waiting lists, several coaches and roles, analytics, native apps, a calendar feed.

**Pilot acceptance criteria** (to be agreed with the owner before building):

1. Cross-tenant tests pass: coach A cannot read or change coach B's data by any route.
2. A schedule change reaches at least 90% of participants within a stated time, measured in the pilot. The figures are a proposal to settle with the pilot coach.
3. The coach runs two consecutive weeks of one group using CoachSpace for schedule changes.
4. No data loss, and a successful test restore from backup.
5. The coach says, without being prompted, what they would miss if it stopped.

## 3. After pilot validation

| Feature | Rank | Condition to start |
|---|---|---|
| Plan published to the group makes its exercises visible to participants | 9 | The coach actually builds plans and shares drills (H4) |
| Series editing with effective dates, terms and holidays | 7 | Coaches change their regular timetable during the season |
| Calendar feed per group and participant | 10 | Participants ask for it, or miss changes despite notifications |
| Private lessons and trial sessions | 11 | Tennis coaches run one-to-one lessons through the app |
| Several coaches, roles and a substitute on a session | 12 | A pilot coach has assistants, or a club asks |
| Venue entity and conflict warnings | 13 | Venue clashes occur in real use |
| Attendance reasons ("told in advance") and per-participant history | later | Coaches use the data, not just record it |
| Basic coach report: attendance by group and period | later | A coach asks for it |
| Coach billing, kept outside the product until at least three coaches pay | later | See `PRODUCT_STRATEGY.md` §8 |

## 4. Features to avoid until there is evidence

| Feature | Why not now | Reopen when |
|---|---|---|
| Real-time chat (rank 15) | Most expensive to make real (delivery, push, moderation, safeguarding for minors); Spond already offers free messaging; the loop in §2 may make it unnecessary | At least two of the first five interviewees want to move conversations off WhatsApp and say why |
| In-product payments, subscriptions, invoicing | `DECISIONS.md` D-013; adds legal and support load | At least three coaches pay by an outside channel and ask for it |
| Class packs, memberships, capacity and waiting lists (rank 14) | They are the heart of studio software and CoachSpace would arrive late to a mature market | Pilates or studios are chosen as the segment |
| A public marketplace or discovery | Needs both sides at scale | Never in the near term |
| Native apps | `DECISIONS.md` D-001 | A PWA is shown not to meet a stated need |
| Performance analytics and per-participant progress tracking | Out of scope in `PRODUCT.md` §8; sensitive for minors | Coaches ask, after a pilot |
| Tracking who watched which video | Useful only if videos are central | Interviews show coaches assign material and need proof |
| Video hosting | `DECISIONS.md` D-009 | Never in the near term |
| AI plan generation, wearables | `DECISIONS.md` D-013 | After paying customers |
| Two-way calendar sync | Heavy and fragile | A read-only feed is not enough |
| White-label or branded app | Studio-software feature | A paying club asks |
| Global feature switches such as D-042 | More settings for a default feature | Revisit after interviews |

## 5. The 15 most valuable improvements, ranked

Each entry gives: problem, solution, segment, benefit, effort, dependencies, priority, stage and confidence with the evidence needed.

### 1. Demo credibility pack (DF-01 to DF-07, DF-10)
- **Problem:** the first screen does not say what the product does, shows empty data, and links to a search page (F-01, F-03, F-05, F-06, F-20, F-26).
- **Solution:** the fixes in §1.
- **Segment:** all. **Benefit:** interviews start from an accurate, understandable demo.
- **Effort:** S each, about two days together. **Dependencies:** the owner decides D-020.
- **Priority:** P0. **Stage:** demo, before the first interview.
- **Confidence:** high that it helps; evidence needed: interviewees can state what the product does after one minute.

### 2. Change-and-notify loop
- **Problem:** schedule changes are sent as several messages and some people miss them (H1).
- **Solution:** cancelling, moving or announcing notifies the affected participants (email plus a link to share by WhatsApp first; web push later) and shows who has seen it.
- **Segment:** A first. **Benefit:** the core promise becomes real.
- **Effort:** L. **Dependencies:** ranks 3 and 4.
- **Priority:** P0. **Stage:** pilot.
- **Confidence:** medium. **Evidence:** at least three of five interviewees describe a missed change in the last 30 days; delivery rate measured in the pilot.

### 3. Real accounts, persistent data, access control
- **Problem:** nothing is stored or shared beyond one browser (F-15, F-28).
- **Solution:** authentication, a database, row-level access rules, tests with separate accounts; a data model that fixes F-09, F-16 and F-17 first.
- **Segment:** all. **Benefit:** makes any pilot possible.
- **Effort:** XL. **Dependencies:** the owner's go decision; the data-model decision.
- **Priority:** P0. **Stage:** pilot.
- **Confidence:** high that it is required. **Evidence:** cross-tenant tests pass.

### 4. Group and participant management with invite links
- **Problem:** a coach cannot enter their own groups (F-15).
- **Solution:** create and edit groups and slots; add participants by link (no password, no install) or by pasting a list; a guardian link for minors.
- **Segment:** all. **Benefit:** the product can be used with real groups.
- **Effort:** L. **Dependencies:** rank 3.
- **Priority:** P0. **Stage:** pilot.
- **Confidence:** high that it is needed; medium that link-based joining works for participants. **Evidence:** join completion rate in the pilot.

### 5. Privacy and minors foundations
- **Problem:** the demo stores health text in a free field and has no model for guardians or consent (F-16).
- **Solution:** minimal structured fields; a privacy notice; a lawful basis and parental consent for minors; export and deletion; a data-processing agreement with the provider; retention rules. Get proper legal advice; I am not a lawyer.
- **Segment:** all, especially junior groups. **Benefit:** avoids a legal and trust failure.
- **Effort:** M. **Dependencies:** rank 3.
- **Priority:** P0. **Stage:** before any real participant data.
- **Confidence:** high. **Evidence:** reviewed by a qualified person.

### 6. One-tap participant availability
- **Problem:** the coach learns who is absent when they arrive (H2); participants cannot respond (F-31).
- **Solution:** "I'm coming / I can't" per session from the participant's link; the coach sees an expected headcount on the next-session card (F-07).
- **Segment:** A and all group coaches. **Benefit:** turns attendance into coordination.
- **Effort:** M. **Dependencies:** ranks 3 and 4.
- **Priority:** P1. **Stage:** pilot.
- **Confidence:** medium. **Evidence:** H2 confirmed in interviews; participants answer at a useful rate in the pilot.

### 7. Recurring schedule management
- **Problem:** no holidays, no bulk change, no regular-time change, and past sessions would move if slots were edited (F-09, F-10).
- **Solution:** minimum for the pilot: bulk cancel or move by date range and venue. Later: schedule rules with effective dates, terms and exceptions.
- **Segment:** A and all. **Benefit:** a closed court or a holiday is one action.
- **Effort:** L in full; M for the pilot minimum. **Dependencies:** the data-model decision.
- **Priority:** P1. **Stage:** minimum in the pilot, the rest after.
- **Confidence:** medium. **Evidence:** how often interviewees change timetables and cancel in bulk.

### 8. Fast phone attendance
- **Problem:** the form is long and its controls are small (F-23, F-25, F-33).
- **Solution:** DF-05, then persistent.
- **Segment:** all. **Benefit:** attendance in well under a minute for ten people.
- **Effort:** S–M. **Dependencies:** none for the demo version.
- **Priority:** P1. **Stage:** demo, then pilot.
- **Confidence:** high. **Evidence:** time to mark a ten-person group, measured before and after.

### 9. Publish a plan to participants
- **Problem:** plans and assignments are separate, so the coach enters work twice (F-19).
- **Solution:** publishing a session plan to its group makes its exercises visible to participants with the group-specific instructions.
- **Segment:** A, D1. **Benefit:** realises the library differentiator.
- **Effort:** M. **Dependencies:** rank 3 for the real version; DF-12 for a demo version.
- **Priority:** P1. **Stage:** after the first pilot weeks.
- **Confidence:** low to medium. **Evidence:** coaches build plans and share drills regularly (H4).

### 10. Calendar feed
- **Problem:** participants must open the app to see the schedule (F-14).
- **Solution:** a read-only calendar subscription per group and per participant.
- **Segment:** all. **Benefit:** schedule changes appear in the calendar people already use.
- **Effort:** M. **Dependencies:** rank 3.
- **Priority:** P2. **Stage:** later.
- **Confidence:** medium. **Evidence:** participants say they live in their phone calendar.

### 11. Private lessons and trial sessions
- **Problem:** the model is group-only (no session type for one participant).
- **Solution:** a one-to-one session type and a trial status for a new participant.
- **Segment:** A. **Benefit:** covers an independent tennis coach's whole timetable.
- **Effort:** M. **Dependencies:** rank 4.
- **Priority:** P2. **Stage:** later.
- **Confidence:** low. **Evidence:** share of a coach's week that is one-to-one.

### 12. Several coaches, roles and substitutes
- **Problem:** one coach is hard-wired (F-12).
- **Solution:** coach on a session, roles (owner, coach), a "cover this session" action.
- **Segment:** B; A with assistants. **Benefit:** unlocks academies.
- **Effort:** L. **Dependencies:** rank 3.
- **Priority:** P2. **Stage:** later.
- **Confidence:** low. **Evidence:** a pilot coach has assistants, or a club asks.

### 13. Venue and court conflict warnings
- **Problem:** the same place and time can be booked twice (F-11).
- **Solution:** a venue entity and an overlap warning, not a block.
- **Segment:** A, B. **Benefit:** fewer double-bookings.
- **Effort:** M. **Dependencies:** rank 4.
- **Priority:** P2. **Stage:** later.
- **Confidence:** low. **Evidence:** interviewees describe clashes.

### 14. Capacity and waiting lists
- **Problem:** limited classes need a cap and a queue (Pilates).
- **Solution:** a capacity per group or session, a waiting list, automatic promotion.
- **Segment:** C. **Benefit:** table stakes in studio software.
- **Effort:** L. **Dependencies:** ranks 3, 4 and 6.
- **Priority:** P3. **Stage:** only if Pilates is chosen.
- **Confidence:** low. **Evidence:** studios would switch for this.

### 15. Real-time chat and push
- **Problem:** the demo chat is simulated (F-28, F-29).
- **Solution:** persistent, delivered chat with push.
- **Segment:** all. **Benefit:** replaces WhatsApp for some coaches.
- **Effort:** XL. **Dependencies:** ranks 3, 4 and 2.
- **Priority:** P3. **Stage:** later, if at all.
- **Confidence:** low. **Evidence:** see §4.

## 6. Decision by feature area

Essential now = needed for the demo or the interviews. Pilot = needed for the first real pilot. Later = after validation. Unnecessary or harmful = do not build.

| Area | Item | Decision | Reason |
|---|---|---|---|
| Scheduling | Recurring weekly schedule | Exists | Move to a data model with effective dates (rank 7) |
| | Reschedule, cancel, substitute | Pilot (cancel, reschedule); later (substitute) | Substitute needs several coaches |
| | Bulk cancel or move | Pilot | Closed courts and holidays |
| | Venue or court conflicts | Later | Needs a venue entity |
| | Participant-facing schedule | Pilot | Exists in the demo; make it real |
| | Calendar feed | Later | Rank 10 |
| | Automatic change communication | Pilot | Rank 2 |
| Groups and people | Create and edit groups | Pilot | Rank 4 |
| | Capacity and waiting lists | Unnecessary now | Rank 14, only for Pilates |
| | Move participants between groups | Pilot, with roster snapshots | F-17 |
| | Attendance history per participant | Later | After coaches use the data |
| | Multiple coaches | Later | Rank 12 |
| Training delivery | Reusable exercises and templates | Exists | Keep |
| | Assign plans to groups | Exists (exercises); plans later | Rank 9 |
| | Share videos | Exists as links | Fix the seeds (DF-04) |
| | Track views and completion | Unnecessary now | Reopen on evidence |
| Attendance | Fast marking on a phone | Essential now | DF-05 |
| | Late and excused | Later | Only if used |
| | Summaries by group or period | Later | After a coach asks |
| Communication | Announcements | Pilot | With delivery |
| | Direct messages | Later | Rank 15 |
| | Read status | Pilot, for change notices only | Shows who has seen a change |
| | Notifications | Pilot | Rank 2 |
| Club and business | Roles and permissions | Later | Rank 12 |
| | Membership and class packs | Unnecessary now | Studio feature |
| | Trial sessions and registration | Later | Rank 11 |
| | Subscription and billing | Harmful now | `PRODUCT_STRATEGY.md` §8 |
| Foundations | Authentication, persistence, isolation | Pilot | Rank 3 |
| | GDPR, minors, export, deletion | Pilot | Rank 5 |
| | Backups | Pilot | Required before real data |
| | Offline-tolerant attendance | Later | F-34; design for it, build if needed |

## 7. Proposed changes to `ROADMAP.md` (none applied)

| Proposal | Rationale | Evidence |
|---|---|---|
| Move "Coach group management" out of Phase 1 and into the pilot work (rank 4) | A local-only version helps no real coach and the demo can use per-segment seeds (DF-08) | Audit F-15 |
| Start Phase 3 with the change-and-notify loop, not chat | It is the core promise and the part still simulated | Audit F-28, `PRODUCT_STRATEGY.md` §5 |
| Treat DF-01 to DF-07 as part of Phase 1's "quality and demonstration" | They are small and fix first-impression problems | Audit §3 |
| Keep Phase 2 as the gate | No pilot work before the go decision | `ROADMAP.md` Phase 2 exit |

Anything marked "hypothesis" in the audit or strategy that drove a ranking above is listed in each entry's evidence line. If interviews contradict it, the ranking changes, not the evidence.
