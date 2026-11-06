# 04 — Technical plan, tools and draft roadmap

> Proposal of 6 November 2026. Changing the stack or Phase 5 of `docs/ROADMAP.md` (native apps) needs the
> owner's explicit approval (`CLAUDE.md` §4 and §13). Nothing here is implemented yet except the demo redesign.

## Starting point

| Today | Needed for the stores |
|---|---|
| Next.js 15 + Tailwind on Vercel, 33 screens | iOS/Android app + web for schools |
| Fictional data in the browser | Real EU database with row-level permissions |
| No accounts (Coach/Participant switch) | Passwordless sign-in, roles and guardians |
| Simulated chat and notices | Real push notifications |
| English only | Spanish, English, Dutch |
| Unit tests in CI; manual browser scripts | Permission tests, mobile end-to-end tests, error monitoring |

Reusable: the pure, tested rules in `src/data/` (calendar, weekly schedules, attendance, RSVP, plans, notes)
can move into a shared package almost unchanged, as can the copy, scenarios and decision records.

## Platform decision

Recommendation: **React Native with Expo** for iOS and Android, one TypeScript code base. Teamy made the same
move in 2025 ([Silicon Canals](https://siliconcanals.com/teamy-welcomes-investor-chris-stam/)).

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| PWA | Cheapest; reuses everything | Not in the stores; iPhone push needs "Add to Home Screen"; feels like web | Bridge only |
| Capacitor (wrap the web) | Reuses Next.js | Needs static export; still feels like web; review risk | No |
| **Expo / React Native** | Real native apps; push, camera, haptics; one code base; cloud builds and store submission (EAS) | UI must be rewritten; mobile learning curve | **Yes** |
| Swift + Kotlin | Best quality | Two apps, two languages | No |

Shape: Expo app for coaches, players and families; the current Next.js web for the public site, accepting
invitations without installing, and the school/payments panel; a shared package of types and rules.
Reference version: Expo SDK 56 (21 May 2026) with React Native 0.85 ([Expo](https://expo.dev/sdk/56)); use the
current stable version when starting.

## Recommended stack

| Layer | Tool | Note |
|---|---|---|
| Mobile app | Expo + Expo Router + TypeScript | File-based routing similar to Next.js |
| Mobile styling | NativeWind | Reuse Tailwind knowledge and the design tokens; small own components |
| Web | Next.js (current) on Vercel | Kept |
| Database/API | Supabase (Postgres) in an EU region | RLS on every table; already planned for Phase 3 |
| Accounts | Supabase Auth, email magic link | If Google sign-in is added, Apple requires an equivalent option such as Sign in with Apple |
| Notifications | expo-notifications + Expo push service | Test on real devices |
| Languages | i18next + expo-localization | No hard-coded strings |
| Email | Resend (or Supabase SMTP) | Verified own domain |
| Payments (later) | Stripe Billing on the web; Stripe Connect for fees | Not before 3 customers will pay |
| Build/publish | EAS Build, Submit, Update | No own Mac needed to build iOS |
| Errors | Sentry | From the first pilot |
| Analytics | PostHog (EU cloud) | No personal data of minors in events |
| Tests | Unit, RLS policy tests, Maestro (mobile), Playwright (web) | In GitHub CI |

Fixed costs to publish: Apple Developer ($99/year) and Google Play Console (one-off $25). In the EU, Apple
charges small developers 15% on in-app purchases since October 2026 ([9to5Mac](https://9to5mac.com/2026/08/20/apples-long-running-app-store-battle-with-the-eu-appears-to-finally-be-over/)); check App Store Connect before deciding.

## Design quality: not looking "vibe-coded"

Work order: flows before screens (5 key journeys with the fewest taps) → design in Figma before coding (Figma is
connected to Claude) → a small written design system (~15 components) → native patterns (tabs, bottom sheets,
swipe to answer, haptics, dark mode) → validate a prototype with 3–5 coaches before polishing.

Interface rules: one primary action per screen; hierarchy through type and space, not boxes; real content in
designs; empty, loading, error, offline and no-permission states; short text in the user's language, no
explanatory subtitles; AA contrast, 44 px touch targets, dynamic type; one icon set, one typeface.

## Working with Claude

Available now: Figma (read designs into code), the `frontend-design` skill, design canvas and design-system
documents, GitHub, `skill-creator`. To add: Supabase CLI/connector, Expo/EAS, Sentry, PostHog, Maestro.

Project skills worth creating: `coachspace-feature` (spec → plan → design → code → tests → screenshots → docs),
`coachspace-ui-review` (visual checklist on real screenshots), `coachspace-data-security` (RLS mandatory,
isolation test per role, minimal minors' data).

Per task: one small task, one branch → plan in Spanish → code + tests + screenshots at 390 px and desktop →
review by a separate agent → green CI and preview before merge → the owner tries it on a phone weekly.

## Quality and operations

Permission tests per table and role before the first real user; CI with lint, types, unit, RLS and build;
Maestro and Playwright for the 5 key journeys before the stores; Sentry, PostHog and daily backups (with a
restore test) from the first pilot; store listings in three languages, privacy policy, Apple privacy labels,
Google data-safety form, review test account and in-app account deletion; TestFlight and Google Play closed
testing with the founding coaches 4–6 weeks before launch (new personal Google Play accounts must run a closed
test with a minimum number of testers for some weeks — check current rules).

## Draft roadmap (for discussion, not approved)

| Stage | Dates (indicative) | What | Gate to continue |
|---|---|---|---|
| A · Validate and redesign | Nov–Dec 2026 | 5 interviews, wedge chosen; event-centred demo redesign (`05-demo-redesign-plan.md`) | 3 coaches would try it with their real group |
| B · Foundations | Jan–Feb 2027 | Supabase in the EU, accounts and permissions; data model; es/en/nl | Isolation tests between groups pass |
| C · Core on mobile | Mar–Apr 2027 | Invite, going/not going, push notices; Expo app in TestFlight and Play testing | 3–5 real groups use it 4 weeks in a row |
| D · Differentiator and stores | May–Jun 2027 | Library, plans, notes, videos; publish on App Store and Google Play | 4 of 5 founders keep using it |
| E · First payments | Jul–Sep 2027 | Pro and School with Stripe on the web; season launch in Mallorca | 3 coaches pay full price |

Stage C decides whether the project has a future. If a gate is not met, repeat the stage with what was learnt.
Dates assume 10–15 hours a week.

## Open decisions for the owner

- [ ] Main market: Spain (Balearic Islands) with the Netherlands for validation, or the reverse.
- [ ] First sport and customer: tennis/padel schools, grassroots football, or both.
- [ ] Platform: approve Expo for iOS/Android and keep Next.js for the web (changes roadmap Phase 5).
- [ ] Scope of the first real pilot: only the core, or the library from the start.
- [ ] Pricing: replace D-012 with Free / Coach Pro / School.
- [ ] Name: "CoachSpace" is provisional and the repository/URL contain the "Scpace" typo (D-020).
- [ ] Interface language of the demo: keep English (rule in `CLAUDE.md` §3) or add Spanish and Dutch now.
- [ ] Pace: hours per week during the academic year.
