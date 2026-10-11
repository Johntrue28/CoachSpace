# CoachSpace — Roadmap

> Current phase: Phase 1 — Interactive Demo. (Phase 0 completed on 2026-10-11.)
>
> Customer interviews are scheduled in Phase 1, before the demo is shown to coaches (see D-019).

> Latest handover (state, limitations, visual audit and the plan for the visual redesign): `docs/HANDOVER.md`.

## Phase 0 — Setup

**Objective:** Ensure the project can be developed, checked, versioned, and deployed reliably.

- [x] Next.js + TypeScript + Tailwind project exists.
- [x] `CLAUDE.md` and project documentation exist.
- [x] CI workflow for lint, typecheck, and build exists and passes on GitHub.
- [x] Confirm the local project starts successfully.
- [x] Run `npm run check` and resolve blocking errors.
- [x] Push the current code to GitHub.
- [x] Verify the GitHub repository and branch workflow. _(PRs #1 and #2 merged from branches. `main` has no technical branch protection: not available for private repositories on the GitHub Free plan — see D-018.)_
- [x] Connect the repository to Vercel. _(Vercel project `coach-scpace`.)_
- [x] Verify the first public deployment. _(https://coach-scpace.vercel.app — production deployment of commit `968a761` is Ready and shows the coach dashboard.)_
- [x] Confirm pull requests receive preview deployments. _(PR #3: Vercel preview Ready; CI and Vercel checks passed.)_

**Exit criteria:**
- The application can be run locally.
- Required checks pass, or any remaining issue is documented.
- The code is in GitHub.
- A working deployment is available, or the deployment blocker is clearly identified.

Do not begin unnecessary infrastructure work while these tasks remain incomplete.

## Phase 1 — Interactive Demo

**Objective:** Build a convincing prototype using fictional data to validate the product concept.

**Order of work:** functional coach features first; the design foundation comes after the main workflows exist (see D-021).

**Next:** quality and demonstration tasks below (all planned coach and participant features exist). The implementation order and prompts are in [`IMPLEMENTATION_PROMPTS.md`](IMPLEMENTATION_PROMPTS.md).

### Design foundation
- [ ] Define the visual identity: colours, typography, spacing, and placeholder logo. _(Next session; starting point and visual audit in `docs/HANDOVER.md`.)_
- [ ] Create or refine shared layout and reusable components.
- [ ] Ensure responsive navigation works on mobile and desktop.

### Coach experience
- [x] Exercise library: reusable across groups, group-specific instructions, assign to selected participants, create exercises. _(Core differentiator — D-022. Completed with exercise editing, descriptions, categories, YouTube/Vimeo validation and multi-group assignment — D-028.)_
- [ ] Dashboard and navigation.
- [x] Groups and participants. _(Group list, group detail with sessions, announcements and searchable participant list.)_
- [x] Chat interface with clearly simulated behaviour. _(Group and one-to-one conversations, fictional history, simulated sending kept in memory only — D-024.)_
- [x] Announcements. _(Board with group filter, posting form, shown on the dashboard and group detail; saved on this device only — D-023.)_
- [x] Training calendar and sessions. _(Navigable week view, session detail, generated from each group's weekly schedule — D-026.)_
- [x] Attendance interface. _(Take and correct attendance from a session, live summary, dashboard summary; saved on this device only — D-027.)_
- [x] Unread indicators calculated from messages and read state. _(D-030.)_
- [x] Calendar session management: one-off sessions, reschedule, change place, cancel/restore. _(D-031. The dashboard week widget was later replaced by the month widget — D-037.)_
- [x] Session builder with reusable templates and group adaptations. _(D-032.)_
- [x] Coach memory: notes after each session, shown when preparing the next one. _(D-033.)_
- [x] Participant view. _(Coach/Participant demo switch, participant home, groups, calendar, chats and My Videos for a fictional participant in two groups — D-029.)_
- [x] UX clean-up: monthly calendar widget, simpler Home without summary tiles, compact unread badge, attendance always tied to a group, back links that return to the previous page. _(D-035, D-036, D-037.)_
- [ ] Coach group management: create and edit groups and their members. _(Planned as a separate pull request.)_

### Quality and demonstration
- [ ] Test the main workflows. _(Unit tests run in CI; browser scripts for the main flows are kept in `tests/e2e/` and run by hand. Still to do: a walkthrough on the deployed version.)_
- [ ] Check mobile layouts and common screen sizes.
- [ ] Fix broken controls, dead links, and blocking visual issues.
- [ ] Begin contacting coaches for initial interviews.
- [ ] Prepare a short walkthrough of approximately three minutes.
- [ ] Show the demo to at least five relevant coaches.
- [ ] Record feedback, objections, and feature priorities.

**Exit criteria:**
- The demo is accessible by link.
- Core navigation and workflows work.
- The application is usable on mobile and desktop.
- All demo data is fictional.
- Simulated functionality is not presented as real multi-user functionality.
- The owner has shown the demo to relevant coaches and documented feedback.

## Phase 2 — Customer Validation

**Objective:** Decide whether the product deserves investment in a real pilot.

This phase can run alongside Phase 1.

- [ ] Interview 5–10 coaches.
- [ ] Document current tools, recurring problems, and workarounds.
- [ ] Identify the most important problem to solve first.
- [ ] Determine which demo features coaches actually value.
- [ ] Test the proposed pricing hypotheses directly.
- [ ] Seek 2–3 coaches willing to commit to a defined pilot.
- [ ] Seek at least one concrete willingness-to-pay signal.
- [ ] Review the evidence and decide whether to proceed, revise, or stop.

**Exit decision:**

The product owner must explicitly choose one of the following:
- Proceed to a narrowly scoped real pilot.
- Revise the product and repeat validation.
- Change the target customer or main problem.
- Pause or stop the project if evidence is insufficient.

Do not proceed automatically to Phase 3 just because the demo is finished.

## Phase 3 — Real Pilot

**Prerequisite:** The owner has reviewed the validation evidence and explicitly approved building a real pilot.

**Objective:** Enable a small number of coaches and participants to use the agreed core workflow with real accounts and persistent data.

Potential work, in order:
- [ ] Define the required data model and access rules.
- [ ] Configure Supabase safely.
- [ ] Implement authentication.
- [ ] Implement coach, group, and participant relationships.
- [ ] Implement and test database-level permissions.
- [ ] Add persistent versions of the highest-priority validated workflows.
- [ ] Implement persistent or real-time chat only if required by validated demand.
- [ ] Add loading, empty, error, and access-denied states.
- [ ] Test access isolation using separate test accounts and groups.
- [ ] Review data handling, GDPR obligations, and safeguards for minors.
- [ ] Prepare onboarding, feedback collection, and a process for reporting problems.

**Exit criteria:**
- Invited users can sign in and use the agreed core workflow.
- Data persists as intended.
- Users cannot access data they are not authorised to access.
- Critical permissions have been tested.
- Known limitations and operational responsibilities are documented.

Do not introduce real personal data before access controls and data handling have been reviewed.

## Phase 4 — Paid Product

**Prerequisite:** The pilot demonstrates meaningful recurring use and the owner approves commercialisation.

Potential work:
- [ ] Confirm pricing and plan limits.
- [ ] Implement subscription billing.
- [ ] Handle subscription changes and cancellations reliably.
- [ ] Create onboarding and account-management flows.
- [ ] Establish customer support and incident-handling processes.
- [ ] Establish appropriate backups, monitoring, and recovery procedures.
- [ ] Document data export, deletion, retention, and privacy practices.
- [ ] Review accessibility, performance, and browser compatibility.
- [ ] Evaluate multi-coach academy accounts only if customers need them.

**Exit criteria:**
- Customers understand the offer and price.
- Billing and cancellation workflows have been tested.
- Support and data-handling processes are in place.
- The owner has reviewed operational and legal responsibilities.

## Phase 5 — PWA or Native App

**Prerequisite:** Paying coaches demonstrate a concrete need that the responsive web application cannot adequately meet.

Potential work:
- [ ] Investigate whether a PWA satisfies the need.
- [ ] Assess the cost and benefit of native iOS or Android development.
- [ ] Validate the decision with existing customers.
- [ ] Obtain owner approval before starting platform-specific development.

A native app is not a default requirement.
