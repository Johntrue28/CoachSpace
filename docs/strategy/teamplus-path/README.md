# Possible path: CoachSpace → the TeamPlus of Spain and the Netherlands

> Strategy pack written on 6 November 2026 after a competitor analysis of PlayerPlus (now **TeamPlus**,
> called **SpielerPlus** in Germany, Austria and Switzerland). It records research, recommendations and
> proposals. **Proposals that change the business model, the stack or the roadmap still need the owner's
> explicit approval** (`CLAUDE.md` §13); the demo redesign in `05-demo-redesign-plan.md` was approved by
> the owner on 6 November 2026 (D-071).

The owner's goal: become "the PlayerPlus" (the default team app) of regions PlayerPlus does not dominate,
starting with Spain and the Netherlands, and move from a web demo to apps on the App Store and Google Play.

## Documents

| File | What it answers |
|---|---|
| [`01-playerplus-analysis.md`](01-playerplus-analysis.md) | Who PlayerPlus/TeamPlus is, platforms, business model, exact prices, features, strengths and weaknesses |
| [`02-coachspace-vs-playerplus.md`](02-coachspace-vs-playerplus.md) | Feature comparison, why the current demo feels confusing, what to adopt and where CoachSpace can differ |
| [`03-market-strategy-nl-es.md`](03-market-strategy-nl-es.md) | Competitors in the Netherlands and Spain, positioning, pricing hypotheses, go-to-market, legal risks |
| [`04-technical-plan-and-roadmap.md`](04-technical-plan-and-roadmap.md) | Platform choice (Expo), stack, design quality, working with Claude, quality, draft roadmap A–E, open decisions |
| [`05-demo-redesign-plan.md`](05-demo-redesign-plan.md) | The approved redesign of the demo, step by step, with ready-to-paste prompts for Claude Code sessions |

The owner also has the same analysis in Spanish, as living documents with diagrams:

- PlayerPlus — Análisis completo del competidor: https://claude.ai/artifact/EXEacUwcaWezUp4w7J11NK
- CoachSpace vs PlayerPlus — Comparativa y qué adoptar: https://claude.ai/artifact/Bn1cfftoNKuq5QWRogUx47
- Estrategia: el PlayerPlus de Países Bajos y España: https://claude.ai/artifact/YY1Qx3hiPdFLGLuxh68vV6
- CoachSpace — Plan técnico, herramientas y borrador de roadmap: https://claude.ai/artifact/YKJcm6chBH5inm4LH4sdut

## The five findings that drive everything

1. **PlayerPlus's core loop is tiny**: the coach creates an event, every member answers "going / not going"
   with one tap, the coach sees who is coming, and changes are pushed to everyone. CoachSpace did not have
   that loop at all (the participant view was read-only).
2. **The demo felt confusing because of structure, not colour**: 8 navigation destinations, a coach home of
   about 4,100 px on a 390 px phone with 11 blocks of equal weight, and the same actions in several places.
3. **CoachSpace's real advantage is the coach's technical work** (exercise library, session plans, notes,
   videos per player) for one coach or school with many groups. PlayerPlus, Spond and Teamy do not cover it.
4. **The Netherlands already has a local "PlayerPlus"**: Teamy, based in Groningen. Spain has no dominant
   team app found; WhatsApp is the incumbent. Recommended beachhead: Spain (Balearic Islands), tennis/padel
   schools and grassroots football; the Netherlands for validation.
5. **For the stores**: React Native with Expo for iOS and Android, Supabase in the EU, the current Next.js
   app kept for the web. To be approved by the owner before Phase 3 work starts.
