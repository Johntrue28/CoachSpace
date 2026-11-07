# CoachSpace — Roadmap

> The single source of truth for what we are doing now. Rewritten on 7 November 2026.
> **Current phase: 1 — Solid demo** (simplification S1–S7 below).

## Phase 0 — Setup ✅

GitHub, CI (lint, typecheck, unit tests, build), Vercel deployments and previews. Done in October 2026.

## Phase 1 — Solid demo (now)

The demo already has the core loop (agenda, who is coming, player answers, register from answers, groups
with invite, library, chat). It became too full. Phase 1 ends with a **simple, convincing demo** that matches
`DEMO_SPEC.md`. One pull request per step; the owner merges.

| Step | What | Status |
|---|---|---|
| S1 | **Remove:** Pilates scenario; claps, streaks, swipe card, "My season" panel (keep the player's attendance %); activity bell; global attendance switch; "Coming soon" settings; unused dashboard components | To do |
| S2 | **Agenda and session page** as in `DEMO_SPEC.md` (no week strip, no session sheet, no duplicate next session; session page order; small change links) | To do |
| S3 | **Groups:** three tabs (Players, Sessions, Exercises), simpler group form, no group-first assign page | To do |
| S4 | **Planning:** library = exercises; one assign flow; plans only inside sessions with "Copy from last session"; no templates or plans list | To do |
| S5 | **Calendar** month only; **Attendance** page simplified; **Create (+)** with four items; **Menu** and **Settings** (Demo + Language) | To do |
| S6 | **Language:** English by default, Spanish in Settings (translation files; no large dependency without approval) | To do |
| S7 | **Check and document:** e2e scripts, audits for three scenarios, screenshots in English and Spanish, `ARCHITECTURE.md` rewritten to match the code | To do |

**Exit criteria:** every item of `DEMO_SPEC.md` is done and checked; the owner has used the preview on a
phone and approves it.

## Phase 2 — Validation with coaches

- Show the demo **in person** to at least 5 coaches (Mallorca and Groningen) and ask the contact who uses
  PlayerPlus what would make them switch.
- Record what they use, what they ignore and whether they would pay.
- **Gate:** at least 3 coaches say they would try it with their real group this season.

## Phase 3 — Real pilot (needs the owner's approval of the stack)

Proposal, not approved: **Supabase in the EU** (accounts with email magic link, row-level security, data per
coach and group) and the **core loop for real**: groups, invite link, answers, change notices, register.
The mobile app would be **React Native with Expo** (iOS and Android), keeping this Next.js app for the web.
- **Gate:** 3–5 real groups use it 4 weeks in a row; more than 60% of players answer.

## Phase 4 — App stores and first payments

Publish on the App Store and Google Play (TestFlight and Play closed testing first); Coach Pro and School
plans on the web (Stripe). **Gate:** 3 coaches pay full price.

## Not planned

Ads, gamification, team kitty and fines, carpools, line-ups, polls and native features beyond notifications,
until real coaches ask for them.
