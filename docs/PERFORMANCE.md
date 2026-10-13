# CoachSpace — Mobile interaction audit

Why buttons and links felt slow on phones on the Vercel deployment, what was measured, and what
changed (D-054). Written on 12 October 2026.

## 1. Limits of this audit

- **The Vercel deployment could not be opened from the development environment** (the network policy
  blocks `vercel.app`). No measurement here comes from Vercel, and **none comes from a real phone**.
- Everything below is a **laboratory simulation** on the production build (`next build` and `next start`)
  on the same machine. Chromium ran at 390 × 844 with touch, with a 4× slower CPU and a "slow 4G" network
  (150 ms round trip, 1.6 Mbit/s down): the profile Lighthouse uses for phones.
- Server round trips in the simulation cost the emulated network latency plus a few milliseconds of
  rendering. On Vercel they also include a serverless function, which can take several hundred milliseconds
  more when it starts cold, plus the distance to the function's region. Real delays on the old version were
  therefore probably **longer** than the figures in §3. That is an estimate, not a measurement.
- The script is `tests/e2e/perf.mjs`. It taps each control five times in fresh browsers and reports the
  median. Run it with: `PW=$(npm root -g)/playwright node tests/e2e/perf.mjs <folder> <label>`.

## 2. What was checked

| Possible cause | Finding |
|---|---|
| Pages rendered on the server for every visit | **Root cause.** 17 of 33 routes were "dynamic" (ƒ in `next build`), among them Calendar, Settings, Announcements, Attendance, New session, New announcement and every session page. They read `searchParams` or checked ids on the server. Next.js cannot prefetch such pages, so every tap waited for a server response and nothing changed on screen meanwhile. |
| Settings sections | Each section tab (`?section=`) was also a server round trip. |
| JavaScript size and hydration | About 130 kB first-load JS per page (gzip), the same before and after. Not the cause. |
| Re-renders and state updates | Toggling a calendar group re-renders the calendar in about 100 ms on the 4×-slowed CPU (INP-style measure), which is within the "good" range (under 200 ms). Toggling attendance, opening the filter and switching the demo view respond in 25–60 ms. |
| localStorage | One small JSON write per change. Not measurable in the interaction times. |
| Images | The app had no photographs. The new Demo Studio uses inline SVG drawings of a few kilobytes. |
| Third-party scripts and analytics | None. |
| Fonts | DM Sans through `next/font` with `display: swap`. No layout problem seen. |
| Tap delay (the old 300 ms) | Not present: the page sets `width=device-width`. Tailwind v4 limits `hover:` styles to devices that can hover, so no "first tap only hovers" problem on iOS. |
| Console errors, failed requests, hydration warnings | None. Only cancelled prefetch requests appeared, which is normal when navigating. |

## 3. Measurements (median of 5, milliseconds)

"Feedback" is the time from the tap to the first change on screen. "Done" is the time until the
expected result is visible (new page heading, panel open, switch changed).

| Interaction | Before: feedback | Before: done | After: feedback | After: done |
|---|---:|---:|---:|---:|
| Bottom navigation → Calendar | 473 | 475 | 83 | 85 |
| More → Settings | 411 | 414 | 56 | 58 |
| Open a session from the calendar | 460 | 463 | 117 | 121 |
| Bottom navigation → Groups (already static) | 69 | 72 | 80 | 84 |
| Bottom navigation → Chat (already static) | 109 | 115 | 96 | 105 |
| Open the calendar group filter | 61 | 66 | 50 | 56 |
| Deselect a group in the filter | 58 | 100 | 71 | 109 |
| Switch attendance off (with confirmation) | 26 | 37 | 27 | 35 |
| Switch to the participant view | 98 | 102 | 93 | 97 |
| Reset demo data | no visible feedback | — | 39 | — |
| Demo Studio: preview a scenario | — | — | 44 | 70 |
| Demo Studio: activate a scenario | — | — | 33 | see note |

Page load of the dashboard, before and after: first contentful paint about 735 ms and 690 ms. The
scripts downloaded before the network goes quiet rose from about 166 kB to 208 kB. That is because more
pages are now static and their code is prefetched in the background; the code needed for the first
render grew by about 4 kB, mostly the default scenario's richer data.

Note: "activate a scenario" mounts the whole app again with the new data. Its tap handling is longer
(about 130 ms on the slowed CPU) but it is a presenter action done before a demo, not during one.

## 4. What changed

1. **Every page that can be built in advance is now static.** Pages read the URL in the browser
   (`useSearchParams` inside `<Suspense>`), and ids are resolved in the browser, which the demo scenarios
   (D-053) needed anyway. Next.js now prefetches these pages when their links appear, so a tap on Calendar,
   Settings, Announcements or Attendance opens the page without asking the server.
2. **Pages with known ids are built at build time** (`generateStaticParams`): groups, conversations,
   exercises, plans and the participant's pages, for all four scenarios.
3. **Session pages** depend on the date, so they cannot all be built in advance. They are built on their
   first visit and then cached. A `loading.tsx` in those routes (sessions, and exercise, plan and video pages, whose items can be created in the browser) shows a placeholder at once while that happens. It is not used at the top level, so pages built in advance are never wrapped in it.
4. **Reset demo data** now confirms on screen that the data was restored.

Nothing was removed and no test was disabled.

## 5. Update, 13 October 2026 (welcome screen, attendance, D-055 to D-061)

The same script, the same simulated phone (390 × 844, touch, 4× slower CPU, 150 ms round trip,
1.6 Mbit/s) and the production build, median of 5 runs. Still a laboratory simulation: not Vercel and
not a real phone.

| Interaction | Feedback | Done |
|---|---:|---:|
| Bottom navigation → Calendar | 87 | 90 |
| More → Settings | 58 | 60 |
| Open a session from the calendar | 122 | 129 |
| Open the calendar group filter | 48 | 53 |
| Switch attendance off | 31 | 40 |
| Reset demo data (with confirmation) | 44 | 52 |
| Switch to the participant view | 111 | 127 |
| Settings → Demo: switch to another scenario | 45 | 102 |
| Welcome screen: choose a sport (to its dashboard) | 50 | 312 |
| First visit: open `/` until the welcome screen's heading shows | — | 1,865 |

- The navigation figures are the same as after D-054 (within a few milliseconds): the new screens did
  not slow anything down. Dashboard first contentful paint about 690 ms; scripts downloaded before
  the network goes quiet about 214 kB (208 kB before, the new screens' code).
- The first visit costs one extra round trip: the browser asks for `/`, the head script sends it to
  `/demo` before anything is painted, and `/demo` loads. On the simulated slow 4G the welcome screen's
  heading appears after about 1.9 s from the start of the navigation; returning visitors go straight
  to their dashboard. A server-side redirect would need a cookie and a Vercel middleware on every
  request to `/`, so it was not added.
- No console errors and no failed requests in any run.

### Attendance for a group of ten (Football Academy, U16 Development, 390 px)

Measured with a separate script on the production build before the change (commit `96d5ecc`) and
after it (D-056), same browser profile; tap-to-feedback with the 4× slower CPU.

| | Before | After |
|---|---:|---:|
| Row height | 113 px | 61 px |
| Height of the list of ten | 1,129 px | 609 px |
| Interactive controls on the form | 23 | 13 |
| Controls under 44 px tall | 22 | 1 (the "Session" back link's text; its tap area is now 44 px) |
| Taps to record two absentees and save | 4 with "Mark everyone present" (11 without) | 3 |
| Tap to visual feedback (median of 6) | 28 ms | 33 ms |

Both versions respond to a tap in well under 100 ms; the difference is within measurement noise. The
gain is in fewer taps, less scrolling and larger targets, not in raw speed.

## 6. Remaining uncertainty and what to check on a phone

- Check the preview on a real phone, on mobile data. Tapping Calendar, Settings, Announcements and
  Attendance should feel instant. The first time a session is opened, the placeholder may show briefly.
- If anything still feels slow, note which control and whether the delay comes before anything changes
  on screen or after the page has changed. That tells server time apart from rendering time.
- The Vercel project's function region was not checked from here. If the region is far from Spain, the
  first visit to each session page will take longer.
