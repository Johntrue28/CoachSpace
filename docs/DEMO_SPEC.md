# CoachSpace — Demo specification (target state)

> What every screen of the demo contains after the simplification of November 2026 (D-075, D-076).
> Claude Code works towards this document; when the demo and this document disagree, the document wins
> unless the owner says otherwise. "Keep" = already right; "Change" = adjust; "Add" = new; "Remove" = delete
> the code, its route, its tests and its documentation.
>
> **Easy to read, not bare.** Overviews (attendance, plans, lifts) show the useful detail in a clear layout:
> big numbers, short labels, one idea per row. Simple to read does not mean empty.

## Global

| Item | Target |
|---|---|
| Sports | **Tennis/padel, Football, Basketball.** Remove the Pilates scenario, its photos, data, tests and copy. |
| Language | **English by default; Spanish selectable in Settings** (saved in the browser). Code, docs and commit messages stay in English. |
| Look | Keep palette B "Pista", group colours and the photographs (D-074). |
| Coach navigation | Bottom bar: **Home · Groups · (+) · Library · Messages**. The avatar opens **Profile** (Calendar, Attendance, Settings). Desktop: the same in the sidebar. |
| Player navigation | **Home · Exercises · Messages.** |
| Header | Logo, Coach/Player demo switch, avatar. **Remove the activity bell** everywhere. |
| Create (+) | Exactly four items: **New session, Announcement, Invite players, New group.** Remove "Take attendance" and "Session plan" from it. |
| Cards and rows | A card or row that leads somewhere is **clickable as a whole** (photo, text and empty space), not only its button or title. Buttons inside it (e.g. Remind) keep their own action. |
| Demo notices | At most **one** short demo line per screen. |
| Page subtitles | None on phones. |

## Coach

### Home (`/`) — renamed from "Agenda"
A summary of what is coming. Title and nav label: **Home**.
- **Add: latest announcement.** If the coach has posted an announcement to everyone (or to a group), the most
  recent one shows as a pinned card at the top: title, first line, group, date. Tapping it opens it in
  Messages → Announcements. It can be closed (hidden in this browser until a newer announcement is posted).
- **Keep:** the one-line dismissible demo guide; the **next-session card** with photo, who is coming and
  **Remind N** (simulated). **Change:** the whole card opens the session page.
- **Keep:** group filter chips; the list of the next seven days (rows with time, title, group colour, place and
  the answers bar). **Change:** each whole row opens the session page.
- **Change:** the list starts **after** the session shown in the card (no duplicate). "Needs you" shows only
  **registers to take** (unread messages already show on the Messages badge).
- **Remove:** the week strip; the session sheet that opens over Home (a row opens the session page).

### Session page (`/calendar/[id]`) — in this order
1. Title, then one compact block: date, time, place, group (name and colour dot, plain text).
2. **Who's coming:** answers bar, members by answer, **Remind N who haven't replied** (simulated).
   **Remove** the group link card under it (e.g. "Adult Recreational →").
3. **Plan:** the plan assigned to this session, **read-only** (see Library → Plans). **Open plan** opens the
   read-only plan view: blocks in order with start–end minute (0–10′, 10–25′…), exercise name, minutes,
   coaching points and video link, and the total duration. The coach cannot change minutes here; one small link
   "Edit in Library" opens the plan in Library. No plan yet: one line "No plan for this session" and a link
   "Choose a plan in Library".
4. **Register:** shown once the session has started (before that, one line: "The register opens at 17:00").
   Pre-filled from the answers.
5. **Notes:** "From last time" (read-only, the group's previous notes) and, after the session, "Notes for next
   time" — one block.
6. **Add: Lifts** (carpool) — see below.
7. Small links at the bottom: **Reschedule or move**, **Cancel session**, **See it as a player**.
- **Remove:** the large "What participants would see" preview card (replaced by the "See it as a player" link).

### Lifts (carpool) — at the bottom of every session, for coach and players
For training sessions and matches alike. Simulated and saved in this browser; one demo line: "Demo: saved in
this browser only — nobody is notified."
- **Offer a lift:** free seats (1–8), departure time, and a free-text note (meeting point, "leaving from the
  school", etc.). Shown as a card: driver, "3 seats left · leaves 17:15", note, passengers' names.
- **Join** an offer (takes one seat; full offers show "Full"); **Leave** it again. The driver can **remove** their offer.
- **Need a lift:** post a request with a short note ("from Son Ferrer"). Shown as a row; a driver with an offer
  can tap **I can take you**, which moves that person into their car.
- Empty state: one line "No lifts yet" with the two buttons **Offer a lift** and **Need a lift**.
- Rules (seats, join, leave, remove, move a request into an offer) are pure functions in `src/data/` with unit
  tests; the seed has one or two example lifts on a few sessions.

### Groups (`/groups`, `/groups/[id]`)
- **Keep:** list of groups (colour, name, members, next session); New group; Invite sheet (simulated link + QR);
  Add member; Group chat link. **Add** to each group row: the group's season attendance ("Attendance 84%").
- **Group page tabs:** **Players** (name, answer for the next session, attendance %) · **Sessions** ·
  **Attendance** · **Exercises**.
- **Attendance tab (overview, easy to read):** season average in large type; the last sessions as rows
  "Thu 12 Nov · 8/10 present" with a small bar; the players who missed most (name + %). Tapping a session row
  opens its saved register (names present/absent).
- **Remove:** claps and streaks; the Announcements tab (announcements live in Messages, filterable by group);
  the separate group-first assign page `/groups/[id]/assign` (the Exercises tab uses the single assign flow).
- **Group form:** keep as it is.

### Library (`/library`) — tabs **Exercises · Plans**
- **Exercises:** search and category chips. **Remove** the sport filter (one sport per scenario).
- **Exercise page:** details, coaching points, video link, "Used in", and one **Assign** button.
- **One assign flow** (sheet or page) used from the exercise page and from a group's Exercises tab: choose
  groups, and optionally specific players in a group, plus an optional note.
- **Plans:** list of the coach's plans (name, group, total minutes, sessions it is used in). The coach
  **creates and edits plans here** (blocks of exercises with minutes) and **assigns a plan to one or more
  sessions** ("Use in session" → choose upcoming sessions). "Duplicate" makes a copy to adapt. There is no
  separate "template" concept: any plan can be reused.
- In the session the plan is **read-only** (see Session page).

### Messages (`/chat`, `/announcements`)
- **Keep:** Chats / Announcements switch; group chats and one-to-one chats (simulated sending, saved in the
  browser); announcements with group filter and New announcement. Announcements to everyone or to a group
  also appear on Home (coach and players) as described above.

### Profile (avatar → `/more` on phones, sidebar on desktop)
- Not a personal profile page: one short list **Calendar · Attendance · Settings**, with the coach's name and
  avatar at the top. **Remove** the Features card and the duplicate demo switch (it is in the header).

### Calendar (`/calendar`, from Profile)
- **Month view only:** month grid with group-coloured dots and the selected day's sessions below, on all screen
  sizes. **Remove:** the "agenda" list mode of the calendar (that is Home) and the week board.
- **Keep:** group filter, New session — **session creation stays as it is**.

### Attendance (`/attendance`, from Profile)
- **Registers to take** (recent sessions without a register) at the top.
- **Attendance log**, easy to read: group chips to filter; for each group, rows by date
  "Thu 12 Nov · U16 · 8/10 present" (newest first) with a small bar; tap a row to see who attended.
  Reuse the same component as the group's Attendance tab.
- **Remove:** the global attendance on/off switch and everything that depends on it (D-042 is withdrawn):
  attendance is always on.

### Settings (`/settings`, from Profile)
- **Two sections only:** **Demo** (current example, switch example, reset this example, reset all) and
  **Language** (English / Español).
- **Remove:** Features, General and Notifications ("Coming soon").

## Player (`/me`)

### Home (`/me`) — renamed from "Agenda"
- Greeting, one line **"Attendance this season: 86%"** (only the percentage, no ring).
- **Add:** the latest announcement for the player's groups as a pinned card (same as the coach's Home).
- Next sessions, each with **Going / Maybe / Can't go**; the whole row (outside the buttons) opens the session.
- Below: unread messages (if any) and **My exercises** (first three).
- **Remove:** the swipe card, claps, streak, the "My season" panel and the separate announcements block.

### Session (`/me/calendar/[id]`)
- Details, **Are you coming?** buttons, the coach's plan read-only (same plan view), **Lifts** (offer, join or
  ask, as above), link back to the coach view (demo).

### Exercises (`/me/videos`) and Messages (`/me/chat`)
- Keep as they are, simplified to list rows.

## Welcome (`/demo`)
- Keep: three sport cards with photos (Pilates removed), one line about the demo, direct links
  `/demo?sport=tennis|football|basketball`.

## Definition of done for the simplification
- Every item above is implemented; removed features have no routes, components, tests or docs left.
- `npm run check` passes; the browser scripts in `tests/e2e/` that remain pass; layout, contrast and link audits
  pass for the three scenarios.
- Screenshots at 390 px and 1440 px of: Home, Session (with plan and lifts), Plan view, Groups, Group
  (Attendance tab), Library (Exercises and Plans), Messages, Calendar, Profile, Attendance, Settings, Player Home,
  Player Session — in English and in Spanish.
- The coach's Home is no taller than about two phone screens with the default data.
