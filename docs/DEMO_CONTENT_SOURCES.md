# CoachSpace — Demo content sources

Where the four demo scenarios (D-053) come from, and what has and has not been checked. Written on
12 October 2026; video candidates added on 14 October 2026.

## 1. What is fictional and what is sourced

- **Everything in the app is original and fictional.** That covers organisations, coaches, participants,
  messages, announcements, schedules, exercises and plans. None of it is copied from a federation,
  a club, a course or a paid resource. None of it is presented as official.
- **The coaching principles behind the content come from public coaching resources**, listed in §3.
  Examples are serve consistency before power, rondos and scanning, man-to-man defence for younger
  players, and modifications for every Pilates exercise. The sessions were written to follow those
  principles, not to reproduce any page.
- **Group sizes, session lengths, capacities and equipment** use the typical values in §3. Examples are
  4–6 players per tennis court, 90-minute youth football and basketball sessions, and Pilates reformer
  classes of about 50 minutes with 8–12 reformers.
- **Video links** are YouTube *search* links (for example "tennis serve placement drill"). They are not
  links to a chosen video. YouTube could not be opened from the development environment (checked
  again on 13 October 2026), so no specific video could be watched or verified, and none was
  invented. Since D-057 the app labels these links as what they are: "Find example videos on
  YouTube (opens a search)", with a note that no specific video has been chosen. "Watch video" is
  used only for a specific YouTube or Vimeo link that a coach adds. To replace a search with a real
  video, open the exercise, choose Edit and paste the video's link, after watching it.
- **Video candidates for the owner to check (14 October 2026, D-064 work).** YouTube, Vimeo and the
  coaching sites below were blocked again from the cloud session (HTTP 403 from the proxy, DNS errors
  from the page fetch tool), so **no video was watched and no link was changed**. The tennis seed
  still uses labelled search links. A web search returned these pages, which say they contain or
  point to tennis coaching videos. They are *candidates only*: titles and descriptions come from the
  search summaries, not from watching anything.

  | Exercise it could illustrate | Candidate (from search results, unverified) |
  |---|---|
  | Split-step and recovery footwork | Play Your Court (Scott Baxter), "SIMPLE Tennis Footwork Drill For FASTER Feet – The 'Split Step'": https://www.playyourcourt.com/news/?p=8990 |
  | Split-step and recovery footwork | "The Ultimate Guide to Tennis Footwork: Key Drills for Faster Movement" (about 14 minutes; listed on Amara with subtitles): https://amara.org/videos/izQqLYJEG6hp/info/the-ultimate-guide-to-tennis-footwork-key-drills-for-faster-movement |
  | Serve toss consistency, serve placement | IMG Academy, "3 tennis serve drills" (hand relaxation, toss location, stance): https://www.imgacademy.com/news/3-tennis-drills-improve-your-serve |
  | Serve basics (Adult Beginners) | LTA, *Tennis Made Easy*, episode "Serve Your Way" (series said to be on the LTA YouTube channel): https://www.lta.org.uk/news/2021/september/tennis-made-easy/ |

  **Owner step (pending):** open each page on your own computer, watch the video, check that it shows
  what the exercise describes and is free to view, and copy the exact YouTube or Vimeo address. Then
  either open the exercise in the demo (Edit → video link) to try it, or send the addresses so they
  can replace the search links in `src/data/scenarios/tennis.ts`. Until then the app keeps saying
  "Find example videos on YouTube (opens a search)".
- **Pilates** exercises all carry the same safety note: general guidance only, not medical advice,
  offer modifications, and anyone with an injury, a health condition or a pregnancy should check with a
  health professional first. Participant details never hold health information (audit F-16). A unit
  test checks both.

## 2. How the sources were found, and the limits

The sources were found with a web search on 12 October 2026. **No page could be opened from the
development environment.** The cloud session's network policy blocks these sites, and the page fetch
tool failed with a DNS error on every one of them. So:

- each URL below appeared in search results, with the title the search showed;
- the notes are based on the search summaries, not on reading the pages;
- **before quoting any of these sources to a customer, open the link in a browser and confirm it says
  what the note says.**

Treat the list as a reading list for checking the demo content, not as verified citations.

## 3. Sources by sport (accessed 12 October 2026, via search results)

### Tennis

| Source | What it supports in the demo |
|---|---|
| ITF, *ITF Tennis Play and Stay*: https://itftennis.com/en/growing-the-game/itf-tennis-play-and-stay | Game-based approach: beginners serve, rally and score from the first lesson (Adult Beginners: "Learn to rally, serve and score from the first lesson"). |
| ITF Coaching & Sport Science Review, Play and Stay articles: https://itfcoachingreview.com/index.php/journal/article/download/604/1611/2523 | Technique taught in service of playing points; sessions end with match play (King of the court, three-ball patterns). |
| LTA, *Coaching LTA Youth*: https://www.lta.org.uk/roles-and-venues/coaches/products-and-programmes/lta-youth/ | Stage-based junior development and a consistent serve and rally as goals (U16 Development). |
| USTA Net Generation practice plans: https://www.usta.com/content/dam/usta/content-fragments/tennis-service-center/assets/pdfs/Net-Generation-Practice-Plan-Orange.pdf | Small groups per court, simple → complex progressions, and finishing with point play (the "Progression" field of each drill). |

### Football

| Source | What it supports in the demo |
|---|---|
| FIFA Training Centre, *Dynamic rondos and numerical advantages* (12–15): https://www.fifatrainingcentre.com/en/practice/grassroots/12-to-15/dynamicrondos-and-numerical-advantages.php | Rondo → possession game → game structure (Rondo 4v1, Possession game 5v5 + 2). |
| FIFA Training Centre, *3v1 rondo: fast readjustments*: https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/secure-possession/3v1-rondo-fast-readjustments.php | Supporting angles and quick readjustment in rondos (coaching points of Rondo 4v1). |
| England Football Learning, *Receiving skills: take a picture*: https://learn.englandfootball.com/sessions/resources/2022/Receiving-skills-take-a-picture | An open body and scanning before receiving ("Scanning: take a picture", "Passing and receiving: open body"). |
| The FA, *4 Corner Model*: https://learn.englandfootball.com/articles/resources/2022/the-fa-4-corner-model | Games with many decisions; technical, physical, psychological and social balance. |
| US Soccer, *Play-Practice-Play*: https://www.ussoccer.com/stories/2018/02/five-things-to-know-about-playpracticeplay | Sessions that start and end with games (small-sided game 5v5 at the end of plans). |

### Basketball

| Source | What it supports in the demo |
|---|---|
| FIBA / WABC, *Coaching Manual – Mini Basketball*: https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaching-manual-mini-basketball-eng.pdf | Game-based teaching; 3x3 and 4x4 for more touches; man-to-man defence for younger players (3v3 half-court game, Shell drill). |
| FIBA, *Develop youth basketball*: https://about.fiba.basketball/en/organization/strategy/develop-youth-basketball | The youth development pathway (U16 Development, U18 Performance). |
| Basketball England, *"No Zone Defence" guidelines*: https://www.basketballengland.co.uk/media/2234/u14-no-zone-defence16.pdf | Individual man-to-man defence for young players (closeouts and defensive slides). |
| USA Basketball & NBA, *Youth Guidelines*: https://youthguidelines.nba.com | Practice length by age: 60–90 minutes for teenagers (90-minute youth sessions). |

### Pilates

| Source | What it supports in the demo |
|---|---|
| Merrithew / STOTT PILATES, *Five Basic Principles*: https://www.merrithew.com/stott-pilates/warmup/en/principles/five-basic-principles | Breathing, pelvic and ribcage placement, scapular stability, head and neck (Breathing and pelvic placement, coaching points throughout). |
| Balanced Body, *Mat Pilates Certification*: https://www.pilates.com/education/pilates-mat-certification-instructor-training/ | Levels of mat work, and modifications and precautions for every exercise (the "Progression" field and the safety note). |
| Pilates Method Alliance, *How to Choose a Pilates Teacher Training Program*: https://www.pilatesmethodalliance.org/pma-blog/how-to-choose-a-pilates-teacher-training-program | Recognised teacher training; principles such as control, precision and flow. |
| NHS, *Chair-based Pilates exercise video*: https://www.nhs.uk/conditions/nhs-fitness-studio/chair-based-pilates-exercise-video | Safety: people with a health condition or injury should speak to a health professional (the safety note). |
| ACE (reprinting ACSM), *Exercise Preparticipation Health Screening Questionnaire*: https://www.acefitness.org/images/webcontent/assets/certification/ace-answers/forms/pt/21_Exercise_Preparticipation_Health-Screening_Questionnaire_For_Exercise_Pros.pdf | Screening and medical clearance belong to professionals, not to an app (no medical claims anywhere). |

Typical class format (55-minute classes, around 12 reformers) came from studio listings in search results, not
from an education body. The demo uses 50–55-minute classes and 10 reformers.

Gaps:
- No official page on tennis recovery footwork or basketball closeout technique was found. Those drills use
  common coaching knowledge.
- No primary UEFA grassroots page was found.

## 4. Images

### Photographs (since 7 November 2026, D-074)

The owner chose these photographs on Pexels on 7 November 2026; they were downloaded from
`images.pexels.com` on the same day, looked at one by one, cropped to 16:10 and saved in two widths
(`public/photos/<name>-640.jpg` and `-1280.jpg`, JPEG quality 72, about 1.4 MB in all). They are used on
the welcome screen and Settings → Demo (covers), the Agenda's next-session card, the session sheet and the
player's swipe card. All are under the **Pexels License** (https://www.pexels.com/license/): free
commercial use, credit not required, no selling unaltered copies, no implied endorsement by the people
shown. Photographers' names could not be read from this environment (the Pexels pages block automated
reading): open each page to see the credit.

| File | Pexels page | Use |
|---|---|---|
| `tennis-cover` | https://www.pexels.com/photo/31128424/ (court from above) | Tennis cover and sessions |
| `tennis-1` | https://www.pexels.com/photo/37090947/ | Tennis sessions |
| `football-cover` | https://www.pexels.com/photo/17082186/ (pitch from above) | Football cover and sessions |
| `football-1` | https://www.pexels.com/photo/6077802/ | Football sessions |
| `basketball-cover` | https://www.pexels.com/photo/31040982/ (hoop and ball) | Basketball cover and sessions |
| `basketball-1` | https://www.pexels.com/photo/12765788/ | Basketball sessions |
| `basketball-3` | https://www.pexels.com/photo/32619170/ | Basketball sessions |
| `pilates-cover` | https://www.pexels.com/photo/36833353/ (reformer studio) | Pilates cover and sessions |
| `pilates-1` | https://www.pexels.com/photo/25596885/ | Pilates sessions |

Not used: Pexels 17649414 (a stadium with clearly visible BNL, BNP Paribas and BMW advertising) and
Pexels 30986365 (sponsors' banners behind the players), because real brands should not appear in the demo.
The owner's two Unsplash choices (`hurPNHKDcrk`, `RNiK93wcz-U`) could not be downloaded from this
environment (Unsplash requires a signed-in download); the second shows a Nike shoe, so it would need a crop.

The vector illustrations below are kept for illustrated empty states (`ScenarioIllustration`).

### What the demo used before the photographs

The four welcome-screen cards (D-055) and the Settings → Demo switcher use **original vector
illustrations** drawn for CoachSpace (`src/components/demo/ScenarioCover.tsx`), in the style of a
coach's tactics board seen from above: a tennis court with the coach feeding from a basket to two
players aiming at targets; a football pitch with a 4v1 rondo in a coned square; a basketball half court
with a pass and a cut to the basket; a Pilates studio with three reformers, two mats and the
instructor. People are shown as coloured discs, not drawn figures. They have no third-party content and
no licence to track. Each is a few kilobytes, needs no network request and stays sharp at any size.
Each has alternative text describing the scene.

### Why not photographs (yet)

The brief asked for licensed photographs of real coaching. From this development environment
(checked again on 13 October 2026; only GitHub and the npm registry are reachable):

- the stock libraries (Unsplash, Pexels, Pixabay, Wikimedia Commons and others) could not be reached at
  all;
- so no photograph could be downloaded, looked at, optimised or checked against its licence page.

Using a photograph that nobody had seen, or hotlinking an external image, would break the brief's rules.
The illustrations are the safer alternative it allows.

### Candidates for the owner to check

These came from the same web search and are **unverified**. Open each page, check the licence shown
there, and look at the photo before using it.

| Scenario | Candidate page | Photographer (from search) | Licence (from search) |
|---|---|---|---|
| Football | https://www.pexels.com/photo/a-man-coaching-his-team-on-the-field-8941609/ | Kampus Production | Pexels License |
| Football | https://www.pexels.com/photo/a-coach-looking-his-soccer-players-7611541/ | Lisha Dunlap | Pexels License |
| Basketball | https://www.pexels.com/photo/man-in-black-crew-neck-t-shirt-and-black-pants-holding-basketball-6767216/ | cottonbro studio | Pexels License |
| Basketball | https://www.pexels.com/photo/basketball-coach-talking-to-his-player-6767248/ | cottonbro studio | Pexels License |
| Pilates | https://www.pexels.com/photo/the-interior-of-a-pilates-studio-11036673/ (studio interior, no people) | Karl Solano | Pexels License |
| Tennis | Search page only: https://www.pexels.com/search/tennis%20coach/ | — | — |

Avoid Unsplash+ photos, such as the Pilates instructor photo the search found
(https://unsplash.com/photos/a-pilates-instructor-guides-her-student-during-exercises-4-MV0DXLn44). They
are a paid licence, not the free Unsplash License.

What the search summaries said about the free licences (check the official pages,
https://www.pexels.com/license/ and https://unsplash.com/license):

- commercial use is allowed and credit is not required;
- you may not sell unaltered copies or imply that the people shown endorse the product;
- releases for recognisable people are not guaranteed.

**For CoachSpace, never suggest that the people in a stock photo are real CoachSpace coaches or customers.**

### How to switch to photographs later

1. Choose one photograph per scenario and check its licence page.
2. Save a 1200 × 675 px WebP or JPEG of about 150 KB or less in `public/scenarios/<scenario>.webp`.
3. In `ScenarioCover` (used by the welcome screen and Settings → Demo), render a `next/image` with `sizes="(min-width: 1536px) 25vw, (min-width: 768px) 50vw, 100vw"`
   and lazy loading, instead of the drawing.
4. Record the photographer, page URL, licence and date in this section.
