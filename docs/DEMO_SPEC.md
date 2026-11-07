# CoachSpace — Demo specification (target state)

> What every screen of the demo contains after the simplification of November 2026 (D-075).
> Claude Code works towards this document; when the demo and this document disagree, the document wins
> unless the owner says otherwise. "Keep" = already right; "Change" = adjust; "Remove" = delete the code,
> its route, its tests and its documentation.

## Global

| Item | Target |
|---|---|
| Sports | **Tennis/padel, Football, Basketball.** Remove the Pilates scenario, its photos, data, tests and copy. |
| Language | **English by default; Spanish selectable in Settings** (saved in the browser). Code, docs and commit messages stay in English. |
| Look | Keep palette B "Pista", group colours and the photographs (D-074). |
| Coach navigation | Bottom bar: **Agenda · Groups · (+) · Library · Messages**. Avatar opens the menu (Calendar, Attendance, Settings). Desktop: the same in the sidebar. |
| Player navigation | **Agenda · Exercises · Messages.** |
| Header | Logo, Coach/Player demo switch, avatar. **Remove the activity bell** everywhere. |
| Create (+) | Exactly four items: **New session, Announcement, Invite players, New group.** Remove "Take attendance" and "Session plan" from it. |
| Demo notices | At most **one** short demo line per screen. |
| Page subtitles | None on phones. |

## Coach

### Agenda (`/`)
- **Keep:** title, the one-line dismissible demo guide, the **next-session card** with photo, who is coming and **Remind N** (simulated).
- **Keep:** group filter chips; the list of the next seven days (rows with time, title, group colour, place and the answers bar).
- **Change:** the list starts **after** the session shown in the card (no duplicate). "Needs you" shows only **registers to take** (unread messages already show on the Messages badge).
- **Remove:** the week strip; the session sheet that opens over the agenda (a row opens the session page).

### Session page (`/calendar/[id]`) — in this order
1. Title, then one compact block: date, time, place, group.
2. **Who's coming:** answers bar, members by answer, **Remind N who haven't replied** (simulated).
3. **Plan:** the plan for this session (see Planning). Empty: "Plan this session" and "Copy the plan from <last session>".
4. **Register:** shown once the session has started (before that, one line: "The register opens at 17:00"). Pre-filled from the answers.
5. **Notes:** "From last time" (read-only, the group's previous notes) and, after the session, "Notes for next time" — one block.
6. Small links at the bottom: **Reschedule or move**, **Cancel session**, **See it as a player**.
- **Remove:** the large "What participants would see" preview card (replaced by the "See it as a player" link).

### Groups (`/groups`, `/groups/[id]`)
- **Keep:** list of groups (colour, name, members, next session); New group; Invite sheet (simulated link + QR); Add member; Group chat link.
- **Group page tabs:** **Players** (name, answer for the next session, attendance %) · **Sessions** · **Exercises**.
- **Remove:** claps and streaks; the Announcements tab (announcements live in Messages, filterable by group); the separate group-first assign page `/groups/[id]/assign` (the Exercises tab uses the single assign flow).
- **Group form:** name, weekly sessions (day, time, minutes), place. **Remove** the short-code field (derive it from the name) and the sport field (the scenario's sport).

### Library and planning (`/library`)
- **Library = exercises only:** search and category chips. **Remove** the sport filter (one sport per scenario) and the Session plans tab.
- **Exercise page:** details, coaching points, video link, "Used in", and one **Assign** button.
- **One assign flow** (sheet or page) used from the exercise page and from a group's Exercises tab: choose groups, and optionally specific players in a group, plus an optional note.
- **Plans live in sessions:** create or edit the plan from the session page; "Copy from <last session of this group>" replaces templates.
- **Remove:** templates, the plans list `/library/plans`, the plan routes outside a session. Keep the plan editor component, opened from the session.

### Messages (`/chat`, `/announcements`)
- **Keep:** Chats / Announcements switch; group chats and one-to-one chats (simulated sending, saved in the browser); announcements with group filter and New announcement.

### Calendar (`/calendar`, from the menu)
- **Month view only:** month grid with group-coloured dots and the selected day's sessions below, on all screen sizes.
- **Remove:** the "agenda" list mode of the calendar (that is the Agenda) and the week board.
- **Keep:** group filter, New session.

### Attendance (`/attendance`, from the menu)
- **Registers to take** (recent sessions without a register) and **Saved registers** (history), per group.
- **Remove:** the global attendance on/off switch and everything that depends on it (D-042 is withdrawn): attendance is always on.

### Settings (`/settings`)
- **Two sections only:** **Demo** (current example, switch example, reset this example, reset all) and **Language** (English / Español).
- **Remove:** Features, General and Notifications ("Coming soon").

### Menu (`/more`, phones)
- Calendar, Attendance, Settings. **Remove** the Features card and the duplicate demo switch (it is in the header).

## Player (`/me`)

### Agenda (`/me`)
- Greeting, one line **"Attendance this season: 86%"** (only the percentage, no ring).
- Next sessions, each with **Going / Maybe / Can't go**.
- Below: unread messages (if any) and **My exercises** (first three).
- **Remove:** the swipe card, claps, streak, the "My season" panel and the announcements block (they are in Messages).

### Session (`/me/calendar/[id]`)
- Details, **Are you coming?** buttons, the coach's plan read-only, link back to the coach view (demo).

### Exercises (`/me/videos`) and Messages (`/me/chat`)
- Keep as they are, simplified to list rows.

## Welcome (`/demo`)
- Keep: three sport cards with photos (Pilates removed), one line about the demo, direct links `/demo?sport=tennis|football|basketball`.

## Definition of done for the simplification
- Every item above is implemented; removed features have no routes, components, tests or docs left.
- `npm run check` passes; the browser scripts in `tests/e2e/` that remain pass; layout, contrast and link audits pass for the three scenarios.
- Screenshots at 390 px and 1440 px of: Agenda, Session, Groups, Group, Library, Messages, Calendar, Settings, Player Agenda — in English and in Spanish.
- The coach's Agenda is no taller than about two phone screens with the default data.
