// Demo scenarios (D-053): every scenario's data is coherent on its own, switching scenario
// changes every data module together, and saved data never crosses between scenarios.
import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { tennis } from "@/data/scenarios/tennis";
import { football } from "@/data/scenarios/football";
import { basketball } from "@/data/scenarios/basketball";
import { pilates } from "@/data/scenarios/pilates";
import { SCENARIO_IDS, DEFAULT_SCENARIO, COACH_SENDER_ID, type ScenarioData } from "@/data/scenarios/types";
import { loadScenario, scenarioProfiles } from "@/data/scenarios";
import { coachRole, sessionWords } from "@/data/groups";
import { applyScenario, activeScenarioId } from "@/data/scenario";
import * as groupData from "@/data/groups";
import * as exerciseData from "@/data/exercises";
import * as messageData from "@/data/messages";
import * as coachingData from "@/data/coaching";
import { planBlocks } from "@/data/plans";
import { regularSession, sessionById, sessionsOn, weekdayOf } from "@/data/calendar";
import { attendanceCandidates, rosterFor, seedAttendance } from "@/data/attendance";
import {
  clearAllDemoStates,
  clearDemoState,
  hasSavedState,
  loadActiveScenario,
  loadDemoState,
  saveActiveScenario,
  saveDemoState,
  scenarioBootScript,
  WELCOME_PATH,
  chatStorageKey,
  storageKey,
} from "@/data/persistence";

const scenarios: ScenarioData[] = [tennis, football, basketball, pilates];
const unique = (xs: string[]) => new Set(xs).size === xs.length;

afterEach(() => applyScenario(tennis));

for (const s of scenarios) {
  describe(`${s.id} scenario data`, () => {
    const sport = s.groups[0].discipline;
    const groupIds = s.groups.map((g) => g.id);
    const members = (groupId: string) => s.participants.filter((p) => p.groupId === groupId);

    test("ids are unique within the scenario", () => {
      assert.ok(unique(groupIds), "groups");
      assert.ok(unique(s.exercises.map((e) => e.id)), "exercises");
      assert.ok(unique(s.assignments.map((a) => a.id)), "assignments");
      assert.ok(unique(s.announcements.map((a) => a.id)), "announcements");
      assert.ok(unique(s.conversations.map((c) => c.id)), "conversations");
      assert.ok(unique(s.chatMessages.map((m) => m.id)), "messages");
      assert.ok(unique(s.plans.map((p) => p.id)), "plans");
      assert.ok(unique(s.participants.map((p) => `${p.id}:${p.groupId}`)), "memberships");
      // One id is always one person: the same name in every membership.
      for (const p of s.participants) assert.equal(s.participants.find((q) => q.id === p.id)!.name, p.name, p.id);
    });

    test("one sport: every group and every sport-specific exercise belongs to it", () => {
      assert.ok(s.groups.every((g) => g.discipline === sport));
      assert.deepEqual(s.disciplines, ["General", sport]);
      for (const e of s.exercises) assert.ok(e.discipline === "General" || e.discipline === sport, `${e.id} ${e.discipline}`);
      assert.ok(s.exercises.filter((e) => e.discipline === sport).length >= 8, "enough sport-specific exercises");
    });

    test("participants belong to existing groups, within each group's capacity", () => {
      for (const p of s.participants) assert.ok(groupIds.includes(p.groupId), `${p.id} → ${p.groupId}`);
      for (const g of s.groups) {
        assert.ok(members(g.id).length >= 4, `${g.name} has participants`);
        assert.ok(g.capacity === undefined || members(g.id).length <= g.capacity, `${g.name} within capacity`);
      }
    });

    test("the demo participant is Jordan Hale, in two groups", () => {
      const jordan = s.participants.filter((p) => p.id === s.demoParticipantId);
      assert.equal(jordan.length, 2);
      assert.ok(jordan.every((p) => p.name === "Jordan Hale"));
    });

    test("assignments, plans and notes point to this scenario's exercises, groups and people", () => {
      const exerciseIds = s.exercises.map((e) => e.id);
      for (const a of s.assignments) {
        assert.ok(exerciseIds.includes(a.exerciseId) && groupIds.includes(a.groupId), a.id);
        for (const pid of a.participantIds) assert.ok(members(a.groupId).some((p) => p.id === pid), `${a.id}: ${pid} in ${a.groupId}`);
      }
      for (const plan of s.plans) {
        assert.ok(plan.items.length > 0, plan.id);
        for (const item of plan.items) assert.ok(exerciseIds.includes(item.exerciseId), `${plan.id}: ${item.exerciseId}`);
        assert.ok(plan.groupId === null || groupIds.includes(plan.groupId));
      }
      applyScenario(s);
      for (const n of s.notes) {
        const session = regularSession(n.sessionId);
        assert.ok(session, `${n.sessionId} is a real session of the weekly schedule`);
        assert.equal(session.groupId, n.groupId);
      }
    });

    test("chat and announcements only involve this scenario's groups and people", () => {
      for (const c of s.conversations) {
        if (c.kind === "group") assert.ok(groupIds.includes(c.groupId), c.id);
        else assert.ok(s.participants.some((p) => p.id === c.participantId), c.id);
      }
      for (const m of s.chatMessages) {
        const c = s.conversations.find((x) => x.id === m.conversationId);
        assert.ok(c, m.id);
        const allowed = c.kind === "group" ? members(c.groupId).map((p) => p.id) : [c.participantId];
        assert.ok(m.senderId === COACH_SENDER_ID || allowed.includes(m.senderId), `${m.id}: ${m.senderId} may write in ${c.id}`);
      }
      for (const a of s.announcements) assert.ok(a.groupId === null || groupIds.includes(a.groupId), a.id);
      for (const viewer of Object.values(s.readState))
        for (const cid of Object.keys(viewer)) assert.ok(s.conversations.some((c) => c.id === cid), cid);
    });

    test("session topics exist for every group and start on one of its training days", () => {
      for (const g of s.groups) {
        const t = s.sessionTopics[g.id];
        assert.ok(t && t.list.length > 0, g.id);
        assert.ok(g.slots.some((slot) => slot.weekday === weekdayOf(t.from)), `${g.id} topics start on a training day`);
      }
    });

    test("seeded attendance only references real sessions and the group's own participants", () => {
      applyScenario(s);
      const now = new Date(2026, 9, 14, 12, 0); // Wednesday 14 October 2026, 12:00
      const records = seedAttendance(groupIds, now, s.attendanceRate);
      assert.ok(records.length >= s.groups.length, "history for every group");
      for (const r of records) {
        const session = sessionById(r.sessionId);
        assert.ok(session && session.groupId === r.groupId && session.status === "scheduled", r.sessionId);
        assert.deepEqual(Object.keys(r.marks).sort(), rosterFor(r.groupId).map((p) => p.id).sort());
      }
      // The most recent past session of each group is left for the demo to take.
      for (const g of s.groups) {
        const latest = attendanceCandidates(g.id, now).recent[0];
        assert.ok(latest && !records.some((r) => r.sessionId === latest.id), g.id);
      }
      // About three weeks of history (audit F-03): some records older than two weeks, none older than 21 days.
      const dates = records.map((r) => sessionById(r.sessionId)!.date).sort();
      assert.ok(dates[0] >= "2026-09-23" && dates[0] < "2026-09-30", `history starts about three weeks back (${dates[0]})`);
      const marks = records.flatMap((r) => Object.values(r.marks));
      const rate = marks.filter((m) => m === "present").length / marks.length;
      assert.ok(Math.abs(rate - s.attendanceRate) < 0.12, `about ${s.attendanceRate} present (${rate.toFixed(2)})`);
      assert.deepEqual(seedAttendance(groupIds, now, s.attendanceRate), records, "the same on every visit");
    });
  });
}

describe("Pilates content", () => {
  test("a studio says instructor and class; the clubs say coach and session", () => {
    applyScenario(pilates);
    assert.equal(coachRole(), "Instructor");
    assert.deepEqual(sessionWords(), { one: "class", many: "classes", One: "Class", Many: "Classes" });
    applyScenario(football);
    assert.equal(coachRole(), "Coach");
    assert.deepEqual(sessionWords(), { one: "session", many: "sessions", One: "Session", Many: "Sessions" });
  });

  test("every Pilates exercise carries a safety note that is not medical advice", () => {
    for (const e of pilates.exercises) assert.match(e.safetyNote ?? "", /not medical advice/, e.id);
  });
  test("participant details hold no health information", () => {
    for (const s of scenarios)
      for (const p of s.participants) assert.doesNotMatch(p.detail, /injur|pain|pregnan|medical|condition|surgery|recover/i, `${s.id} ${p.name}`);
  });
  test("classes have a capacity and the instructor is called an instructor", () => {
    assert.ok(pilates.groups.every((g) => g.capacity !== undefined));
    assert.equal(pilates.coach.role, "Instructor");
  });
});

describe("Demo Studio profiles", () => {
  test("one profile per scenario, matching its data", async () => {
    assert.deepEqual(scenarioProfiles.map((p) => p.id), [...SCENARIO_IDS]);
    for (const p of scenarioProfiles) {
      const data = await loadScenario(p.id);
      assert.equal(p.organisation, data.coach.organisation);
      assert.equal(p.coachName, data.coach.name);
      assert.equal(p.sport, data.groups[0].discipline);
      assert.deepEqual(p.groupExamples, data.groups.map((g) => g.name));
      assert.ok(p.coverAlt.length > 20 && p.showcases.length === 3);
    }
  });
  test("the demo participant has the same id everywhere (server pages pass it to the chat)", () => {
    assert.ok(scenarios.every((s) => s.demoParticipantId === tennis.demoParticipantId));
  });
  test("the default scenario is the Tennis Coaching", () => {
    assert.equal(DEFAULT_SCENARIO, "tennis");
    assert.equal(activeScenarioId(), "tennis");
  });
});

describe("switching scenario", () => {
  test("every data module follows the active scenario together", () => {
    for (const s of scenarios) {
      applyScenario(s);
      assert.equal(activeScenarioId(), s.id);
      assert.equal(groupData.groups, s.groups);
      assert.equal(groupData.participants, s.participants);
      assert.equal(groupData.coach, s.coach);
      assert.equal(groupData.DEMO_PARTICIPANT_ID, s.demoParticipantId);
      assert.equal(exerciseData.seedExercises, s.exercises);
      assert.equal(exerciseData.seedAssignments, s.assignments);
      assert.deepEqual(exerciseData.exerciseDisciplines, s.disciplines);
      assert.equal(messageData.seedAnnouncements, s.announcements);
      assert.equal(messageData.conversations, s.conversations);
      assert.equal(messageData.seedChatMessages, s.chatMessages);
      assert.equal(coachingData.seedPlans, s.plans);
      assert.equal(coachingData.seedNotes, s.notes);
    }
  });

  test("sessions come only from the active scenario's groups, with its topics", () => {
    for (const s of scenarios) {
      applyScenario(s);
      const names = new Set(s.groups.map((g) => g.id));
      const topics = new Set(Object.values(s.sessionTopics).flatMap((t) => t.list));
      for (let d = 12; d <= 18; d++) {
        for (const session of sessionsOn(`2026-10-${d}`)) {
          assert.ok(names.has(session.groupId), `${s.id}: ${session.id}`);
          assert.ok(topics.has(session.title), `${s.id}: ${session.title}`);
          assert.equal(session.place, groupData.groupById(session.groupId)!.venue);
        }
      }
    }
  });

  test("Pilates names the plan blocks in studio words; other sports keep the defaults", () => {
    applyScenario(pilates);
    assert.deepEqual(planBlocks.map((b) => b.label), ["Centring", "Foundation", "Main sequence", "Stretch and close"]);
    applyScenario(football);
    assert.deepEqual(planBlocks.map((b) => b.label), ["Warm-up", "Technical", "Tactical", "Cool-down"]);
  });

  test("the browser loads each scenario on request, once", async () => {
    for (const id of SCENARIO_IDS) {
      const a = await loadScenario(id);
      assert.equal(a.id, id);
      assert.equal(await loadScenario(id), a);
    }
  });
});

describe("saved data per scenario", () => {
  // A minimal localStorage for Node.
  const store = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
  const seed = { exercises: [] as string[], assignments: [] as string[], note: "seed" };

  test("each scenario saves under its own key and never reads another's", () => {
    store.clear();
    saveDemoState("football", { exercises: ["f"], assignments: [], note: "football" });
    assert.equal(loadDemoState("football", seed, ["exercises"])?.note, "football");
    assert.equal(loadDemoState("tennis", seed, ["exercises"]), null);
    // Data copied under the wrong key is refused.
    store.set(storageKey("pilates"), store.get(storageKey("football"))!);
    assert.equal(loadDemoState("pilates", seed, ["exercises"]), null);
  });

  test("older or broken saves are ignored safely", () => {
    store.clear();
    store.set("coachspace-demo-v1", JSON.stringify({ exercises: [], assignments: [] }));
    assert.equal(loadDemoState("tennis", seed, ["exercises"]), null, "the old mixed-sport save is not read");
    store.set(storageKey("tennis"), "{not json");
    assert.equal(loadDemoState("tennis", seed, ["exercises"]), null);
    store.set(storageKey("tennis"), JSON.stringify({ scenario: "tennis", assignments: [] }));
    assert.equal(loadDemoState("tennis", seed, ["exercises"]), null, "missing required fields");
    store.set(storageKey("tennis"), JSON.stringify({ scenario: "tennis", exercises: ["x"], assignments: [] }));
    assert.equal(loadDemoState("tennis", seed, ["exercises"])?.note, "seed", "new fields fall back to the seed");
  });

  test("reset one scenario, or all of them, without touching anything else", () => {
    store.clear();
    store.set("unrelated", "keep me");
    for (const id of SCENARIO_IDS) saveDemoState(id, { exercises: [], assignments: [] });
    saveActiveScenario("basketball");
    clearDemoState("football");
    assert.equal(hasSavedState("football"), false);
    assert.equal(hasSavedState("tennis"), true);
    assert.equal(loadActiveScenario(), "basketball");
    store.set("coachspace-demo-v1", "{}");
    store.set(chatStorageKey("pilates"), "{}");
    clearAllDemoStates(SCENARIO_IDS);
    assert.equal(store.has(chatStorageKey("pilates")), false, "the demo chat is removed too (D-060)");
    assert.ok(SCENARIO_IDS.every((id) => !hasSavedState(id)));
    assert.equal(loadActiveScenario(), null);
    assert.equal(store.has("coachspace-demo-v1"), false);
    assert.equal(store.get("unrelated"), "keep me");
  });

  test("an unknown remembered scenario falls back to the default", () => {
    store.clear();
    store.set("coachspace-scenario", "rugby");
    assert.equal(loadActiveScenario(), null);
  });

  // Runs the boot script with a fake browser: what is saved, and the page being opened.
  // `visited`: this tab already opened a page of the demo (sessionStorage, D-068); "blocked" makes
  // sessionStorage throw. Defaults to a tab that has already been used, as in the tests before D-068.
  const boot = (
    saved: string | null,
    pathname: string,
    writable = true,
    intro: string | null = null,
    visited: boolean | "blocked" = true,
    search = "",
  ) => {
    const attrs = new Set<string>();
    const replaced: string[] = [];
    const session = new Map<string, string>(visited === true ? [["coachspace-visit", "1"]] : []);
    const fakeStorage = {
      getItem: (k: string) => (k === "coachspace-scenario" ? saved : k === "coachspace-intro-dismissed" ? intro : null),
      setItem: (k: string, v: string) => {
        if (!writable) throw new Error("blocked");
        if (k === "coachspace-scenario") saved = v;
      },
      removeItem: () => {},
    };
    const fakeSession = {
      getItem: (k: string) => {
        if (visited === "blocked") throw new Error("blocked");
        return session.get(k) ?? null;
      },
      setItem: (k: string, v: string) => {
        if (visited === "blocked") throw new Error("blocked");
        session.set(k, v);
      },
    };
    const doc = { documentElement: { setAttribute: (k: string) => attrs.add(k) } };
    const loc = { pathname, search, replace: (url: string) => replaced.push(url) };
    const urls: string[] = [];
    const history = { replaceState: (_: unknown, __: string, url: string) => urls.push(url) };
    new Function("localStorage", "sessionStorage", "document", "location", "history", scenarioBootScript)(fakeStorage, fakeSession, doc, loc, history);
    return {
      hidden: attrs.has("data-scenario-loading"),
      replaced,
      introClosed: attrs.has("data-intro-dismissed"),
      visitMarked: session.get("coachspace-visit") === "1",
      ...(urls.length ? { saved, urls } : {}),
    };
  };

  test("the boot script hides the page only for a saved non-default scenario", () => {
    const run = (saved: string | null) => boot(saved, "/calendar").hidden;
    assert.equal(run(null), false);
    assert.equal(run("tennis"), false);
    assert.equal(run("rugby"), false);
    assert.equal(run("football"), true);
    assert.equal(run("pilates"), true);
  });

  test("the boot script sends a new visitor of / to the welcome screen (D-055)", () => {
    assert.deepEqual(boot(null, "/"), { hidden: true, replaced: [WELCOME_PATH], introClosed: false, visitMarked: true });
    // Only the root: a shared link to another page opens that page.
    assert.deepEqual(boot(null, "/calendar").replaced, []);
    assert.deepEqual(boot(null, "/demo").replaced, []);
    // Someone who already chose a scenario goes straight to the dashboard.
    assert.deepEqual(boot("tennis", "/").replaced, []);
    assert.deepEqual(boot("football", "/"), { hidden: true, replaced: [], introClosed: false, visitMarked: true });
    // When the browser cannot store the choice, the dashboard opens: never a redirect loop.
    assert.deepEqual(boot(null, "/", false), { hidden: false, replaced: [], introClosed: false, visitMarked: true });
  });

  test("opening / again in a new tab shows the welcome screen, a reload in the same tab does not (D-068)", () => {
    // A returning visitor who chose Tennis or Pilates before and opens the link in a new tab.
    assert.deepEqual(boot("tennis", "/", true, "1", false).replaced, [WELCOME_PATH]);
    assert.deepEqual(boot("pilates", "/", true, null, false).replaced, [WELCOME_PATH]);
    assert.equal(boot("tennis", "/", true, null, false).visitMarked, true, "the tab is marked, so the next reload keeps the dashboard");
    // The same tab after choosing: a reload of / keeps the dashboard.
    assert.deepEqual(boot("tennis", "/", true, null, true).replaced, []);
    // Deep links and the welcome screen itself are never redirected, and they mark the tab too.
    assert.deepEqual(boot("tennis", "/calendar", true, null, false).replaced, []);
    assert.equal(boot("tennis", "/calendar", true, null, false).visitMarked, true);
    assert.deepEqual(boot("tennis", "/demo", true, null, false).replaced, []);
    // No sessionStorage: behaves as before D-068 (only a browser with no choice is redirected).
    assert.deepEqual(boot("tennis", "/", true, null, "blocked").replaced, []);
    assert.deepEqual(boot(null, "/", true, null, "blocked").replaced, [WELCOME_PATH]);
    // No localStorage: never a redirect, even in a new tab.
    assert.deepEqual(boot("tennis", "/", false, null, false).replaced, []);
  });

  test("/?sport=<id> chooses that example before the first paint, in one page load (D-070)", () => {
    // A welcome card tapped before the page had loaded, in a new tab.
    assert.deepEqual(boot(null, "/", true, null, false, "?sport=tennis"), { hidden: false, replaced: [], introClosed: false, visitMarked: true, saved: "tennis", urls: ["/"] });
    // Another sport: chosen, and the page stays hidden while its data loads; no trip to the welcome screen.
    assert.deepEqual(boot("tennis", "/", true, null, false, "?sport=pilates"), { hidden: true, replaced: [], introClosed: false, visitMarked: true, saved: "pilates", urls: ["/"] });
    // Unknown values and other pages are ignored.
    assert.deepEqual(boot("tennis", "/", true, null, false, "?sport=golf").replaced, [WELCOME_PATH]);
    assert.equal(boot("tennis", "/calendar", true, null, true, "?sport=pilates").hidden, false);
  });

  test("the boot script keeps a closed dashboard introduction hidden (D-055)", () => {
    assert.equal(boot("tennis", "/").introClosed, false);
    assert.equal(boot("tennis", "/", true, "1").introClosed, true);
    assert.equal(boot("pilates", "/calendar", true, "1").introClosed, true);
  });
});
