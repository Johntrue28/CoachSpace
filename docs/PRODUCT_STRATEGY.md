# CoachSpace — Product Strategy

> Recommended first segment, positioning, differentiation and pricing, written on 12 October 2026 from the audit ([`PRODUCT_AUDIT.md`](PRODUCT_AUDIT.md)) and desk research. **This is a set of hypotheses to test, not conclusions.** No customer has been interviewed. Where this document differs from `PRODUCT.md` or `DECISIONS.md` it says so (§10); nothing here changes an Accepted decision without the owner's approval (`CLAUDE.md` §13).

## 1. Evidence rules

- **Fact:** verified in a source linked here, or in the repository.
- **Assumption:** something I treat as true to reason forward; flagged where used.
- **Hypothesis:** a claim about customers that interviews must confirm or kill (`VALIDATION_PLAN.md`).
- Competitor pages were read through an automated page summary, not in a browser. Several are written by a competitor about its rivals and are marked as such. Prices are quoted only where a page showed them.

## 2. Comparing the segments

Scores are my judgement from 1 to 5, where 5 is favourable to CoachSpace. They are a way to rank hypotheses, not data; the weights are equal.

| Criterion | A. Independent tennis coach | B. Tennis club or academy | C. Pilates instructor or studio | D1. Youth team coaches (football, basketball) | D2. Dance, martial arts, swimming |
|---|---|---|---|---|---|
| Urgency of the problem (hypothesis) | 4 | 4 | 4 | 3 | 3 |
| Frequency of use | 4 | 4 | 5 | 4 | 4 |
| Willingness to pay (hypothesis) | 3 | 4 | 4 | 1 | 3 |
| Little competitive pressure | 3 | 2 | 1 | 1 | 2 |
| Fit with the current product | 4 | 2 | 1 | 4 | 2 |
| Simplicity of a pilot build | 4 | 1 | 2 | 4 | 2 |
| Ease of reaching them for you | 4 | 2 | 3 | 4 | 3 |
| **Total (out of 35)** | **26** | **19** | **20** | **21** | **19** |

Reasoning, by segment:

- **A. Independent tennis coach.** Several groups at different levels, shared or rented courts, schedule changes caused by weather or court availability (hypothesis), and drills and videos worth sharing. The current product already has groups, recurring sessions, cancel and reschedule, a drill library and attendance. Missing: private lessons (no such session type exists; the model is group-only) and anything court-related. Competition exists and is specific: Octopus Pro targets tennis coaches and academies; ClubSpark's coaching app serves coaches inside ClubSpark programmes; Spond and TeamSnap are free or low-cost general tools.
- **B. Club or academy.** The purchaser is a club administrator, the sales cycle is longer, and the product would need roles, several coaches, facilities and reporting. Playtomic's coach tool is sold to the club as an add-on, and SportMember and Spond Club target clubs. This is the wrong first target for a solo founder with a demo.
- **C. Pilates.** The pain is booking: capacity, waiting lists, class packs, late-cancel rules, payments. Studio software lists exactly these as headline features (Glofox, TeamUp, Zenamu). CoachSpace deliberately has none of them (`PRODUCT.md` §8), and its differentiator, a reusable exercise library, matters less in a mat class. A mature market, and the product does not fit it. Not first.
- **D1. Youth team coaches.** The product fits well, but Spond is free and widely used, and many such coaches are volunteers whose club, not they, would pay. Low willingness to pay (hypothesis, though Spond's free model is a fact).
- **D2. Dance, martial arts, swimming.** Behave like boutique studios (booking and memberships) or like clubs; no new information beyond C and B.

## 3. Recommendation: where to start

**Test independent tennis coaches first**, defined by behaviour rather than sport so that the profile transfers if the sport turns out wrong:

> A solo coach (or a coach with one assistant) who runs **three or more recurring groups a week**, in **venues they do not own**, and who today coordinates through **WhatsApp groups, a calendar and notes**.

Qualifying questions for the first call: How many recurring groups a week? Who owns the courts? How many schedule changes in the last month? Where do participants find out about them?

Disqualifiers: a coach employed by a club that mandates its own system; fewer than three groups; groups run entirely through a booking platform the coach cannot leave.

Why this and not another: it has the best fit with what already exists, a simple pilot (one coach, no multi-tenant roles), reachable people (tennis clubs and halls are findable, and coaches can be met at courts), and a plausible reason to pay (hypothesis). **Why this might be wrong:** if coaches turn out to be satisfied with WhatsApp plus a club system, or if the independent segment is too thin, the validation plan includes contrast interviews outside tennis and explicit rules for changing niche.

## 4. The core problem, as hypotheses

Ranked by how much I would bet on them; each needs a concrete recent example from an interviewee to count.

| # | Hypothesis | Disproved if |
|---|---|---|
| H1 | When a session changes, the coach sends several messages, and some people still miss it. | Coaches say changes are rare, or everyone reliably sees them. |
| H2 | The coach often does not know who is coming until they arrive. | Coaches say absences are almost always announced and handled. |
| H3 | Attendance and notes are kept in memory, a spreadsheet or not at all, and the coach would value a quick record. | Coaches do not keep records and do not want to. |
| H4 | Drills and videos are scattered across chats, links and folders, and re-found each time. | Coaches share little, or have a system that works. |
| H5 | The same message is typed again for each group. | Coaches seldom message more than one group. |

H1 and H2 are the loop the product does not yet close (audit F-28, F-31). H3 is what the demo does best. H4 is the stated differentiator (D-022); the audit found it only half connected (F-19).

## 5. Value proposition and positioning

Working proposition for the first segment (hypothesis):

> For coaches who run several recurring groups at venues they do not own, CoachSpace makes a schedule change, a session plan or an absence a one-tap action: everyone is told, everyone can answer, and nothing is retyped for the next group. Unlike WhatsApp and spreadsheets, it keeps the schedule, who is coming and the coach's plan and notes in one place; unlike club booking systems, it is built for the coach, not the front desk.

Test it as three testable promises, not as a slogan:

1. **Change once, everyone knows.** A cancellation or move reaches every affected person and shows who has seen it.
2. **Know who is coming.** One-tap availability from participants before the session.
3. **Plan once, reuse everywhere.** A plan or drill built once is reused across groups with per-group variants, and participants see what applies to them.

`PRODUCT.md` §4 names the library as the core differentiator. This document argues that, on the evidence available, promises 1 and 2 are the stronger first wedge, because they address the pain a coach feels every week and are the part of the demo that is simulated. The library remains the second layer. This is a recommendation to test, not a decision.

## 6. Competitive landscape

Classification: **direct** competes for the same coach and job; **adjacent** serves the same people with a different centre of gravity; **substitute** is what coaches do instead.

| Product | Type for CoachSpace | Target | What the source shows | Pricing (only as sourced) |
|---|---|---|---|---|
| WhatsApp, calendars, spreadsheets | Substitute (primary) | Everyone | Not researched here; stated as the likely status quo in `PRODUCT.md` §2 (hypothesis) | Free |
| [Spond](https://www.spond.com/news-and-blog/most-affordable-team-management-app/) | Adjacent, and direct for team and club coordination | Clubs, teams, groups | Events with attendance, messaging to individuals or groups, membership fees and payments, file storage, guardians. The page does not mention training plans. | Says it is free for most features, with processing fees on payments (blog dated 1 September 2025). A Spond-authored 2024 page lists a payment fee of 2.5% plus £0.20 and describes Spond Club as free regardless of size, "current as of 8th April 2024"; re-check ([source](https://www.spond.com/news-and-blog/spond-club-vs-loveadmin/)). |
| [TeamSnap](https://www.teamsnap.com/pricing) | Adjacent | Coaches of single teams; clubs and leagues | Scheduling, messaging, availability, roster, drills and practice plans, assignments. Clubs add registration and payments. | "$0 to start" for single teams; the upgrade price is not shown. Clubs and leagues: custom pricing. |
| [SportMember](https://www.capterra.co.uk/reviews/167292/sportmember) | Adjacent (club management) | Clubs and associations | Scheduling, attendance, communication, payments, membership management (Capterra listing). | Per-user model with a free version (Capterra). A Spond-authored comparison, dated 15 October 2024, says Pro starts from £20 a month plus a per-member fee; treat as unverified ([source](https://www.spond.com/news-and-blog/spond-vs-sportmember/)). |
| [Playtomic Manager: Academy and Coach app](https://helpmanager.playtomic.com/hc/en-gb/articles/45335085102481-Playtomic-Coach-web-app) | Adjacent | Tennis and padel clubs | The club adds an Academy module (private and public classes, courses, coach availability, reports) and buys a coach web app for its coaches ([Academy](https://helpmanager.playtomic.com/hc/en-gb/articles/20559686617361)). The coach page does not mention attendance or messaging, and does not address independent coaches. | Not shown on these pages. |
| [Octopus Pro](https://octopuspro.com/tennis-coaching-software/) | **Direct** for tennis coaches and academies | Tennis academies, multi-site teams, mobile coaches | Private lessons and group classes with seat limits, attendance, invoices and payments, email, SMS and WhatsApp, a coach mobile app. Aimed more at academies than at solo coaches. | Not shown; links to a pricing page I did not open. |
| [ClubSpark TA Coaching app](https://apps.apple.com/us/app/clubspark-ta-coaching/id6459510881) | Adjacent | Coaches running ClubSpark programmes | Sessions, registers and check-in, walk-ins, email to participants, cancel and create sessions. Bound to ClubSpark programmes. | Not shown. |
| [Momence](https://momence.com/pricing), [TeamUp](https://goteamup.com/pricing), [Glofox](https://www.glofox.com/lp/pilates-studio-management-software/) | Direct for Pilates studios; not for CoachSpace as built | Studios and boutique fitness | Booking, memberships and class packs, payments, branded apps; Glofox lists waitlists and late-cancel and no-show policies. | Momence: custom, no public price. Glofox: custom, free demo. TeamUp: **$189 a month** at 101–200 active customers, scaling with active customers, $99 a month for a branded app, no setup fee or long contract. |

Vendor-authored comparison pages (Spond's, Zenamu's) are biased toward their authors and were used only for leads. Zenamu's page lists prices for several studio tools dated 12 September 2026; I did not rely on them.

**Not researched:** Mindbody pricing, Heja, Pitchero, Club Automation and ProAgenda (seen in search results only), Playtomic's player app, and any tool popular in your own country that I have not seen.

## 7. Differentiation

"All-in-one" is not a differentiator: Spond, TeamSnap and Octopus Pro each cover parts of the same list. The candidates, with what is verified:

| Candidate wedge | Verified about others | Unverified, to test |
|---|---|---|
| **Operations loop for the solo multi-group coach**: change, notify, confirm, attend, in one phone-first flow, with no booking, payment or membership overhead | Spond and TeamSnap have events, availability and messaging; Octopus Pro covers private and group classes. All carry broader scope. | Whether a deliberately narrow tool is *simpler* enough to switch for. |
| **Plan once, adapt per group, participant sees it** | TeamSnap lists drills, practice plans and assignments. | Whether anyone connects plan, group variant and participant view in one flow. Do not assume a gap. |
| **Coach memory**: three short notes after each session, shown when preparing the next one (D-033) | Not found on any page I read. Absence on a marketing page is not proof of absence. | Whether coaches would write notes at all. |

The strongest realistic position is the first: narrow on purpose. A solo coach is poorly served by tools built for the club front desk, and the cost of that is features CoachSpace should not add (`FEATURE_ROADMAP.md` §4).

## 8. Business model hypotheses

Everything in this section is a hypothesis for interviews, not demonstrated willingness to pay. The owner's starting points (D-012: about €9.90 a month for a founding pilot, €19.90 for an individual coach) are kept and extended.

| Segment | Purchaser | Pricing hypothesis | Basis | Confidence |
|---|---|---|---|---|
| Independent coach | The coach | **€19.90 a month per coach**, unlimited groups, participants free; a founding price of **€9.90 for six months** for pilot coaches | D-012. Per coach (not per participant) fits "participants free" and does not penalise growth. Free tools exist, so the price must be justified by time saved, not features. | Low |
| Small club or academy | Club director or head coach (hypothesis) | **€49 a month per club including up to three coaches, €9.90 per extra coach**, to be tested only after the solo pilot works | A guess anchored on D-012. Pricing per club suits a single buyer. | Very low |
| Small Pilates studio | Studio owner | **No price yet.** Do not sell until the product fits | Competing studio software bundles booking and payments, and TeamUp's first-party price is $189 a month at 101–200 customers. A tool without booking cannot ask studio prices. | n/a |

Why per coach: per participant makes growth costly and conflicts with "participants free"; per group punishes the very multi-group coach the product is for; per club suits a later academy plan.

**What justifies payment (hypothesis):** hours a week saved on repeated messages and schedule changes, and fewer missed sessions. Interviews must put numbers on both.

**Free trial:** a free pilot of two to four weeks on one or two real groups, no card, with the pilot-MVP feature set in `FEATURE_ROADMAP.md` §2. Do not gate individual features during the trial.

**Before charging anyone** (all must hold):

1. Real accounts, persistent data and tested access isolation between coaches (`ROADMAP.md` Phase 3 exit criteria).
2. Notifications of schedule changes that work, with a measured delivery rate.
3. Participants' personal data handled under a reviewed privacy approach, with export and deletion available.
4. A backup and a way for the coach to get their data out.
5. A support route and a stated response time.

**How to avoid charging for what is not reliable:** label anything unproven as "beta" and exclude it from the price; charge only for the core loop once it has run for a month without data loss; offer cancel-anytime, monthly only. **No billing inside the product** until at least three coaches pay: invoice by bank transfer or an external payment link. Do not build subscription code before that (`DECISIONS.md` D-013).

## 9. Risks that would change this recommendation

| If this happens | Then |
|---|---|
| Tennis coaches say WhatsApp plus their club's system is fine | Run contrast interviews with youth team coaches and dance or martial-arts instructors; reconsider the segment, not the features. |
| Coaches value messaging, not scheduling | Reopen chat, but weigh its cost (F-29) and Spond's free messaging. |
| Participants will not install or sign up | Make link-based access the first pilot feature, or drop the participant side and sell a coach-only tool. |
| Coaches are happy to use it but will not pay | Test the club-pays model (segment B) before abandoning. |
| Club owners, not coaches, hold the budget | Segment B moves up; a multi-coach pilot becomes necessary. |

## 10. Where this differs from the existing documents

| Document | What it says | This document |
|---|---|---|
| `PRODUCT.md` §3, D-014 (Provisional) | First discipline not chosen; research covers four | Proposes tennis as the first *test* and defines the segment by behaviour. D-014 stays Provisional until the owner decides after the go/no-go. |
| `PRODUCT.md` §4, D-022 | The library is the core differentiator | Argues that change-and-confirm is the stronger first wedge, with the library as second layer. To be settled by interviews. |
| D-012 | €9.90 and €19.90 | Kept as test points; adds a club price and a "no price yet" for Pilates. |
| `PRODUCT.md` §8 | Chat and notifications out of scope for the demo | Notifications of changes become the first pilot feature; chat stays deferred. |
