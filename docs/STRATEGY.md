# CoachSpace — Market and strategy

> Condensed from the competitor research of 6 November 2026 (sources at the end). Recommendations are
> hypotheses to test with coaches. Pricing here does not change anything in the product until the owner
> approves it.

## 1. The model we want to copy: PlayerPlus → TeamPlus

- **Who:** SPM Sportplatz Media GmbH, Hamburg; in the market since 2014; renamed **TeamPlus** outside
  Germany/Austria/Switzerland in May 2025 (still **SpielerPlus** there). Its owner is mainly a marketer of
  amateur-sport audiences; the app builds that audience.
- **Size (its own figures):** 410,000 teams, about 5 million users, 120+ sports, about 40% youth teams.
- **Platforms:** iOS and Android apps plus a web app with the same functions; no separate club portal.
- **Why teams use it:** event → one-tap going/not going → the coach sees who is coming → changes reach
  everyone. Plus chat, polls, team kitty with fines, carpools, line-ups, statistics, parent accounts.
- **Money:** ads in the free app + Premium per team, bought in the app. Revenue is not public.

| TeamPlus Premium (iOS, Germany/Luxembourg stores) | Price |
|---|---|
| 1 team, 1 month / 6 months / 12 months | €5.99 / €29.99 / €53.99 |
| 2 / 3 / 4 / 5 teams, 12 months | €105.99 / €154.99 / €204.99 / €249.99 |
| 25 teams, 12 months (US store) | $759.99 (~$30 per team) |
| Individual ad removal, 12 months | €9.99 |

Free tier limits: 30 members, no custom roles, cannot cancel an event with notification, cannot see when
each player answered, ads. **Weak points:** ads and advertising tracking in an app full of minors; nothing
for the coach's training work (no library, plans or notes found); per-team pricing that punishes a coach
with many groups; a young brand outside Germany.

## 2. Other competitors

| Competitor | Where | Model | Note |
|---|---|---|---|
| **Teamy** | Groningen (NL) | Free + subscriptions, ad removal; Teamy Clubs | 200,000+ players in NL/BE; the Dutch "PlayerPlus"; moved to React Native in 2025 |
| **Spond** | Norway | Free; 2.5% + €0.20 per payment | 50,000+ clubs and teams; strong in payments |
| **SportMember** | Denmark | Free + Pro (~€22/month in Germany) | Club administration |
| **Clupik** | Madrid | Club software from €35/month | Sold to club boards, not coaches |
| **KNVB / Sportlink** | Netherlands | Official federation apps | Required for official football matches |
| **WhatsApp** | Everywhere | Free | The real competitor |

## 3. Where to start

**Spain first (Balearic Islands), the Netherlands for validation.**

- Netherlands: organised, already served (Teamy, Spond, federation apps); good for testing in person while
  studying in Groningen, hard to win now.
- Spain: 4.38 million federated licences in 2025, no dominant team app found, WhatsApp everywhere, and the
  owner's language and network (Mallorca).

**First customer (wedge):** tennis/padel schools and grassroots football schools in Mallorca with 2–6
coaches and 10–40 groups. Buyer: the coordinator. Users: coaches, players and families.

**Positioning:** "CoachSpace brings your groups together in one app: they know when training is, they tell
you if they're coming, and you have your exercises and plans at hand. No ads."

## 4. Pricing hypotheses (to test)

| Plan | For | Price to test | Reference |
|---|---|---|---|
| Free | Players, families, a coach with 1 group | €0, no ads | TeamPlus, Spond, Teamy are free at this level |
| Coach Pro | Coach with several groups + planning tools | €6.99/month (€69/year) vs €12.99/month (€129/year) | 3 TeamPlus teams = €154.99/year |
| School | 2–15 coaches | €29/month up to 5 coaches; €59/month up to 15 | Clupik from €35/month |
| Fee collection (later) | Schools collecting monthly fees | Per-payment fee below Spond | Spond 2.5% + €0.20 |

Rules: never ads; charge for organising many groups and planning, not for communicating; sell school plans
on the web with an invoice.

## 5. Go-to-market

1. **Now:** ask the contact who uses PlayerPlus three questions (what they use most, what annoys them, what
   would make them switch); 5 short interviews with coaches on TeamPlus, Teamy, Spond or WhatsApp.
2. **Founding coaches (0 → 10):** in person in Mallorca and Groningen; free for the season in exchange for a
   15-minute call every two weeks. Cold email alone got 0 replies from about 20.
3. **Invitation loop (10 → 100 groups):** each coach brings their group; measure answers and accepted invites.
4. **First payments (100 → 300 groups):** at the start of the next season.

| Metric | Starting target |
|---|---|
| Players who answer "Are you coming?" | more than 60% |
| Invitations accepted per group | more than 70% |
| Founding coaches still active after 4 weeks | 4 of 5 |
| Coaches paying full price | 3 before building in-app payments |

## 6. Legal points before real users

Minors' data under GDPR: guardian accounts, minimal data, EU hosting. Digital consent age: 14 in Spain today
(a bill raises it to 16), 16 in the Netherlands — design for 16. Get professional advice before launch.

## Sources (opened 6 November 2026)

TeamPlus App Store [US](https://apps.apple.com/us/app/-/id914253760), [DE](https://apps.apple.com/DE/app/id914253760),
[LU](https://apps.apple.com/lu/app/playerplus/id914253760); [TeamPlus website](https://spielerplus.de/en-gb);
[Premium comparison](https://www.spielerplus.de/en/premium/onboarding/index);
[club Premium](https://support.spielerplus.de/hc/en-us/articles/360020374817-How-can-I-as-a-club-subscribe-to-Premium-for-all-teams);
[CB Insights – Sportplatz Media](https://www.cbinsights.com/company/sportplatz-media);
[Teamy (Silicon Canals)](https://siliconcanals.com/teamy-welcomes-investor-chris-stam/);
[Teamy App Store](https://apps.apple.com/us/app/-/id1448886797);
[Spond fees](https://help.spond.com/club/en/articles/58192-what-are-the-transaction-costs-for-payments-made-in-spond-club);
[Clupik (Capterra)](https://www.capterra.es/software/215454/clupik);
[CSD federated sport 2025](https://www.educacionfpydeportes.gob.es/va/dam/jcr:502bb031-390e-4eb7-8152-866d1c9a9632/estadistica-de-deporte-federado-2025.pdf);
[NOS – Dutch sports clubs](https://nos.nl/l/2475281);
[Osborne Clarke – Spanish minors bill](https://www.osborneclarke.com/es/insights/espana-busca-proteger-los-menores-en-el-entorno-digital-claves-del-proyecto-de-ley).
