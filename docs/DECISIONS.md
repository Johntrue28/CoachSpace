# CoachSpace — Decisions

This document records important product and technical decisions.

Statuses:
- **Accepted:** Follow unless the owner explicitly approves a change.
- **Provisional:** Working hypothesis that may change with evidence.
- **To decide:** Not yet resolved.

| ID | Date | Status | Decision | Rationale |
|---|---|---|---|---|
| D-001 | 2026-10-11 | Accepted | Start with one responsive web app; consider a PWA later and native apps only if customers need them. | One codebase, shareable links, and faster iteration. |
| D-002 | 2026-10-11 | Accepted | Use Next.js App Router, TypeScript, and Tailwind CSS; deploy through Vercel connected to GitHub. | A maintainable web stack with preview deployments. |
| D-003 | 2026-10-11 | Accepted | The demo uses fictional data; do not introduce Supabase before the roadmap authorises a real pilot. | Avoid premature backend complexity. |
| D-004 | 2026-10-11 | Accepted | Keep code, UI text, commit messages, and documentation in British English; communicate with the owner in Spanish. | Consistency in the product and clear communication with the owner. |
| D-005 | 2026-10-11 | Provisional | Coaches or academies pay; participants use the product for free. | A coach can invite a whole group, but the buying model must be validated. |
| D-006 | 2026-10-11 | Accepted | The first deliverable is an interactive demo, not a production-ready SaaS. | Validate the problem and solution before investing in backend infrastructure. |
| D-007 | 2026-10-11 | Accepted | Chat is simulated during the demo and must never be represented as real multi-user messaging. | Real messaging requires persistence, identity, and access control. |
| D-008 | 2026-10-11 | Accepted | Keep fictional data in `src/data/`, separate from UI components. | Allows the data source to change later with less UI rework. |
| D-009 | 2026-10-11 | Accepted | Use external video links or embeds during the demo instead of building video hosting. | Reduces storage, bandwidth, and implementation complexity. |
| D-010 | 2026-10-11 | Accepted | Work in small, reviewable increments and preserve working functionality. | Easier to understand, test, and reverse changes. |
| D-011 | 2026-10-11 | Provisional | CoachSpace is the working product name. | Branding and availability have not been fully validated. |
| D-012 | 2026-10-11 | Provisional | Test approximately €9.90/month for an early pilot and €19.90/month as a possible individual-coach price. | Concrete starting hypotheses for customer conversations, not final prices. |
| D-013 | 2026-10-11 | Accepted | Do not add native apps, complex analytics, AI coaching, billing, or advanced academy management without evidence and owner approval. | Keep the initial product focused. |
| D-014 | 2026-10-11 | Provisional | The first target discipline is not chosen yet; research covers tennis, football, basketball, and Pilates coaches. Demo data includes one group from each. | Customer interviews should decide the initial focus. |
| D-015 | 2026-10-11 | Accepted | The current phase is recorded only in `docs/ROADMAP.md`; other documents link to it. | Avoids outdated copies of the project status. |
| D-016 | 2026-10-11 | Accepted | Upgrade Next.js 15.5.4 → 15.5.27 and React 19.1.0 → 19.1.9; pin Node to `22.x`. | 15.5.4 is affected by CVE-2025-66478; pinning Node avoids automatic major upgrades on Vercel. |
| D-017 | 2026-10-11 | To decide | Upgrade to Next.js 16. | Remaining `npm audit` findings (PostCSS bundled inside Next.js 15) are only fixed in Next.js 16, a major version that needs owner approval and testing. Low risk now: the app only processes its own CSS at build time. |
| D-018 | 2026-10-11 | Accepted | `main` is protected by the documented pull-request workflow, not by a GitHub branch protection rule. | Branch protection is not available for private repositories on the GitHub Free plan. Revisit if the plan changes. |
| D-019 | 2026-10-11 | Accepted | Move the start of coach interviews from Phase 0 to Phase 1, before the demo is shown. | Owner prefers to have a more developed product first. Trade-off: less early evidence before building screens. |
| D-020 | 2026-10-11 | To decide | Final public URL and repository name (currently `coach-scpace.vercel.app` and `CoachScpace`, which contain a typo). | Should be fixed before sharing the demo with coaches. Can be changed in Vercel (Settings → Domains) and GitHub (Settings → Repository name). |
| D-021 | 2026-10-11 | Accepted | Prioritise functional coach features over the visual identity during Phase 1. | Owner wants the most complete working demo first; visual polish follows once workflows exist. |
| D-022 | 2026-10-11 | Accepted | The reusable exercise library is the core differentiator: one library per coach, reused across groups, with group-specific instructions and assignment to selected participants. Built before chat. | Saves repeated work for coaches with several groups; distinguishes the product from group messaging apps. To be validated in interviews. |
| D-023 | 2026-10-11 | Accepted | Demo changes (exercises, assignments) are saved in the browser's localStorage and clearly labelled "saved on this device only"; a "Reset demo data" action restores the fictional data. | Makes the demo convincing across reloads without a backend, while staying honest that nothing is shared or stored in the cloud. |

## Decision Rules

1. The product owner has final authority over scope, architecture, and priorities.
2. Accepted decisions must not be silently changed.
3. Provisional decisions must be validated before they are treated as settled facts.
4. Before changing a major decision, explain the alternatives, costs, and consequences.
5. After an approved change, update this file and the relevant roadmap, product, or architecture document.
6. Do not record a proposal as accepted without the owner's approval.
