# CoachSpace — Project Rules

> CoachSpace is a provisional product name. This document defines the working rules for AI coding assistants and contributors.

## 1. Project Overview

CoachSpace is a mobile-first, responsive web application for sports coaches and their groups.

The product aims to bring together:
- Group and one-to-one communication.
- Training calendars and sessions.
- Announcements.
- Attendance tracking.
- Exercise and technique video resources.
- A participant-facing experience.

Coaches are the intended paying customers. Participants are intended to use the product for free.

**Current phase:** see `docs/ROADMAP.md` (the single source of truth for the current phase).

The current goal is to validate the concept with coaches before investing in a production backend.

## 2. Required Documentation

Before starting a substantial task, read:
- `docs/PRODUCT.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`

If a required document is missing, report it instead of inventing its contents.

Treat these files as the shared source of truth. If the documentation conflicts with the existing code or with itself, explain the conflict before making significant changes.

## 3. Language

- All code, variable names, comments, UI text, commit messages, and documentation must be in English.
- Use **British English** spelling and conventions (e.g. colour, organise, 24-hour times such as 18:00).
- Communicate with the project owner in Spanish.
- Explain technical decisions in simple Spanish because the owner is a beginner programmer.
- Give exact commands, explain where to run them, and describe any required manual clicks or configuration.

## 4. Technology Stack

The agreed stack is:
- Next.js with the App Router.
- TypeScript.
- Tailwind CSS.
- Node.js 22, specified in `.nvmrc`.
- GitHub for version control.
- Vercel for hosting and deployment.
- Supabase only when explicitly authorised by the roadmap and the product owner.

**Do not change the stack without explicit approval.**

Do not migrate frameworks, replace the build system, introduce a different styling system, or add major dependencies without approval.

Inspect the existing repository before proposing structural changes.

## 5. Working Method

Work on one small, clearly defined task at a time.

Before editing:
1. Understand the requested outcome.
2. Inspect the relevant files and existing implementation.
3. Check the current roadmap phase and applicable decisions.
4. Explain the plan in Spanish before significant or risky changes.

During implementation:
- Modify only files needed for the approved task.
- Prefer small, understandable changes over large rewrites.
- Preserve working functionality and visual consistency.
- Reuse existing components and patterns where appropriate.
- Avoid unnecessary dependencies and duplicated code.
- Do not delete files, data, or features without approval.
- Do not include unrelated improvements in the same task.
- Do not silently expand the scope.

If a task requires a major architectural or product decision, ask the owner before proceeding.

## 6. Roadmap Discipline

Always follow `docs/ROADMAP.md`.

### Phase 0 — Setup
- Complete the GitHub workflow.
- Verify CI.
- Deploy the initial application to Vercel.
- Confirm that the public deployment works.

### Phase 1 — Interactive Demo
- Build the agreed screens using fictional data.
- Focus on the coach dashboard, groups, chat interface, announcements, calendar, attendance, exercises, and participant view.
- Do not introduce a production backend.

Do not implement Supabase, production authentication, persistent multi-user chat, billing, or native mobile applications unless explicitly authorised.

Do not mark roadmap tasks complete without evidence.

## 7. Architecture and Demo Data

Follow `docs/ARCHITECTURE.md`.

- Keep fictional data and relevant types in `src/data/`.
- Keep reusable UI components in `src/components/`.
- Pages should access data through the agreed data layer rather than duplicating sample data.
- Use the existing design tokens and styling conventions.
- Keep the application structured so a future data source can replace demo data without unnecessarily rewriting the UI.
- Do not restructure the project without explaining why and obtaining approval.

## 8. UI and Interaction Requirements

- The application must be responsive, with mobile usability treated as a core requirement.
- Keep navigation, spacing, typography, and interaction patterns consistent.
- Use existing design tokens rather than introducing arbitrary colours or styles.
- Every visible interactive control must work or be clearly marked `Coming soon`.
- Avoid dead links, misleading buttons, and interactions that appear to succeed but do nothing.
- Use fictional names, messages, schedules, and participant data.

### Simulated Functionality

The demo may simulate interactions locally.

However:
- Simulated messages must never be represented as delivered to other users.
- Local changes must not be described as cloud-persistent.
- Do not claim authentication, notifications, attendance synchronisation, or backend-dependent functionality is real unless implemented and tested.
- Make limitations clear when a workflow is only a visual demonstration.

## 9. Security and Privacy

- Never commit API keys, passwords, tokens, or other secrets.
- Store local secrets in `.env.local` and ensure the file is ignored by Git.
- Document required environment variable names in `.env.example`, using placeholders instead of real credentials.
- Never expose private credentials in client-side code.
- Never use real personal data in the demo.
- Collect no unnecessary personal information.

Before a real pilot:
- Implement and test server-side and database-level access controls.
- Never rely only on hiding UI elements to protect data.
- Test access between different coaches, groups, and participants.
- Review GDPR obligations and safeguards for minors.
- Do not claim the application is production-secure without appropriate verification.

## 10. Git, GitHub, and Deployment

- Keep `main` in a working, deployable state.
- Use a separate branch for each meaningful change.
- Open a pull request when supported by the repository workflow.
- Review CI results and the Vercel preview before merging.
- Do not bypass the established pull-request process.
- Do not merge or deploy risky changes without the owner's approval.
- Never rewrite shared Git history or force-push without explicit approval.
- Never commit secrets or files that should be ignored.

Explain Git commands and manual steps in simple Spanish.

## 11. Commands and Verification

Expected project commands:

- `npm run dev` — start the local development server.
- `npm run lint` — run lint checks.
- `npm run typecheck` — check TypeScript types.
- `npm run build` — build the application for production.
- `npm run check` — run the combined checks.

Before finishing a coding task:
1. Run relevant checks.
2. Run `npm run check` where the environment permits it.
3. Investigate failures and report whether they relate to the change.
4. Report skipped checks and environmental limitations.

Inspect `package.json` if a script is missing or behaves differently. Do not invent commands.

Never claim a test, build, deployment, or integration succeeded unless its result was verified.

## 12. Definition of Done

A task is complete only when:
- The requested change has been implemented.
- Relevant existing functionality has been preserved.
- Relevant checks have been run and their results reported honestly.
- Known limitations are documented.
- Relevant documentation has been updated when a decision, architecture rule, or roadmap status changes.

At the end of every task, summarise in Spanish:
1. What changed.
2. Which files were modified.
3. Which tests were run and their results.
4. What remains incomplete or unverified.
5. Any manual action required from the owner.

Do not automatically begin another task.

## 13. Changing Project Rules

The product owner has final authority over scope, architecture, priorities, and technical decisions.

For any proposed change to the stack, architecture, business model, roadmap phase, or core product scope:
1. Explain the proposal and its benefits.
2. Explain its costs, risks, and alternatives.
3. Wait for explicit approval.
4. Update the relevant documentation after approval.

Never silently override these rules.
