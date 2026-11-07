# CoachSpace — Product

> One page that says what CoachSpace is, who it is for and what it deliberately is not.
> Rewritten on 7 November 2026 to replace the earlier product, audit and strategy documents.
> "CoachSpace" is a provisional name.

## 1. Goal

Become the app that coaches and sports schools in **Spain** (first) and the **Netherlands** use to run
their groups — what PlayerPlus/TeamPlus is in Germany — by being **simpler for the team** and **more useful
for the coach**.

## 2. Who it is for

| Who | What they do in CoachSpace | Pays? |
|---|---|---|
| **Coach** with several groups (tennis/padel school, grassroots football, basketball club) | Plans the week, sees who is coming, changes a session once and everyone knows, takes the register, keeps exercises and notes | Yes (later) |
| **Player** (or the parent of a young player) | Answers "Are you coming?", sees the time and place, reads messages, opens the exercises the coach gave them | Never |
| **School coordinator** (later) | Several coaches under one school | Yes (later) |

## 3. The core loop (everything else serves it)

1. The coach's groups have weekly sessions (generated from the weekly schedule).
2. Each player answers **Going / Maybe / Can't go**.
3. The coach sees **who is coming** on Home and on the session, and can remind those who have not answered.
4. If something changes (cancel, move, new place), the coach changes it **once** and every player sees it.
5. At the session the register is **already filled in** from the answers; the coach only corrects it.

What makes CoachSpace different from TeamPlus, Teamy and Spond (the coach's method):

- an **exercise library** reused across groups;
- **plans** built in the library and attached to each session, readable at a glance;
- **notes from last time** when preparing the next session;
- exercises (with a YouTube/Vimeo video) **assigned to a group or to one player**.

## 4. Product principles

1. **The session is the centre.** Who is coming, the plan, the register and the notes all live in the session.
2. **One primary action per screen**, clearly the strongest element.
3. **Nothing twice.** Each action and each piece of information has one obvious place.
4. **Short screens.** The coach's home fits in about two phone screens.
5. **Players never pay and never see ads.**
6. **Honest demo.** Anything that would reach another person (reminders, invitations, messages) says it is
   simulated. Data is fictional and stays in the visitor's browser.
7. **A feature must earn its place.** If it is not part of the core loop or the coach's method, it does not go
   in until a real coach asks for it.

## 5. In the demo / not in the demo

**In:** Home (what is coming, latest announcement), sessions with who is coming, reminders (simulated),
cancel/move, register, attendance log per group, groups with invite (simulated) and members, exercise library,
plans made in the library and shown read-only in each session, notes, assigned exercises, lifts (carpool) per
session, group and one-to-one chat, announcements, calendar (month), player view, three example sports,
English and Spanish.

**Out (removed on purpose):** gamification (claps, streaks, swipe cards), a separate templates concept, a global "attendance on/off" switch, "Coming soon" settings, the activity bell, a session sheet that
duplicates the session page, the week strip and week board, the Pilates example.

**Not yet (needs a backend or a decision):** real accounts, real notifications, payments, native apps,
roles beyond coach/player, parent accounts, polls, team kitty, line-ups.

## 6. Business model (hypothesis to test, not decided)

Free for players and for a coach with one group; **Coach Pro** for several groups and the planning tools;
**School** plan for several coaches. Never ads. Prices to test are in `STRATEGY.md`.

## 7. What we still need to learn

- Do coaches in Mallorca and Groningen want this enough to move their group off WhatsApp?
- Do players actually answer? (target: more than 60% of invited players answer)
- Will a coach pay for the planning tools? (target: 3 coaches paying full price)
