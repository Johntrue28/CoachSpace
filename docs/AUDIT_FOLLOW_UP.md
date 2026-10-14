# CoachSpace — Audit follow-up

What happened to each finding of [`PRODUCT_AUDIT.md`](PRODUCT_AUDIT.md) (audit of `main` at `479f0b3`, 12 October 2026) during the definitive demo work (D-053 to D-061). Written on 13 October 2026.

Each finding is re-checked against the current code and placed in one of three classes:

- **Demo — done.** Needed for a convincing demo and fixed (with the decision or file).
- **Demo — explained.** Kept as it is in the demo, with the limitation stated clearly.
- **Pilot / production.** Belongs to a real pilot or launch (backend, accounts, delivery), so it is deferred on purpose.

## Summary

| Class | Findings |
|---|---|
| Demo — done | F-01, F-02, F-03, F-06, F-08, F-13, F-19, F-20, F-21, F-22, F-23, F-25, F-26, F-33 |
| Demo — explained | F-04, F-07, F-11, F-12, F-14, F-16, F-17, F-18, F-24, F-27, F-28, F-29, F-30, F-31, F-35 |
| Pilot / production | F-05, F-09, F-10, F-15, F-32, F-34 |

## Findings

| ID | Finding (short) | Class | What was done, or why not |
|---|---|---|---|
| F-01 | No first impression: `/` opens straight into a signed-in coach, no value proposition | Demo — done | A first visit opens the welcome screen with two sentences and four sport cards; the dashboard has a dismissible introduction with three things to try and what the demo does not do (D-055). |
| F-02 | One coach runs four sports; matches no customer | Demo — done | Four coherent scenarios, one per kind of customer, in the same app (D-053), chosen on the welcome screen or in Settings → Demo (D-055). |
| F-03 | Dashboard shows empty attendance | Demo — done | About three weeks of seeded attendance per scenario; every figure on the dashboard comes from those records (D-053, D-056). |
| F-04 | No onboarding (accounts, groups, invites) | Demo — explained | The welcome screen and introduction explain the demo; real onboarding needs accounts and is for the pilot. |
| F-05 | URL and repository say "Scpace" | Pilot / production | Naming decision D-020 is still the owner's to make; not a code change. |
| F-06 | "31 participants" vs group sizes adding up to 32 | Demo — done | Dashboard and Groups count people and say when someone is in more than one group, so group sizes add up to more (D-061). |
| F-07 | Dashboard reports the past better than what is about to go wrong (no expected headcount) | Demo — explained | Needs participant availability (F-31), which is a pilot feature. The next-session card and attendance reminders stay. |
| F-08 | "Send message" opens a list; "Schedule session" duplicates | Demo — done | Quick actions say exactly where they go: Take attendance, Post announcement, Add exercise, Open chats (D-061). |
| F-09 | Recurrence without dates, exceptions or term holidays | Pilot / production | Needs a real schedule model before any database design (as the audit says). The demo's single-session changes stay. |
| F-10 | Cancelling one session at a time | Pilot / production | Bulk changes come with the schedule model (F-09). |
| F-11 | No overlap warning for the same place and time | Demo — explained | Free-text places are kept in the demo; venues and overlap warnings are for the pilot. |
| F-12 | No coach per session, no cover | Demo — explained | One coach or instructor per scenario; multi-coach is a later product decision. |
| F-13 | Month cells on phones show only times | Demo — done | Short group codes beside each time ("17:00 U16"), no colour coding (D-061). |
| F-14 | No calendar export | Demo — explained | The session page still says nothing is synced with external calendars. |
| F-15 | No create or edit for groups and participants | Pilot / production | Considered for a demo-only editor; not built, because predefined scenarios already let the presenter show each kind of club, and real group management needs accounts and invites. Listed as open in `ROADMAP.md`. |
| F-16 | Participant model too thin; health data in free text | Demo — explained | No scenario keeps health information in participant details (unit test). The `Person`/`Membership` model and guardians for minors are for the pilot. |
| F-17 | Attendance percentages change when rosters change | Demo — explained | Rosters are fixed in the demo; roster snapshots are a pilot data-model task. |
| F-18 | Participant list has search only | Demo — explained | Enough for demo group sizes. |
| F-19 | Session plan never reaches the participant | Demo — done | The participant's session page shows the plan read-only; plans are prepared for the next sessions in every scenario (D-058). |
| F-20 | Seeded "videos" are YouTube search pages | Demo — done | No specific video could be checked, so none was invented: search links are labelled as searches everywhere and "Watch video" is only for real video links (D-057). |
| F-21 | Assignment only from an exercise | Demo — done | "Assign exercises" on a group page assigns several exercises to the whole group at once (D-059). |
| F-22 | "Tactical" block means little for Pilates | Demo — done | Pilates plans use Centring, Foundation, Main sequence and Stretch and close everywhere, including the participant's view (D-053, D-058). |
| F-23 | Attendance form is the wrong shape for a phone | Demo — done | Everyone starts present, about 60 px rows with one 44 px target each, full-width "Mark everyone present", sticky Save (D-056). |
| F-24 | No "told in advance" absence | Demo — explained | Present/absent only, as decided (D-040); revisit after interviews. |
| F-25 | Saving blocked until everyone is marked | Demo — done | With everyone present by default, nothing blocks saving and records stay complete (D-056). |
| F-26 | Attendance switch reads "Off" before loading | Demo — done | Neutral copy until the setting is loaded (D-056). |
| F-27 | A global attendance switch adds settings surface | Demo — explained | Kept (D-042); revisit after interviews. |
| F-28 | Nothing reaches anyone | Demo — explained | Real delivery is the pilot's core work. Every action that would notify someone says it did not (for example "Participants have not been notified (demo)"); the welcome screen and introduction say nothing is sent. |
| F-29 | Three overlapping channels | Demo — explained | Kept for the demo so coaches can react to each; validation in interviews (`VALIDATION_PLAN.md`). |
| F-30 | No edit, delete or read status for announcements | Demo — explained | Only meaningful once delivery exists (F-28). |
| F-31 | Participants cannot reply "I can't come" | Demo — explained | One-tap availability needs participant accounts; the participant view stays read-only apart from chat. |
| F-32 | Participants must join; harder than a WhatsApp link | Pilot / production | Link-based access and parent profiles are pilot design questions. |
| F-33 | Small touch targets on the attendance form | Demo — done | 44 px targets for rows, Save, "Mark everyone present" and back links (D-056); new screens follow the same rule. |
| F-34 | Offline sync for indoor halls | Pilot / production | Everything is local in the demo; offline sync is a backend design requirement. |
| F-35 | Demo notice repeated on many forms | Demo — explained | One persistent "Demo view · not a real sign-in" line, plus a one-line notice only where an action could look shared or delivered. The new attendance and assignment screens use a single line. |

## §4 of the audit (what is real and what is simulated), updated

| Feature | Status now |
|---|---|
| Entry and scenario | Welcome screen on the first visit; the chosen scenario is kept in this browser (`coachspace-scenario`). Not a sign-in. |
| Exercises, assignments, announcements, attendance, calendar changes, plans, notes, filter | Local to one browser, per scenario (`coachspace-demo-v2:<scenario>`). |
| Chat messages and read state | Local to one browser, per scenario (`coachspace-demo-v2:<scenario>:chat`); never delivered (D-060). |
| Videos | Searches are labelled as searches; only links added by the coach can be specific videos (D-057). |
| Groups, participants, weekly slots | Fixed per scenario. |
| Settings: General, Notifications | "Coming soon", with no controls. Demo and Features work. |

## Documentation issues from §6

- `.env.example` and `README.md` were checked: see the README "Demo scenarios" section and `tests/e2e/README.md` for the current test set. The audit documents themselves are now kept in `docs/` on `main`.

## Update, 14 October 2026

After the post-demo audit (`POST_DEMO_AUDIT.md`), a pre-outreach polish on an unmerged branch made seeded dates follow the current week (D-062), added a demo preview of what participants would see after a change (D-063, related to F-28), reframed the tennis example as an independent coach (D-064, related to F-02), added direct links per sport (D-065) and kept tabs of one browser in step (D-066). F-20 (videos) is unchanged: specific videos still need the owner to watch and choose them. Results: `POST_DEMO_AUDIT.md` §16.
