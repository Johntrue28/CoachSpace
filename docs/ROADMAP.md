# CoachSpace — Roadmap

> The single source of truth for what we are doing now. Rewritten on 7 November 2026, updated the same day (D-076).
> **Current phase: 1 — Solid demo** (steps S1–S8 below).

## Phase 0 — Setup ✅

GitHub, CI (lint, typecheck, unit tests, build), Vercel deployments and previews. Done in October 2026.

## Phase 1 — Solid demo (now)

The demo already has the core loop (agenda, who is coming, player answers, register from answers, groups
with invite, library, chat). It became too full. Phase 1 ends with a **simple, convincing demo** that matches
`DEMO_SPEC.md`. One pull request per step; the owner merges.

| Step | What | Status |
|---|---|---|
| S1 | **Remove:** Pilates scenario; claps, streaks, swipe card, "My season" panel (keep the player's attendance %); activity bell; global attendance switch; "Coming soon" settings; unused dashboard components | Done in PR (S1, D-077) — awaiting merge |
| S2 | **Home and session page:** rename Agenda to Home (coach and player); whole cards and rows clickable; latest announcement pinned on Home; no week strip, no session sheet, no duplicate next session; session page order; no group link card; read-only plan view; small change links | Done in PR (S2, D-078) — awaiting merge |
| S3 | **Groups:** tabs Players, Sessions, Attendance, Exercises; attendance overview per group and attendance % in the list; no group-first assign page; group form unchanged | Done in PR (S3, D-079) — awaiting merge |
| S4 | **Library and planning:** tabs Exercises and Plans; one assign flow for exercises; plans created and edited in Library and assigned to sessions; read-only in the session; no separate templates | To do |
| S5 | **Lifts (carpool)** at the bottom of every session for coach and player: offer, join/leave, need a lift, "I can take you"; rules in `src/data/` with unit tests | To do |
| S6 | **Calendar** month only (session creation unchanged); **Profile** (Calendar, Attendance, Settings); **Attendance** with registers to take and a log by date per group; **Create (+)** with four items; **Settings** (Demo + Language) | To do |
| S7 | **Language:** English by default, Spanish in Settings (translation files; no large dependency without approval) | To do |
| S8 | **Check and document:** e2e scripts, audits for three scenarios, screenshots in English and Spanish, `ARCHITECTURE.md` rewritten to match the code | To do |

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

Ads, gamification, team kitty and fines, line-ups, polls and native features beyond notifications,
until real coaches ask for them.
