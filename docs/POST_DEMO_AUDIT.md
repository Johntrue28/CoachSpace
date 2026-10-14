# CoachSpace — Post-demo audit and email-first validation

> Written on 14 October 2026 against `main` at `b1494d6` (merge of PR #33). It follows [`PRODUCT_AUDIT.md`](PRODUCT_AUDIT.md) (12 October, `479f0b3`) and [`AUDIT_FOLLOW_UP.md`](AUDIT_FOLLOW_UP.md). **Everything below is a proposal for the owner.** `ROADMAP.md` remains the source of truth for the phase, and no decision in `DECISIONS.md` is changed by this document.

Evidence tags: `[verified]` checked in this audit, with the method stated; `[code]` read in the source; `[docs]` stated in project documents and not re-checked; `[hypothesis]` an unvalidated assumption or recommendation.

## 1. Summary

- **The demo is close to ready to share. It does not need new features.** Three small things should be done first (§6): a URL without the typo, seed content that does not go out of date, and one walkthrough on a real phone by the owner. Together they take about one day.
- The reported checks were reproduced on `b1494d6`: lint, typecheck and 169 unit tests pass; the production build passes with one environment workaround; all 22 browser scripts (1,455 checks) and the layout, contrast and link audits pass locally (§3).
- The deployed site serves the welcome-screen version of the demo with no console errors on the screens read. The live check was limited because the browser pane was hidden (§2).
- There is **no customer evidence yet**: no interview, reply or payment is recorded in the project. The demo is a tool for collecting it, not proof of demand.
- The main product risk for an unattended, email-first demo is that the core promise is hard to see without a presenter. That promise, from `PRODUCT_STRATEGY.md` §5, is "change once and everyone knows". After cancelling a session the coach sees only "Participants have not been notified (demo)" (§4, R-04).

## 2. Exact state verified

| Item | Result | Method |
|---|---|---|
| `main` | `b1494d6`, 13 Oct 2026 06:19 (+02:00), "Merge pull request #33" | `git fetch`, `git log` `[verified]` |
| Reported merge commit `b1494d6` | Matches `origin/main`; no later commits | `[verified]` |
| PR #32 | Merged 13 Oct 2026 00:28 UTC, head `claude/relaxed-albattani-hoes7y` | GitHub REST API `[verified]` |
| PR #33 | Merged 13 Oct 2026 04:19 UTC, same head branch name as #32 | GitHub REST API `[verified]` |
| CI on `b1494d6` | Check run `check`: completed, success | GitHub REST API `[verified]` |
| Vercel status on `b1494d6` | "Deployment has completed" (success). An earlier "pending" status exists for the same commit. | GitHub commit statuses `[verified]` |
| Production `https://coach-scpace.vercel.app` | First visit redirects to `/demo` (welcome screen with four sports, D-055). The Tennis Club dashboard shows the introduction card, people-not-memberships count and the new quick-action labels (D-061). No console errors were reported. | Built-in browser, page text and console `[verified]` |
| Which commit production serves | **Not provable from outside**: the app exposes no build commit, and the deployments API was refused (HTTP 403). The served content matches PR #33 features. | `[verified]` (inference from content) |
| Preview `coach-scpace-git-claude-relaxed-albattani-…` | **Not checked.** It is superseded by production. | — |
| Branch `docs/product-audit` | Its four documents are identical to those on `main`, so it can be deleted on GitHub by the owner | `git diff` `[verified]` |

**Limits of the live check.** The desktop app's browser pane was hidden during this audit. While it was hidden, reading text worked but clicks, timers and screenshots did not complete. One direct visit to a session page stayed on "Loading…". The same route works in a local production build, so this is probably a side effect of the hidden pane, **but it was not verified on Vercel**. The full journeys were therefore checked on a local production build of the same commit (§3), and the owner should do the phone walkthrough in §15.

## 3. Checks run on `b1494d6`

| Check | Result | Notes |
|---|---|---|
| `npm ci` | Pass | Node 22.22.0 |
| `npm run lint` | Pass | |
| `npm run typecheck` | Pass | |
| `npm test` | **169 tests, 40 suites, 0 failures** | |
| `npm run build` | Fails in this environment; **passes** with a mocked font response | `next/font/google` must download DM Sans from Google Fonts, which the cloud environment blocks. With `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` (a local stand-in font, nothing in the repo changed) the build completes. CI and Vercel download the real font. |
| Browser scripts (`tests/e2e/run-all.sh`) | **22 scripts, 1,455 checks, all passed** | Run against the local build, with Arial standing in for DM Sans |
| Layout, contrast and link audits | All four scenarios pass (see below) | |
| `npm audit --omit=dev` | 2 findings (1 high, 1 moderate) in the PostCSS copy bundled inside Next.js 15 | Already known (D-017): build-time only for this static demo. The fix is the Next.js 16 upgrade, which needs owner approval. |

Audit results by scenario (tennis, football, basketball, Pilates): layout 780/780 checks passed in each, no WCAG AA contrast failures, no broken internal links. `run-all.sh` exited with status 0.

My own walkthrough (Playwright, 390 × 844, touch, `Europe/Amsterdam`, real clock) covered the first visit through to the end, with no console or page errors. It took these steps:

1. Welcome screen, then Tennis Club.
2. Dashboard, then the next session through the introduction link.
3. Attendance by group.
4. An exercise page, then the chat list.
5. New announcement, then the participant session page with the plan.
6. Settings.
7. Fresh deep links to session, chat and plan pages, then a reload and a 404.

The same walkthrough with the clock set to 10 November 2026 showed the stale-content problem in R-03.

**What the tests cannot show.** The browser scripts fix the clock at 14 October 2026 and are run by hand, not in CI. So they will keep passing while the seeded dates go out of date, and they say nothing about the deployed site.

## 4. Findings, ranked

Severity: **Blocking** means fix before sending the first email. **Important** means it weakens the email-first experiment. **Minor** means it can wait for feedback.

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| R-01 | Blocking | The public URL and repository contain a typo ("Scpace"). A cold email from an unknown student with a misspelt domain looks careless and can look like phishing. D-020 is still "To decide". | `DECISIONS.md` D-020; production URL `[verified]` |
| R-02 | Blocking | No one has walked through the deployed demo on a real phone. `ROADMAP.md` still lists "a walkthrough on the deployed version" as to do, and this audit could not complete one (§2). | `ROADMAP.md`, `HANDOVER.md` §1 `[docs]`; §2 `[verified]` |
| R-03 | Blocking for an outreach that lasts weeks | Seeded messages and announcements have fixed dates (8–11 October 2026) and fixed-date text, so the demo ages. Examples are "Court 6 is closed until 23 October", "Junior club tournament on Saturday" (posted 11 Oct), and messages from 11 Oct still unread. With the clock at 10 Nov 2026 the dashboard's "New messages" show "11 Oct". Sessions, attendance and plans are relative to today, so the mismatch grows over time. | `src/data/scenarios/*.ts` (`sentAt`, `postedAt`, `assignedOn`, tennis.ts line 361) `[code]`; walkthrough at 10 Nov `[verified]` |
| R-04 | Important | The core promise cannot be seen without a presenter. Cancelling or moving a session confirms "Participants have not been notified (demo)". That is honest, but nothing shows what participants would have received. The participant view shows the cancelled session only if the visitor thinks to switch. | `src/components/calendar/SessionDetail.tsx`, `SessionForm.tsx` `[code]` |
| R-05 | Important | The niche and the scenario do not match. The strategy targets independent coaches at venues they do not own, but the tennis scenario is "Harbour Lane Tennis Club… across five courts", and the welcome text says "the example closest to your club". | `/demo` text `[verified]`; `PRODUCT_STRATEGY.md` §3 |
| R-06 | Important | No real video anywhere. The library is the stated core differentiator (D-022), but every seeded exercise links to a YouTube search, and the participant's "My Videos" contains no video. This is honest (D-057), but the differentiator is only described, not shown. | `DEMO_CONTENT_SOURCES.md` §1; exercise page `[verified]` |
| R-07 | Important | Project documents disagree. `HANDOVER.md` says PR #33 is still open, but it is merged. D-053 to D-061 are "Provisional … until the owner approves the preview", but they are on production. `ROADMAP.md` says interviews come before the demo is shown (D-019, Accepted), which conflicts with the email-first plan. The `README.md` document list omits the newer documents. | Files on `main` `[verified]` |
| R-08 | Minor | The tennis link opens on a choice of four sports. A personalised email to a tennis coach could open the tennis scenario directly, but there is no link parameter for that. | `src/app/demo/page.tsx`, boot script in `layout.tsx` `[code]` |
| R-09 | Minor | The dashboard is long on a phone: about 4,240 px at 390 px wide, with nine sections. The introduction card keeps the first screen clear. | Full-page screenshot `[verified]` |
| R-10 | Minor | Pilates shows "places" per class but has no booking, waiting list or class packs, which are what studio software is judged on. Expect that comparison group to point this out. | `GroupHeader.tsx`, `pilates.ts` `[code]` |
| R-11 | Minor (pilot risk) | The `npm audit` findings (D-017), browser tests outside CI, and a build that needs Google Fonts at build time. None blocks the demo. | §3 `[verified]` |
| R-12 | Note | The Vercel Hobby plan is for "non-commercial, personal use only". A free validation demo is probably within that. Check before charging anyone or running a paid pilot on it. Which plan the `coach-space1` team uses was not checked. | [Vercel Hobby plan docs](https://vercel.com/docs/plans/hobby) `[verified]` |

**What is good and should not change.** The demo is honest about simulation throughout. Every action that would reach someone says it did not. The chat says "Not delivered (demo)", and the welcome screen and introduction say that nothing is sent. The four scenarios are coherent and follow the active choice everywhere (143 checks in `scenarios.mjs`). Attendance on a phone is fast (D-056). Plans reach the participant view (D-058). The interface looks credible: green palette, clear cards, no broken controls found.

## 5. What is real and what is simulated

| Capability | Status in the demo |
|---|---|
| Choosing a sport scenario, switching it, resetting | Works in this browser (`localStorage`) |
| Dashboard figures, groups, rosters, weekly schedule | Read-only fictional data per scenario; figures computed from it |
| Calendar changes (one-off, move, cancel, restore) | Work in this browser; **simulated**: nobody is notified |
| Attendance taking and correction | Works in this browser; not shared |
| Exercise library: create, edit, assign (exercise-first and group-first) | Works in this browser; assignments are **simulated** for participants |
| Session plans and templates | Work in this browser; the participant view in the same browser shows them |
| Announcements: post | Works in this browser; **simulated**: "Participants have not been notified (demo)"; no edit or delete |
| Chat: send, read state | Saved in this browser; **simulated**: "Not delivered (demo)" |
| Coach/Participant switch | A demo view, **not a sign-in** |
| Videos | Search links only (labelled); a coach can add a real YouTube or Vimeo link |
| Creating groups or participants, invitations | **Not implemented** (F-15); pilot only |
| Sign-in, accounts, shared data, notifications, calendar sync, payments | **Not implemented**; pilot or later |
| Settings → General, Notifications | Marked "Coming soon", with no controls |

## 6. Blocking issues and the smallest action for each

| ID | Smallest action | Coding? | Effort |
|---|---|---|---|
| R-01 | In Vercel (Project → Settings → Domains), add a correctly spelt `*.vercel.app` alias if one is free, for example `coachspace-demo.vercel.app`. Use it in emails. Renaming the GitHub repository is optional. | No | S (≈15 min) |
| R-02 | The owner opens the production link on their own phone in a private window and follows the checklist in §15. Note anything odd before emailing. | No | S (≈30 min) |
| R-03 | Make seeded `sentAt`, `postedAt` and `assignedOn` relative to today, as sessions already are, and remove absolute dates from seed text ("until 23 October"). Add a unit test with a future clock. Workaround if not approved: send every email in the first week and accept some staleness for late readers. | Yes, needs approval | S (≈½ day) |

## 7. Commercial readiness

1. **Problem and value.** The welcome screen lists features ("groups, sessions, attendance, training plans and messages"). Only the dashboard introduction states a benefit ("information is written once instead of repeated in every chat"). That is acceptable for a first contact if the email states the problem. `[verified]`
2. **Without a presenter.** The first contact works on its own: two sentences, one tap on a sport, and a three-step introduction. The weak point is R-04: the most important hypothesis (H1, missed schedule changes) has the least visible demo moment.
3. **Limitations.** They are stated briefly and in context, not as a wall of warnings.
4. **Four sports.** They help the comparison contacts and cost a tennis coach one tap. They slightly weaken the "made for me" impression (R-05, R-08). Keep them for now.
5. **What a coach must experience** before meaningful feedback: their own sport's week, cancelling one session, taking attendance in seconds, and seeing the same session from the participant side with its plan. All of these exist.
6. **Missing features that block validation:** none. Group creation, real delivery, availability replies and sign-in are pilot features. Feedback on their absence is itself useful data.
7. **Evidence for backend development:** none yet. Phase 2 has no completed item. Do not start Phase 3 work.

## 8. Email-first validation plan `[hypothesis]`

**Proposed decision (for `DECISIONS.md`, not added):** "First contact with coaches is a short personalised email with the public demo link and three or four questions; no call is requested. A conversation is offered only if the coach welcomes it. This revises D-019 (interviews before the demo is shown)." The owner should approve or reject this.

### 8.1 First batch: 15 contacts

| Group | Number | Why |
|---|---|---|
| Independent tennis coaches with several recurring groups | 10 | The main hypothesis (`PRODUCT_STRATEGY.md` §3). Enough to see whether the same problem comes up repeatedly. |
| Coaches or coordinators at small tennis academies | 3 | Tests who would pay (coach or academy) and whether several coaches change the problem |
| Coaches in another sport (one youth team coach, one Pilates instructor) | 2 | A contrast: if they react much more strongly, the niche may be wrong |

**This is not a sample.** It is a small, self-selected and probably regional set of people who chose to reply. It can reveal problems, wording and objections. It cannot measure demand, reply rates or prices for a market. Never quote percentages from it.

**Finding qualified prospects.** Use public professional sources only. Record the source; do not guess emails.

- Club and academy websites that list their coaching staff and a contact.
- Coaches' own business websites, and the business pages they publish with a contact address.
- Map and directory listings for tennis lessons that link to a coach's own site.
- A federation's public coach directory, if it publishes contact details for that purpose.
- An introduction from someone you know who plays tennis.

**Qualify before writing:** the coach runs group lessons, preferably at least three recurring groups, as shown by a published timetable or a description. They appear to be independent, for example with their own brand or teaching at more than one venue. They publish a professional contact. Prefer a contact form or a published business address to a personal one. Contact each person once by email, and once more at most.

**Data and legal care.** Store names and addresses only in a private sheet, never in this repository. Delete them after the experiment unless the person wants updates. Stop at once if someone asks. Rules on unsolicited email differ between countries and may apply even when nothing is sold, so check the rules where the coaches are. This is not legal advice.

### 8.2 Feedback questions (at most four, plain text)

1. Is any part of the demo useful for how you actually work? Which one?
2. What is missing or confusing?
3. How do you handle schedule changes and attendance today?
4. If something like this solved that reliably, would you consider paying for it, and what price per month would seem reasonable?

Question 4 is asked **open**, with no price given, to avoid anchoring. Test the €19.90 and €9.90 hypotheses (D-012) only in a second email, and only with someone who has engaged (§8.4).

### 8.3 Reading the replies

| Signal | Example | What it means |
|---|---|---|
| Compliment | "Looks great, good luck!" | Politeness. Not evidence. |
| Curiosity | "When will it be ready?" | Weak interest. Ask what they would use first. |
| Concrete problem | "Last week the courts flooded and three parents didn't see my WhatsApp" | Evidence for the problem, especially if recent and recurring |
| Adoption intent | "I'd try it with my Tuesday juniors if parents don't have to install anything" | Stronger: a named group and a condition |
| Credible willingness to pay | "I pay €12 for X; I'd pay about €15 if it replaced X and WhatsApp for schedules" | A specific price with a reason, tied to current spending |
| Commitment | "Put me down for a pilot in January at that price" in writing | The strongest signal available without taking money |

Do not count a hypothetical "yes, I'd pay" without a price and a reason. Do not argue with criticism; ask for the example behind it.

### 8.4 Price sensitivity without selling

- If the coach answers question 4, reply once and ask "Would around €20 a month feel too much, about right, or cheap — and why?" If they mentioned a pilot, add "For early pilot coaches I'd expect about €10 a month for the first months. Would that change anything?"
- If they are interested, ask for a written, non-binding "yes, contact me when a pilot exists" with the price they named. **Take no payment and no card details**, and do not describe the product as available. There is nothing to deliver yet (D-013, D-012).

### 8.5 Measures for the first batch

Count, do not estimate:

1. Qualified prospects contacted.
2. Replies.
3. Coaches who say they tried the demo (self-reported; the demo has no analytics, and none should be added to track individuals).
4. Coaches who describe a concrete, recurring problem.
5. Coaches who name a feature they would use, and why.
6. Coaches who express interest in a pilot with a condition.
7. Coaches who give a specific, reasoned price.

No reply rate is assumed.

| If… | Then… |
|---|---|
| Fewer than five replies after the follow-up | Not evidence against the product. Change the channel (a contact form, a short DM, an in-person visit, an introduction) or the subject line, and send a second batch of 15. Do not change the product. |
| Replies are positive but vague | Reply once with one concrete question ("When did a schedule change last go wrong?"). Count only the concrete answers. |
| At least two coaches independently describe a different strong problem | Record it in their words. Consider testing that problem with the next batch instead of building. |

### 8.6 Tracking sheet (kept privately, never committed)

| Column | Notes |
|---|---|
| Prospect | Name or organisation |
| Public source | URL where found |
| Sport, coach type | Independent, academy, comparison |
| Why relevant | e.g. "4 junior groups, two venues" |
| Language | EN or ES |
| Date contacted | |
| Response status | No reply, replied, declined, asked not to be contacted |
| Tried the demo? | Yes, no or unknown (self-reported) |
| Current workflow | Tools and routine, in their words |
| Main problem | Quote if possible |
| Objections | |
| Willingness-to-pay signal | None, open price, specific price with reason, written commitment |
| Follow-up date and outcome | One follow-up maximum |

## 9. Ranked recommendations

| # | Priority | Finding | Smallest action | Effort | Code? | Evidence that justifies it |
|---|---|---|---|---|---|---|
| 1 | P0 | R-01 URL typo | Correct `vercel.app` alias in Vercel | S | No | Already justified: it is the first thing a recipient sees |
| 2 | P0 | R-02 no phone walkthrough | Owner checklist (§15) | S | No | Already justified: deployed state unverified |
| 3 | P0 | R-03 stale seed dates | Relative seed timestamps, plus a test with a future clock | S | Yes | Already justified: outreach lasts two weeks or more |
| 4 | P0 | Email copy | Use §10 and §11, personalised per contact | S | No | — |
| 5 | P1 | R-04 core promise invisible | After cancel or move, a labelled preview "What the participants of U16 would see (not sent)" with a link to the participant view | S–M | Yes | Shows H1 without a presenter. Do it if the first replies say they "didn't see the point" of changes. |
| 6 | P1 | R-05 club framing | Adjust the tennis scenario copy towards an independent coach (e.g. "Laura coaches five groups at two venues") | S | Yes (copy) | Do it if tennis coaches say "this is for clubs, not me" |
| 7 | P1 | R-06 no real video | Owner watches and picks 3–5 public coaching videos; they replace search links in the tennis seed (`DEMO_CONTENT_SOURCES.md` §1) | S | Yes (seed data) | The library is the stated differentiator (D-022) |
| 8 | P1 | R-07 inconsistent docs | Update `HANDOVER.md`, the D-053–D-061 status, `ROADMAP.md` (D-019), `README.md` | S | No | Owner's decisions on D-053–D-061 and the email-first proposal |
| 9 | P1 | R-08 direct sport link | Optional `/demo?sport=tennis` that opens the tennis scenario | S | Yes | Only if a coach reports picking the wrong card or being put off by four sports |
| 10 | P2 | R-09 long dashboard | Reorder or trim sections after seeing what coaches mention | S–M | Yes | Repeated feedback about the dashboard |
| 11 | P2 | R-10 Pilates gaps | None now | — | — | Only if Pilates becomes the chosen segment |
| 12 | P2 | R-11 test and CI gaps | Run a short e2e subset in CI; Next.js 16 decision (D-017) | M | Yes | Before a pilot |
| 13 | Deferred | Group creation (F-15), real notifications, sign-in, database, availability replies, chat delivery, payments | Do not build | L–XL | Yes | The go criteria in §13 met, and the owner's Phase 3 decision |
| 14 | Deferred | Analytics on the demo | Do not add per-person tracking. Aggregate Vercel Web Analytics is possible later (a dependency plus code), with owner approval. | S | Yes | Only if the self-reported "tried the demo" proves useless |
| 15 | Deferred | Licensed sport photography | Keep the original illustrations; they look intentional | M | Yes | Only if several coaches say the demo looks unprofessional |

## 10. First-contact email

**English.** Subject: *A question about how you organise your tennis groups*

> Hi [first name],
>
> I found you through [source, e.g. your club's website] and saw that you coach [what you saw, e.g. several junior and adult groups].
>
> I'm [your name], a student, and I'm building CoachSpace, a small tool for coaches who run several groups: sessions, changes, attendance, training plans and messages in one place. It isn't a product you can buy. It's a demo with made-up data, and I'm trying to learn how coaches really organise this before building anything real.
>
> If you have five or ten minutes at some point, you can try it here (no sign-up, nothing is sent to anyone):
> Demo: [demo link]
>
> A short reply would help me a lot, even a few lines:
> 1. Is any part of it useful for how you work? Which one?
> 2. What is missing or confusing?
> 3. How do you handle schedule changes and attendance today?
> 4. If something like this solved that reliably, would you consider paying for it, and roughly how much per month would seem fair?
>
> Honest criticism is more useful to me than kind words. If it isn't relevant to you, no need to reply.
>
> Thank you,
> [your name]
> [your studies and university, optional]

**Spanish.** Subject: *Una pregunta sobre cómo organizas tus grupos de tenis*

> Hola [nombre]:
>
> Te encontré a través de [fuente, p. ej. la web de tu club] y vi que entrenas [lo que viste, p. ej. varios grupos de niños y adultos].
>
> Soy [tu nombre], estudiante, y estoy creando CoachSpace, una herramienta sencilla para entrenadores con varios grupos: sesiones, cambios, asistencia, planes de entrenamiento y mensajes en un mismo sitio. No es un producto a la venta: es una demo con datos inventados, y quiero entender cómo os organizáis de verdad antes de construir nada real.
>
> Si en algún momento tienes cinco o diez minutos, puedes probarla aquí (sin registro y sin que se envíe nada a nadie):
> Demo: [enlace de la demo]
>
> Me ayudaría mucho una respuesta corta, aunque sean unas líneas:
> 1. ¿Te resultaría útil alguna parte en tu trabajo? ¿Cuál?
> 2. ¿Qué falta o qué resulta confuso?
> 3. ¿Cómo gestionas hoy los cambios de horario y la asistencia?
> 4. Si algo así lo resolviera de forma fiable, ¿pagarías por ello? ¿Qué precio al mes te parecería razonable?
>
> Me sirve más una crítica sincera que un cumplido. Si no te encaja, no hace falta que respondas.
>
> Gracias,
> [tu nombre]
> [estudios y universidad, opcional]

Notes. The demo is in English; tell Spanish-speaking coaches so ("la demo está en inglés"). Send each email individually from your own address. Do not add attachments, tracking pixels or link shorteners, and do not send in bulk. For the comparison contacts, replace "tennis" with their sport.

## 11. Follow-up email (one only, after five to seven days)

**English.** Subject: *Re: A question about how you organise your tennis groups*

> Hi [first name], just a short follow-up in case my message got buried. If you get a moment to look at the demo ([demo link]), even a one-line reply on what seems useful or missing would help me a lot. If it's not for you, no problem at all, and I won't write again. Thanks, [your name]

**Spanish.** Asunto: *Re: Una pregunta sobre cómo organizas tus grupos de tenis*

> Hola [nombre], te escribo solo por si mi mensaje se perdió. Si en algún momento puedes echar un vistazo a la demo ([enlace]), una respuesta de una línea sobre qué te parece útil o qué falta me ayudaría mucho. Si no te encaja, no pasa nada, y no volveré a escribirte. Gracias, [tu nombre]

## 12. 14-day plan (Wednesday 14 to Tuesday 27 October 2026)

| Dates | Action | Hours |
|---|---|---|
| Wed 14 – Thu 15 | Owner decides R-01 to R-03 and the email-first proposal. Add the corrected URL alias. Do the phone walkthrough (§15). Start the private tracking sheet. | 2 |
| Thu 15 – Fri 16 | If approved, fix R-03 in a pull request and check the preview and production on the phone. Find and qualify 15 prospects. | 3 |
| Sat 17 | Send the first five emails (tennis), personalised. | 1 |
| Mon 19 | Fix any wording problem the first five reveal. Send the other ten. | 1 |
| Every day, Sat 17 – Tue 27 | Reply to every response within 24 hours. One follow-up question to those who engage (§8.4). Log everything. | ≈ 15 min a day |
| Fri 23 – Mon 26 | One follow-up to non-repliers, five to seven days after their first email | 0.5 |
| Mon 26 | Count the measures in §8.5. Write a one-page summary of quotes and objections. | 1 |
| Tue 27 | Decide using §13: second batch, small demo change (P1 items), change of niche, or a Phase 3 proposal. | 0.5 |

Late replies are normal. Day 14 gives a first reading, not a final verdict.

## 13. Go and no-go criteria for building further

Pre-register these before sending. Counts are across all replies so far. They are judgement thresholds for a small qualitative exercise, not statistics.

| Outcome | Condition | Next step |
|---|---|---|
| **Propose a narrow pilot** (Phase 3, owner's decision) | At least three coaches independently describe the **same** concrete, recurring problem that the demo addresses, **and** at least two state they would use it with a real group under a stated condition, **and** at least one gives a specific, reasoned price or a written non-binding pilot commitment | Write the pilot proposal (`FEATURE_ROADMAP.md` §2); no code until approved |
| **Improve the demo, keep the niche** | The problem is confirmed by at least two, but replies show the demo did not communicate it | Do P1 items 5–7, then send a second batch |
| **Change the problem or niche** | At least two coaches name the same different problem, or the comparison contacts are clearly more engaged | Test that with the next batch before building anything |
| **Keep collecting** | Fewer than five substantive replies | Second batch through a different channel; no product decision |
| **Pause** | After about 30 qualified contacts, fewer than two concrete problems and no pilot interest | Record the reasons in `DECISIONS.md` and stop development |

Under every outcome except the first, **do not build a backend, sign-in, notifications or payments.**

## 14. Proposed documentation changes (not applied)

| File | Change | Why |
|---|---|---|
| `DECISIONS.md` | Add the email-first decision (§8), revising D-019; set D-053 to D-061 to Accepted or keep them Provisional, as the owner decides | R-07 |
| `ROADMAP.md` | Replace "interviews … before the demo is shown" with the email-first plan; tick "walkthrough on the deployed version" only after §15 is done | R-07 |
| `HANDOVER.md` | PR #33 is merged | R-07 |
| `README.md` | List the newer documents | R-07 |

## 15. Checks not completed, and the owner's checklist

**Not completed in this audit:** a visual check of the deployed site beyond one welcome-screen screenshot; interactive journeys on the deployed site; the preview URL; which commit Vercel serves; a build with the real DM Sans font.

**Owner's checklist (on your own phone, private window, about 30 minutes):**

1. Open the production link (or the new alias). The welcome screen should show four sports and the "No sign-in needed…" line.
2. Tap Tennis Club. The dashboard should show "Welcome to Harbour Lane Tennis Club" and today's date.
3. Tap "Open the next session", then "Cancel this session". Confirm that you see "Participants have not been notified (demo)", then restore it.
4. Take attendance for that group. Everyone should start present: tap two people, then Save.
5. Switch to Participant at the top. Open today's session; the coach's plan should be there.
6. Open Chat, send a message, and see "Not delivered (demo)". Reload: the message should still be there.
7. Settings → Demo: switch to Pilates, then back to Tennis. Then "Reset all scenarios": you should return to the welcome screen.
8. Note anything slow (more than about a second), anything stuck on "Loading…", anything that looks broken or unclear, and any text you would not send to a coach.

## 16. Pre-outreach polish: results (added 14 October 2026)

> Added after the audit above; §1–§15 are left exactly as written. Work done on branch `claude/relaxed-albattani-hoes7y`, restarted from `main` at `caef62c` (merge of #34). **Not merged; not deployed.** The new decisions D-062 to D-066 are Provisional and D-067 (email-first) is a proposal: all wait for the owner.

### 16.1 Was the audit still current?

Yes. `main` had only the audit documents on top of `b1494d6` (#34). R-03 to R-08 were all still present in the code. One addition: Google Fonts was reachable from the cloud session this time, so `npm run build` ran for real, without the font workaround in §3.

### 16.2 What changed, by finding

| Finding | Change | Files |
|---|---|---|
| R-03 stale seed dates | Seeded messages, announcements, read state, assignments, plans, notes and topic rotation move by whole weeks to the visitor's week (D-062). Month names removed from seed text: "until 23 October" (tennis), "until December" (football), "in September" (Pilates). | `src/data/seed-dates.ts` (new), `scenario.ts`, `scenario-store.tsx`, `chat-store.tsx`, `persistence.ts`, `scenarios/*.ts` |
| R-04 core promise not visible | "What participants would see — demo preview" after a cancel, move, new place or extra session, using the participant's own session component; "Open Jordan Hale's view of this session" and "Back to the coach view of this session". The "not notified (demo)" notices stay and point to the preview (D-063). | `calendar/SessionDetail.tsx`, `calendar/SessionForm.tsx`, `participant/ParticipantSessionSummary.tsx` (new), `participant/ParticipantSessionDetail.tsx` |
| R-05 club framing | "Tennis Coaching": Laura Gomez's own business with five groups at Harbour Lane TC (hired courts) and Riverside Park (public courts). Welcome text: "so a change is written once instead of repeated in every chat … the example closest to how you coach" (D-064). | `scenarios/tennis.ts`, `scenarios/index.ts`, `demo/Welcome.tsx` |
| R-06 no real video | **Not changed.** No video site could be opened, so no link was replaced. Four unverified candidates for the owner are listed in `DEMO_CONTENT_SOURCES.md` §1. | `DEMO_CONTENT_SOURCES.md` |
| R-07 inconsistent documents | `HANDOVER.md` (#32, #33, #34 merged; this branch), `README.md` (document list, direct links), `ROADMAP.md` (status note; D-019 kept), `DECISIONS.md` (D-062 to D-067 and an "awaiting the owner" note), `FEATURE_ROADMAP.md` (status note, production work deferred), `ARCHITECTURE.md`, `tests/e2e/README.md` | `docs/`, `tests/e2e/README.md` |
| R-08 direct sport link | `/demo?sport=<id>` (tennis, football, basketball or pilates) opens that example; anything else shows the welcome screen (D-065). | `src/data/scenario-link.ts` (new), `demo/Welcome.tsx`, `persistence.ts` (boot script), `scenario-store.tsx` |
| Isolation check (brief §5) | Found one real defect: a tab left open overwrote a newer change made in another tab of the same browser. Fixed by reloading on the browser's `storage` event (D-066). | `persistence.ts`, `store.tsx`, `chat-store.tsx` |

Not done on purpose (brief §15): sign-in, database, real notifications or chat delivery, group creation, Pilates booking, analytics, dashboard redesign, dependency upgrades.

### 16.3 Visitor isolation: what was tested and what is not guaranteed

Tested in `tests/e2e/isolation.mjs` with two independent browser contexts (like two devices): A changes Tennis, B changes Basketball; each sees only their own change after reloads; nothing of A is stored in B's browser and vice versa; A's reset leaves B untouched; switching scenarios in one browser never mixes their saved data; three resets in a row restore the same four announcements with no duplicates and do not duplicate the chat; resetting one scenario keeps another's changes; two tabs of one profile stay in step. Unit tests cover the same rules for storage keys and that seed objects are never modified.

**Not guaranteed:** two people using the *same* browser profile share its storage and see each other's changes. Clearing site data, a private window closing, or another device loses or never sees the changes. This is the documented demo model, not a defect.

### 16.4 Checks run (14 October 2026, on the final code)

| Check | Result | Compared with the baseline (§3) |
|---|---|---|
| `npm ci` | Pass (Node 22.22.0) | — |
| `npm run lint` | Pass, no warnings | — |
| `npm run typecheck` | Pass | — |
| `npm test` | **208 tests, 45 suites, 0 failures**; also run with `TZ=Europe/Madrid` and `TZ=America/New_York`, 0 failures | +39 tests (`seed-dates.test.ts`, `scenario-link.test.ts`), none removed |
| `npm run build` | **Pass with the real DM Sans download** from Google Fonts (no workaround needed this time) | §3 needed a mocked font |
| `sh tests/e2e/run-all.sh` | **26 scripts, 1,678 checks, all passed**, exit status 0 | 22 scripts / 1,455 checks before; +4 scripts and +223 checks (change-preview 36, direct-link 116, future-date 40, isolation 31). No check removed; assertions on renamed tennis text were updated to the new text, and the venue checks in `workflow.mjs` were made stricter |
| Layout, contrast and link audits, four scenarios | Layout 780/780 each, no WCAG AA contrast failures, no broken links | Same as before |
| Negative controls | With the date shift disabled, `future-date.mjs` failed 28 checks (for example "11 Oct" on the dashboard); with the tab sync disabled, `isolation.mjs` failed "the second tab did not overwrite the first tab's cancellation". Both pass with the fixes. | Shows the new tests detect the problems |
| `npm audit --omit=dev` | 2 findings (1 high, 1 moderate), PostCSS bundled in Next.js 15, unchanged | Same as §3; fix is the Next.js 16 upgrade (D-017, owner's decision) |
| `npm audit` (with dev tools) | 7 findings (1 moderate, 6 high): the same PostCSS issue and `braces` via `micromatch`/`fast-glob` in `eslint-config-next` (development tooling only) | Not upgraded (needs owner approval) |

After the full run, one sentence of the welcome screen was changed ("The coaches, clubs and people are fictional"); the build, `scenarios.mjs`, `direct-link.mjs` and the tennis layout and contrast audits were run again on that final code and passed.

**Limits.** All browser checks ran on a local production build in Chromium with a fixed clock (14 October 2026, or 10 November 2026 for `future-date.mjs`). The browser scripts are still not in CI. Nothing was checked on Vercel, in Safari or on a real phone.

### 16.5 Owner checklist before the first email

**Domain (R-01).** Availability of `coachspace-demo.vercel.app` could **not** be checked (vercel.app is blocked from the cloud session). Steps: Vercel → project `coach-scpace` → Settings → Domains → Add → type `coachspace-demo.vercel.app` → Add. If Vercel says it is taken, try another correctly spelt name. Open the new address in a private window and check the welcome screen. Keep `coach-scpace.vercel.app` working until the new one is confirmed; do not change DNS. Renaming the GitHub repository is optional.

**Real phone (private window, about 30 minutes).** After this branch is merged and deployed:

| # | Step | Automated locally? | Owner on a phone |
|---|---|---|---|
| 1 | Welcome screen shows four sports | Yes (`scenarios.mjs`) | Pending |
| 2 | Tennis dashboard loads with today's date | Yes (`scenarios.mjs`, `dashboard.mjs`) | Pending |
| 3 | The next session opens | Yes (`scenarios.mjs`) | Pending |
| 4 | Cancelling shows the honest notice and the participant preview | Yes (`change-preview.mjs`) | Pending |
| 5 | The session can be restored | Yes (`change-preview.mjs`, `workflow.mjs`) | Pending |
| 6 | Attendance can be edited and saved | Yes (`attendance*.mjs`) | Pending |
| 7 | The participant view shows the session and its plan | Yes (`coach-to-participant.mjs`) | Pending |
| 8 | Chat is labelled as simulated | Yes (`chat*.mjs`) | Pending |
| 9 | Settings switches scenario and resets | Yes (`scenarios.mjs`, `settings.mjs`) | Pending |
| 10 | Reloads, navigation and back links never stay on "Loading…" | Partly (reload and deep links in several scripts) | Pending |

Also try `/demo?sport=tennis` once. "Automated locally" means a local production build in Chromium with a fixed clock; it says nothing about Vercel, Safari or a real network.

**Vercel and commercial use.** Which commit production serves is not visible from outside; check it in Vercel → Deployments. The Vercel Hobby plan is described as for non-commercial, personal use (R-12). Which plan the project uses was not checked. Read the current terms yourself before any paid pilot or commercial use; this is not legal advice.

**Decisions for the owner.** Approve or reject D-053 to D-066, and D-067 (email-first, revising D-019). Choose videos from the candidates, or keep the labelled searches.
