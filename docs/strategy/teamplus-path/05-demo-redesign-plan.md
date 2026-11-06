# 05 — Demo redesign plan (event-centred, PlayerPlus-style core)

> Approved by the owner on 6 November 2026 (D-071): "remodel the whole demo with everything in the analysis
> and the comparison, so coaches like it, it fits what TeamPlus users expect and it does not look confusing".
> Still a **demo**: fictional data, no backend, nothing sent to anyone (`CLAUDE.md` §6–§8). The stack does
> not change (Next.js + Tailwind). Every simulated action must say it is simulated.

## Goal

A coach who has used PlayerPlus/TeamPlus, Teamy or Spond should feel at home in ten seconds (agenda, events,
who is coming), and then see what those apps cannot do (plans, library, notes, videos per player, many groups).

## Design principles for every step

1. **The event is the centre.** Home is an agenda; each session opens a hub with who is coming, the plan,
   the register and notes.
2. **One primary action per screen**, clearly the strongest element.
3. **Fewer boxes.** Prefer list rows separated by hairlines inside one surface over many separate cards.
4. **No explanatory subtitles** on phones; the demo is explained once, in a dismissible guide.
5. **Never the same action in three places.** One obvious place per action.
6. **Honest simulation:** "Reminder prepared (demo — not sent)", "Only saved in this browser".
7. **Mobile first at 390 px**, then tablet and desktop; touch targets ≥ 44 px; WCAG AA contrast; existing tokens.
8. **British English** in UI and code (until the owner approves other languages, step R9).

## Steps and status

| Step | What | Status |
|---|---|---|
| R1 | RSVP data: going / maybe / not going per member and session, seeded, saved per scenario; reminders (demo) | Done in PR "Event-centred redesign" |
| R2 | App shell: coach tabs Agenda · Groups · Library · Messages; participant tabs Agenda · Exercises · Messages; compact header with the demo switch; secondary pages (Calendar, Attendance, Settings) from the header menu | Done in the same PR |
| R3 | Coach Agenda home: next days as an agenda with the answer count per session, "needs you" items, dismissible demo guide | Done in the same PR |
| R4 | Session hub: "Who's coming" first with remind non-responders (demo); register pre-filled from the answers | Done in the same PR |
| R5 | Participant: agenda with one-tap Going / Can't go / Maybe; the same on the session page | Done in the same PR |
| R6 | Messages = Chats + Announcements behind one tab with a segmented switch | Done in the same PR (switch on both pages) |
| R7 | Group management in the demo: create and edit a group, add members, "Invite link / QR" (simulated, copy link) | Done in PR "Group management (R7)" (D-072) |
| R8 | Visual pass on the remaining screens: Groups, Library, Calendar month view on desktop only, Settings; list rows, hierarchy, empty states | To do |
| R9 | Spanish and Dutch interface (i18n) — **needs the owner to change `CLAUDE.md` §3 first** | Blocked on decision |
| R10 | Update `tests/e2e` scripts and audits, `ARCHITECTURE.md`, `HANDOVER.md`, screenshots at 390/1440 px | Partly done (unit tests, decisions); e2e scripts to do |

## Prompts for Claude Code (paste one per session, in order)

Each prompt assumes the repository's `CLAUDE.md` is loaded. Start every session from an up-to-date `main`.

### R7 — Group management (demo)

```
Read CLAUDE.md, docs/ROADMAP.md, docs/DECISIONS.md (D-071) and
docs/strategy/teamplus-path/05-demo-redesign-plan.md (step R7).
Task: add demo group management, the PlayerPlus "create team → invite" flow.
- On /groups a primary "New group" action opens a short form: name, sport (from the scenario), weekly
  slots (day + time + duration, add/remove), venue, short code. Validate with clear messages.
- Group page: "Edit group" (same form) and "Add member" (name + optional guardian name). Members added in
  the demo are saved per scenario like other demo data (src/data/store.tsx + saved-state checks).
- "Invite" on the group page: a sheet with a fictional invite link (coachspace.app/join/<code>), "Copy link"
  and a QR placeholder drawn with SVG, plus the line "Demo: this link does not work and nobody is invited."
- New groups appear in the agenda, calendar and RSVP immediately (generated sessions).
- Put the rules in pure modules in src/data/ with unit tests (validation, slot generation, unique ids).
Keep the stack, tokens and the event-centred navigation. Run npm run check. Branch + PR. Summarise in Spanish.
```

### R8 — Visual pass on the remaining screens

```
Read CLAUDE.md, D-071 and docs/strategy/teamplus-path/02-coachspace-vs-playerplus.md (why it felt confusing).
Task: apply the redesign principles of 05-demo-redesign-plan.md to Groups, Library (Exercises and Session
plans), Calendar, Settings and the participant Exercises page.
- Replace stacks of separate cards with one surface containing list rows separated by hairlines where it
  reads better; keep cards only for genuinely separate objects.
- Remove explanatory subtitles on phones (PageHeader descriptions only from 640 px).
- Calendar: on phones open the agenda (list by day) by default; keep the month grid from 768 px.
- One primary action per screen; check every page at 360, 390, 768, 1024 and 1440 px with the layout,
  contrast and link audits in tests/e2e/audit and fix what they report.
Take before/after screenshots at 390 px and 1440 px and attach them to the PR. Run npm run check.
```

### R9 — Languages (only after the owner approves changing CLAUDE.md §3)

```
The owner approved Spanish (es-ES) and Dutch (nl-NL) interface languages besides British English.
Update CLAUDE.md §3 first (code and docs stay in English; UI text comes from translation files).
Add a lightweight i18n layer without a large dependency (or next-intl if approved): message files
src/i18n/en-GB.json, es-ES.json, nl-NL.json; a language switch in Settings saved in the browser; dates and
times with Intl in the chosen locale (24-hour). Translate the four demo scenarios' UI strings, not the
fictional content. Add a test that every key exists in all three files. Run npm run check.
```

### R10 — End-to-end scripts and handover

```
Update tests/e2e scripts and audits for the event-centred navigation (Agenda, Groups, Library, Messages;
participant Agenda, Exercises, Messages; RSVP buttons; remind non-responders; register pre-filled from
answers). Run sh tests/e2e/run-all.sh, fix failures, and update docs/HANDOVER.md, docs/ARCHITECTURE.md and
the README "Demo scenarios" section. Attach the audit summary to the PR.
```
