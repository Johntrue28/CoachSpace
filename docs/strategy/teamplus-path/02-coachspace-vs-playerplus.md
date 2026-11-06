# 02 — CoachSpace vs PlayerPlus: comparison and what to adopt

> Based on the repository at `main` (commit `2460e44`) and the demo opened locally at 390 × 844 px and
> 1440 px on 6 November 2026.

## Summary

- **Missing:** the member answering "going / not going", invitations and real notifications. Without them
  CoachSpace is a coach tool the team never needs to open.
- **Too much:** the coach home was about 4,100 px tall on a phone (almost 5 screens) with 11 blocks, and the
  same action appeared in several places. That is why it felt confusing.
- **Better than PlayerPlus:** reusable exercise library, session plans, notes between sessions and videos
  assigned to players.
- **The play:** copy PlayerPlus's core (event + answer + notice) almost as is, and make the coach's
  technical work the reason to pay.
- **The code is a good base:** ~16,100 lines of ordered TypeScript, data separated from UI, 22 unit-test files.

## Feature comparison

| Feature | PlayerPlus | CoachSpace (before the redesign) | Priority |
|---|---|---|---|
| iOS and Android apps | Yes, native | No (mobile web) | High |
| Web with sign-in | Yes | Demo without sign-in | High |
| Accounts and invite-by-link | Yes | No | Essential |
| Member answers going / not going | Yes, real time | No | Essential |
| Push notifications of changes | Yes | No | Essential |
| Parent/guardian accounts | Yes | No | Essential (schools, youth) |
| Create training, matches, events | Yes | Yes | — |
| Cancel or move and notify | Yes (Premium) | Cancel/move; nobody is told | High |
| Attendance records and statistics | Yes | Yes (coach takes it afterwards) | Medium: link to the answers |
| Team chat | Yes | Simulated | Medium |
| Announcements / pinned news | Yes | Yes (simulated) | Medium |
| Polls | Yes | No | Low |
| Roles (coach, team manager, treasurer) | Yes | Coach / participant only | Medium |
| Line-ups | Yes | No | Low |
| Fixture import / calendar subscription | Yes | No | Medium |
| Treasury and fines; carpools | Yes | No | Low |
| Reusable exercise library | No | Yes | Differentiator |
| Session plans and templates | No | Yes | Differentiator |
| Coach notes between sessions | No | Yes | Differentiator |
| Videos assigned to individual players | No (videos on an event only) | Yes | Differentiator |
| Many groups under one coach | Each group is a separate team | Yes, built in | Differentiator |
| No ads or tracking in the free version | No | Yes | Keep |

## Why the demo felt confusing

It was organised like an admin panel (one module per feature, everything visible at once) instead of around
what the coach does today.

1. **A five-screen home.** ~4,100 px at 390 × 844 with 11 blocks of equal weight. PlayerPlus opens on the
   list of upcoming events.
2. **The same thing in many places.** "Take attendance" in the next-session card, the quick actions and the
   attendance card; the month calendar on the home and on Calendar; quick actions repeating the navigation.
3. **Eight navigation destinations**, with daily attendance hidden under "More".
4. **Thinking in modules.** Preparing tomorrow's session meant visiting Calendar, Library, Announcements and
   Attendance. In PlayerPlus everything hangs off the event.
5. **Two bars before content.** The Coach/Participant strip plus the header used ~110 px of every screen.
6. **Month grid on a phone.** ~50 px cells with "18:00 U16" chips: hard to read and to tap.
7. **Nothing for the participant to do.** Seven read-only blocks, including the full calendar again.
8. **Explanatory text everywhere.** A subtitle under every title, the welcome card on the first screen.
9. **Template look.** Everything a white bordered card, a "See all" on every section, a donut and big
   numbers typical of desktop admin panels: flat hierarchy, no clear primary action per screen.
10. **English only.** To be the PlayerPlus of the Netherlands and Spain the app must speak Dutch and Spanish.

## What to adopt from PlayerPlus, in order

| # | Adopt | Why | In CoachSpace |
|---|---|---|---|
| 1 | Going / not going / maybe per event | The reason the whole team opens the app | Large buttons on the event card and in the notification; count visible to the coach |
| 2 | Invite the group with a link | Growth: one coach brings 15–20 people | Link or QR per group; sign-up under a minute, passwordless |
| 3 | Notifications of changes | Replaces "time changed" lost in WhatsApp | Push on cancel/move/new place; reminder to non-responders |
| 4 | Parent/guardian accounts | ~40% of PlayerPlus teams are youth teams | A guardian answers for one or more children |
| 5 | The event as the central screen | Removes navigation by module | One event: who is coming, plan, notices, notes, register |
| 6 | Four-step, five-minute onboarding | Lowers the barrier to try | Create group → weekly schedule → invite → done |
| 7 | Freemium for the team | The team never pays; the organiser does | Players and families always free |
| 8 | Per-team/group price with volume discount | The anchor the market knows | See `03-market-strategy-nl-es.md` |
| 9 | Calendar subscription and fixture import | Fits personal calendars and federations | .ics link per group; CSV import |
| 10 | Real-world roles | Assistants and team managers share work | Head coach, assistant, team manager, player, guardian |

**Not now:** treasury with fines, carpools, prediction games, line-ups, Apple Health — mature-product or
very German features that would pull effort away from the core.

## Where CoachSpace can be different

1. **The coach with many groups, not the team.** "One coach or school, many groups, one library" fits tennis
   schools, grassroots football academies and municipal sports schools.
2. **The technical work.** Library, reusable plans, "from last time" notes, videos per player: the reason to pay.
3. **Trust for families.** No ads, no advertising tracking, EU hosting, clear permissions for minors.
4. **Local for real** (to validate): language, local vocabulary (categorías, *benjamín/alevín*, *JO11*,
   *vereniging*), local support and presence.

## Recommendations

| Action | What | Detail |
|---|---|---|
| Remove | Big figures, attendance donut, quick actions, month calendar on the home | They duplicate other screens and lead to no action |
| Remove | Explanatory subtitles under every title | The product should explain itself |
| Simplify | Home = agenda of the next 7 days with "12 going · 3 not · 5 no reply" per event | One screen, one action per row |
| Simplify | Month calendar on tablet/desktop; agenda by day on phones | Readable, tappable |
| Simplify | Chat + Announcements = "Messages" | One place to communicate |
| Simplify | Attendance inside the event, pre-filled from the answers | Taking the register becomes confirming |
| Simplify | The demo explained in a short dismissible guide, not on the home | The product is visible at once |
| Build | Going/not going, invite link, notifications, guardians | PlayerPlus's core |
| Build | Group management (create, edit, add members) | Missing and the first thing a real user does |
| Build | Spanish, Dutch and English | Required to compete locally |
| Keep | Library, plans, notes, videos per player | The differentiator, inside each event |

The redesign of the demo that implements these recommendations is in `05-demo-redesign-plan.md`.
