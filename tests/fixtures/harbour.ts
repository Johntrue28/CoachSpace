// Test fixture: the original mixed-sport demo data (one coach, four sports) from before the
// demo scenarios (D-053). The rule tests (calendar, schedule, attendance, plans, activity, unread)
// were written against it; they activate this fixture so their assertions stay exactly as they
// were, independent of the content of the four real scenarios. Not used by the app.
import type { ScenarioData } from "@/data/scenarios/types";

const C = "coach";
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const harbourFixture: ScenarioData = {
  // Stands in for a scenario id; the fixture is applied directly with applyScenario().
  id: "tennis",
  coach: {
  name: "Laura Gomez",
  organisation: "Harbour Sports Academy",
},
  demoParticipantId: "p12",
  disciplines: ["General", "Football", "Basketball", "Tennis"],
  attendanceRate: 0.85,
  groups: [
  {
    id: "g1",
    name: "U12 Football",
    discipline: "Football",
    description: "Under-12 squad focused on technique, small-sided games and teamwork.",
    slots: [
      { weekday: 1, time: "18:00", durationMin: 75 },
      { weekday: 3, time: "18:00", durationMin: 75 },
    ],
    venue: "Pitch 2",
  },
  {
    id: "g2",
    name: "Senior Basketball",
    discipline: "Basketball",
    description: "Adult competitive team training for the regional league.",
    slots: [
      { weekday: 2, time: "19:30", durationMin: 90 },
      { weekday: 4, time: "19:30", durationMin: 90 },
    ],
    venue: "Main hall",
  },
  {
    id: "g3",
    name: "Junior Tennis",
    discipline: "Tennis",
    description: "Small-group coaching for juniors aged 12–15.",
    slots: [
      { weekday: 3, time: "17:30", durationMin: 60 },
      { weekday: 5, time: "17:30", durationMin: 60 },
    ],
    venue: "Court 3",
  },
  {
    id: "g4",
    name: "Morning Fitness",
    discipline: "Tennis",
    description: "Fitness class for adult tennis players focusing on core strength and mobility.",
    slots: [
      { weekday: 2, time: "08:30", durationMin: 55 },
      { weekday: 4, time: "08:30", durationMin: 55 },
    ],
    venue: "Studio A",
  },
],
  participants: [
  // U12 Football
  { id: "p01", groupId: "g1", name: "Leo Martin", detail: "Goalkeeper", joined: "Sep 2025" },
  { id: "p02", groupId: "g1", name: "Noah Ruiz", detail: "Defender", joined: "Sep 2025" },
  { id: "p03", groupId: "g1", name: "Mia Torres", detail: "Defender", joined: "Jan 2026" },
  { id: "p04", groupId: "g1", name: "Lucas Navarro", detail: "Midfielder", joined: "Sep 2025" },
  { id: "p05", groupId: "g1", name: "Ella Romero", detail: "Midfielder", joined: "Sep 2024" },
  { id: "p06", groupId: "g1", name: "Hugo Serrano", detail: "Midfielder", joined: "Mar 2026" },
  { id: "p07", groupId: "g1", name: "Sofia Molina", detail: "Forward", joined: "Sep 2024" },
  { id: "p08", groupId: "g1", name: "Dani Ortega", detail: "Forward", joined: "Sep 2025" },
  { id: "p09", groupId: "g1", name: "Oliver Castro", detail: "Defender", joined: "Sep 2025" },
  { id: "p10", groupId: "g1", name: "Alba Vidal", detail: "Midfielder", joined: "Jan 2026" },
  // Senior Basketball
  { id: "p11", groupId: "g2", name: "Marcus Reid", detail: "Point guard", joined: "Sep 2023" },
  { id: "p12", groupId: "g2", name: "Jordan Hale", detail: "Shooting guard", joined: "Sep 2024" },
  { id: "p13", groupId: "g2", name: "Sam Okafor", detail: "Small forward", joined: "Sep 2023" },
  { id: "p14", groupId: "g2", name: "Chris Duval", detail: "Power forward", joined: "Jan 2025" },
  { id: "p15", groupId: "g2", name: "Tom Becker", detail: "Centre", joined: "Sep 2024" },
  { id: "p16", groupId: "g2", name: "Andre Silva", detail: "Guard", joined: "Sep 2025" },
  { id: "p17", groupId: "g2", name: "Ryan Moss", detail: "Forward", joined: "Sep 2025" },
  { id: "p18", groupId: "g2", name: "Ben Carter", detail: "Centre", joined: "Mar 2026" },
  // Junior Tennis
  { id: "p19", groupId: "g3", name: "Chloe Bennett", detail: "Intermediate", joined: "Sep 2024" },
  { id: "p20", groupId: "g3", name: "Ethan Price", detail: "Beginner", joined: "Jan 2026" },
  { id: "p21", groupId: "g3", name: "Isla Ward", detail: "Advanced", joined: "Sep 2023" },
  { id: "p22", groupId: "g3", name: "Max Fischer", detail: "Intermediate", joined: "Sep 2025" },
  { id: "p23", groupId: "g3", name: "Ava Rossi", detail: "Intermediate", joined: "Sep 2025" },
  { id: "p24", groupId: "g3", name: "Liam Shaw", detail: "Beginner", joined: "Mar 2026" },
  // Morning Fitness
  { id: "p25", groupId: "g4", name: "Helen Price", detail: "Regular", joined: "Jan 2025" },
  { id: "p26", groupId: "g4", name: "Grace Lin", detail: "Regular", joined: "Sep 2024" },
  { id: "p27", groupId: "g4", name: "Paula Ferrer", detail: "New", joined: "Sep 2026" },
  { id: "p28", groupId: "g4", name: "Kate Moreno", detail: "Regular", joined: "Jan 2026" },
  { id: "p29", groupId: "g4", name: "Diana Cruz", detail: "Returning after injury", joined: "Sep 2025" },
  { id: "p30", groupId: "g4", name: "Ruth Evans", detail: "Regular", joined: "Mar 2025" },
  { id: "p31", groupId: "g4", name: "Nina Patel", detail: "New", joined: "Sep 2026" },
  // Jordan Hale also attends Morning Fitness for mobility work (same person, two groups).
  { id: "p12", groupId: "g4", name: "Jordan Hale", detail: "Mobility work", joined: "Jan 2026" },
],
  sessionTopics: {
  g1: { from: "2026-10-12", list: ["Passing and first touch", "Small-sided games", "Dribbling and 1v1", "Shooting technique"] },
  g2: { from: "2026-10-15", list: ["Pick-and-roll defence", "Shooting drills", "Fast break", "Zone offence"] },
  g3: { from: "2026-10-07", list: ["Serve technique", "Serve and return", "Forehand consistency", "Volleys at the net"] },
  g4: { from: "2026-10-13", list: ["Core and mobility", "Balance and posture", "Full-body flow", "Hip and spine mobility"] },
},
  exercises: [
  {
    id: "e1",
    title: "Dynamic warm-up routine",
    description: "Gets the whole group moving and ready to train.",
    discipline: "General",
    category: "Warm-up",
    durationMin: 10,
    equipment: "Cones",
    instructions:
      "Jog 2 laps, then 10 m each of high knees, heel flicks, side shuffles and carioca. Finish with 3 progressive sprints at 70%, 80% and 90%.",
    videoUrl: yt("dynamic warm up routine for sport"),
  },
  {
    id: "e2",
    title: "Rondo 4v1",
    description: "Keeping possession under pressure with quick passing.",
    discipline: "Football",
    category: "Technique",
    durationMin: 12,
    equipment: "Balls, cones (8×8 m square)",
    instructions:
      "Four players on the outside keep possession against one defender in the middle. Two-touch maximum. The player who loses the ball swaps with the defender.",
    videoUrl: yt("rondo 4v1 football drill"),
  },
  {
    id: "e3",
    title: "1v1 finishing",
    description: "Quick decisions and finishing against a defender.",
    discipline: "Football",
    category: "Tactics",
    durationMin: 15,
    equipment: "Balls, goal, cones",
    instructions:
      "Attacker receives a pass from the halfway line and goes 1v1 against a defender. Shoot within 6 seconds. Rotate roles after each go.",
  },
  {
    id: "e4",
    title: "Mikan drill",
    description: "Layup rhythm and soft touch with both hands.",
    discipline: "Basketball",
    category: "Technique",
    durationMin: 8,
    equipment: "Ball, hoop",
    instructions:
      "Alternate right- and left-hand layups under the basket without letting the ball touch the floor. 3 sets of 30 seconds.",
    videoUrl: yt("mikan drill basketball"),
  },
  {
    id: "e5",
    title: "Defensive slides",
    description: "Low defensive stance and lateral speed.",
    discipline: "Basketball",
    category: "Conditioning",
    durationMin: 6,
    equipment: "Cones",
    instructions: "Slide lane-line to lane-line staying low, without crossing feet. 6 × 20 seconds with 40 seconds rest.",
  },
  {
    id: "e6",
    title: "Serve toss consistency",
    description: "A repeatable ball toss for a more reliable serve.",
    discipline: "Tennis",
    category: "Technique",
    durationMin: 10,
    equipment: "Balls, racket",
    instructions:
      "Toss the ball without hitting and let it land. It should land just inside the baseline, in front of the leading foot. 20 tosses, then 20 serves.",
    videoUrl: yt("tennis serve toss drill"),
  },
  {
    id: "e7",
    title: "Split-step reaction",
    description: "Faster first step after the opponent's shot.",
    discipline: "Tennis",
    category: "Conditioning",
    durationMin: 8,
    equipment: "Balls",
    instructions:
      "Split-step as the coach feeds; react to the direction and touch the ball. 4 sets of 10 feeds.",
  },
  {
    id: "e8",
    title: "The Hundred",
    description: "Classic core warm-up with breathing.",
    discipline: "General",
    category: "Strength",
    durationMin: 5,
    equipment: "Mat",
    instructions:
      "Lie on your back, legs in tabletop, head and shoulders lifted. Pump the arms while breathing in for 5 counts and out for 5 counts, 10 times.",
    videoUrl: yt("the hundred core exercise tutorial"),
  },
  {
    id: "e9",
    title: "Hip and thoracic mobility flow",
    description: "Gentle mobility for hips and upper back.",
    discipline: "General",
    category: "Mobility",
    durationMin: 8,
    equipment: "Mat",
    instructions:
      "World's greatest stretch, 90/90 hip switches and open books. 5 slow repetitions of each per side.",
  },
],
  assignments: [
  // Same warm-up reused in two groups with different instructions.
  {
    id: "a-seed-1",
    exerciseId: "e1",
    groupId: "g1",
    audience: "group",
    participantIds: [],
    customInstructions: "Shorter version for U12: 1 lap jog, then the drills at a relaxed pace. Skip the 90% sprint.",
    assignedOn: "2026-10-05",
  },
  {
    id: "a-seed-2",
    exerciseId: "e1",
    groupId: "g2",
    audience: "group",
    participantIds: [],
    customInstructions: "",
    assignedOn: "2026-10-05",
  },
  // Only for selected participants.
  {
    id: "a-seed-3",
    exerciseId: "e6",
    groupId: "g3",
    audience: "selected",
    participantIds: ["p20", "p24"],
    customInstructions: "Beginners: 10 tosses and 10 serves only. Focus on a relaxed tossing arm.",
    assignedOn: "2026-10-08",
  },
  {
    id: "a-seed-4",
    exerciseId: "e8",
    groupId: "g4",
    audience: "group",
    participantIds: [],
    customInstructions: "",
    assignedOn: "2026-10-09",
  },
  {
    id: "a-seed-5",
    exerciseId: "e9",
    groupId: "g4",
    audience: "selected",
    participantIds: ["p29"],
    customInstructions: "Diana: only 3 repetitions per side and stop if you feel pain in the knee.",
    assignedOn: "2026-10-09",
  },
  // Jordan Hale gets The Hundred twice: with his fitness group and individually in basketball.
  {
    id: "a-seed-6",
    exerciseId: "e8",
    groupId: "g2",
    audience: "selected",
    participantIds: ["p12"],
    customInstructions: "Jordan: add this to your routine before basketball sessions.",
    assignedOn: "2026-10-10",
  },
],
  announcements: [
  {
    id: "a1",
    groupId: "g1",
    title: "Friendly match on Saturday",
    body: "Kick-off at 10:00. Please arrive 30 minutes early in your home kit.",
    authorId: C,
    postedAt: "2026-10-11T13:00:00+02:00",
  },
  {
    id: "a2",
    groupId: "g2",
    title: "Change of venue",
    body: "Thursday's session moves to the main hall.",
    authorId: C,
    postedAt: "2026-10-10T17:30:00+02:00",
  },
  {
    id: "a3",
    groupId: null,
    title: "Lost property",
    body: "Lost property is kept at reception until the end of the month. Please label kit and water bottles with your name.",
    authorId: C,
    postedAt: "2026-10-09T12:00:00+02:00",
  },
  {
    id: "a4",
    groupId: "g4",
    title: "Bring a small towel",
    body: "From next week, please bring a small towel to every class for the floor exercises.",
    authorId: C,
    postedAt: "2026-10-08T09:15:00+02:00",
  },
],
  conversations: [
  { id: "c-g1", kind: "group", groupId: "g1" },
  { id: "c-g2", kind: "group", groupId: "g2" },
  { id: "c-g3", kind: "group", groupId: "g3" },
  { id: "c-g4", kind: "group", groupId: "g4" },
  // One-to-one chats only with adult participants.
  { id: "c-p11", kind: "direct", participantId: "p11" },
  { id: "c-p29", kind: "direct", participantId: "p29" },
  { id: "c-p31", kind: "direct", participantId: "p31" },
  { id: "c-p12", kind: "direct", participantId: "p12" },
],
  chatMessages: [
  // U12 Football
  { id: "m01", conversationId: "c-g1", senderId: C, body: "Great effort on Wednesday, everyone. Remember to bring a water bottle to every session.", sentAt: "2026-10-09T17:40:00+02:00" },
  { id: "m02", conversationId: "c-g1", senderId: "p07", body: "Thanks coach! Are we doing shooting practice next time?", sentAt: "2026-10-09T18:02:00+02:00" },
  { id: "m03", conversationId: "c-g1", senderId: C, body: "Next session is all about passing and first touch. Shooting the week after.", sentAt: "2026-10-09T18:10:00+02:00" },
  { id: "m04", conversationId: "c-g1", senderId: "p01", body: "Can I bring my new goalkeeper gloves?", sentAt: "2026-10-10T19:15:00+02:00" },
  { id: "m05", conversationId: "c-g1", senderId: C, body: "Of course, Leo. Bring both pairs in case it rains.", sentAt: "2026-10-10T19:20:00+02:00" },
  { id: "m06", conversationId: "c-g1", senderId: "p04", body: "See you at Pitch 2!", sentAt: "2026-10-11T09:30:00+02:00" },
  // Senior Basketball
  { id: "m07", conversationId: "c-g2", senderId: "p12", body: "Good win last night. My legs are feeling it today.", sentAt: "2026-10-08T21:05:00+02:00" },
  { id: "m08", conversationId: "c-g2", senderId: C, body: "Well played, all of you. Light stretching tomorrow and plenty of sleep.", sentAt: "2026-10-08T21:12:00+02:00" },
  { id: "m09", conversationId: "c-g2", senderId: "p15", body: "Is Thursday still at the usual time?", sentAt: "2026-10-10T12:30:00+02:00" },
  { id: "m10", conversationId: "c-g2", senderId: C, body: "Yes, 19:30. We'll work on pick-and-roll defence.", sentAt: "2026-10-10T12:41:00+02:00" },
  { id: "m11", conversationId: "c-g2", senderId: "p11", body: "I'll bring the spare bibs.", sentAt: "2026-10-10T12:45:00+02:00" },
  // Junior Tennis
  { id: "m12", conversationId: "c-g3", senderId: C, body: "This week we're focusing on the serve. Practise your ball toss at home if you can.", sentAt: "2026-10-09T16:00:00+02:00" },
  { id: "m13", conversationId: "c-g3", senderId: "p21", body: "Should we bring our own balls?", sentAt: "2026-10-09T16:20:00+02:00" },
  { id: "m14", conversationId: "c-g3", senderId: C, body: "No need, the club provides them.", sentAt: "2026-10-09T16:25:00+02:00" },
  { id: "m15", conversationId: "c-g3", senderId: "p20", body: "The grip on my racket is coming off. Is that a problem?", sentAt: "2026-10-10T10:05:00+02:00" },
  { id: "m16", conversationId: "c-g3", senderId: C, body: "Bring it on Wednesday and we'll fit a new grip before the session.", sentAt: "2026-10-10T10:30:00+02:00" },
  // Morning Fitness
  { id: "m17", conversationId: "c-g4", senderId: C, body: "Reminder: bring your own mat if you have one. Spare mats are available in Studio A.", sentAt: "2026-10-10T08:00:00+02:00" },
  { id: "m18", conversationId: "c-g4", senderId: "p26", body: "Will do, thanks Laura!", sentAt: "2026-10-10T08:20:00+02:00" },
  { id: "m19", conversationId: "c-g4", senderId: "p25", body: "Is the class suitable for someone with a stiff lower back?", sentAt: "2026-10-11T08:50:00+02:00" },
  { id: "m20", conversationId: "c-g4", senderId: C, body: "Yes, I'll show you some modifications. Tell me how it feels as we go.", sentAt: "2026-10-11T09:05:00+02:00" },
  // Marcus Reid (one-to-one)
  { id: "m21", conversationId: "c-p11", senderId: "p11", body: "Hi Laura, I might be 10 minutes late on Thursday because of work.", sentAt: "2026-10-09T20:10:00+02:00" },
  { id: "m22", conversationId: "c-p11", senderId: C, body: "No problem, Marcus. Warm up on your own when you arrive.", sentAt: "2026-10-09T20:25:00+02:00" },
  { id: "m23", conversationId: "c-p11", senderId: "p11", body: "Thanks!", sentAt: "2026-10-09T20:26:00+02:00" },
  // Diana Cruz (one-to-one)
  { id: "m24", conversationId: "c-p29", senderId: "p29", body: "Hi Laura, I've been told I can start with gentle exercises again.", sentAt: "2026-10-10T18:00:00+02:00" },
  { id: "m25", conversationId: "c-p29", senderId: C, body: "That's great news, Diana. We'll take it slowly and adapt the exercises for you.", sentAt: "2026-10-10T18:30:00+02:00" },
  // Nina Patel (one-to-one): no messages yet, shows the empty state.
  // Jordan Hale (one-to-one): the demo participant.
  { id: "m26", conversationId: "c-p12", senderId: C, body: "Hi Jordan, I've added The Hundred to your basketball routine. Do it before Thursday's session.", sentAt: "2026-10-10T11:00:00+02:00" },
  { id: "m27", conversationId: "c-p12", senderId: "p12", body: "Thanks Laura, I'll try it on Tuesday in fitness first.", sentAt: "2026-10-10T11:20:00+02:00" },
],
  readState: {
  p12: {
    "c-g2": "2026-10-10T12:41:00+02:00", // up to the coach's answer about Thursday
    "c-g4": "2026-10-10T08:20:00+02:00", // up to Grace's reply about mats
  },
},
  plans: [
  {
    id: "t-football",
    title: "Football technique session",
    groupId: null,
    sessionIds: [],
    copiedFromId: null,
    items: [
      { id: "t-football-1", exerciseId: "e1", block: "warm-up", durationMin: 10, instructions: "" },
      { id: "t-football-2", exerciseId: "e2", block: "technical", durationMin: 15, instructions: "" },
      { id: "t-football-3", exerciseId: "e3", block: "tactical", durationMin: 20, instructions: "" },
      { id: "t-football-4", exerciseId: "e9", block: "cool-down", durationMin: 8, instructions: "" },
    ],
    updatedAt: "2026-10-05T10:00:00+02:00",
  },
  {
    id: "t-basketball",
    title: "Basketball defence session",
    groupId: null,
    sessionIds: [],
    copiedFromId: null,
    items: [
      { id: "t-basketball-1", exerciseId: "e1", block: "warm-up", durationMin: 10, instructions: "" },
      { id: "t-basketball-2", exerciseId: "e4", block: "technical", durationMin: 8, instructions: "" },
      { id: "t-basketball-3", exerciseId: "e5", block: "tactical", durationMin: 12, instructions: "" },
      { id: "t-basketball-4", exerciseId: "e9", block: "cool-down", durationMin: 8, instructions: "" },
    ],
    updatedAt: "2026-10-05T10:00:00+02:00",
  },
],
  notes: [
  {
    sessionId: "g1-2026-10-07",
    groupId: "g1",
    worked: "High intensity in the rondo; everyone kept the two-touch rule.",
    improve: "Passing with the weaker foot.",
    revisit: "Finish with 1v1 finishing; we ran out of time.",
    savedAt: "2026-10-07T19:30:00+02:00",
  },
],
};
