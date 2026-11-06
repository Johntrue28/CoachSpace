// Group management in the demo (D-072, step R7): form checks, ids, edits, members, the fictional
// invite link and QR placeholder, saved-data checks, and new groups reaching the calendar and RSVP.
import "./fixtures/use-harbour";
import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  NO_GROUP_CHANGES,
  addMember,
  applyGroupChanges,
  createGroup,
  draftFromGroup,
  editGroup,
  emptyDraft,
  groupChangesKey,
  hasErrors,
  inviteCode,
  inviteLink,
  joinedLabel,
  nextId,
  nextSlot,
  normaliseGroupChanges,
  qrPlaceholder,
  validateGroupDraft,
  validateMemberDraft,
  type GroupDraft,
} from "@/data/group-admin";
import { groupById, groups, participantsOf, scenarioDisciplines, scenarioGroups, setGroupChanges } from "@/data/groups";
import { sessionById, sessionsOn, upcomingSessions } from "@/data/calendar";
import { seededAnswers } from "@/data/rsvp";

const base = () => scenarioGroups();
const draft = (patch: Partial<GroupDraft> = {}): GroupDraft => ({
  name: "U10 Saturday",
  discipline: "Football",
  slots: [{ weekday: 6, time: "10:00", durationMin: 60 }],
  venue: "Harbour Park, Pitch 2",
  short: "U10",
  ...patch,
});
const ALL = scenarioDisciplines();

afterEach(() => setGroupChanges(NO_GROUP_CHANGES));

describe("group form checks", () => {
  test("a complete form is valid", () => {
    assert.deepEqual(validateGroupDraft(draft(), groups, ALL), {});
  });
  test("name: required, not too long, not used by another group (any case)", () => {
    assert.ok(validateGroupDraft(draft({ name: " " }), groups, ALL).name);
    assert.ok(validateGroupDraft(draft({ name: "x".repeat(41) }), groups, ALL).name);
    assert.match(validateGroupDraft(draft({ name: "u12 football" }), groups, ALL).name ?? "", /already/);
    // Editing a group may keep its own name: it is left out of `others`.
    const g1 = groupById("g1")!;
    assert.deepEqual(validateGroupDraft(draftFromGroup(g1), groups.filter((g) => g.id !== "g1"), ALL), {});
  });
  test("sport must be one of the scenario's", () => {
    assert.ok(validateGroupDraft(draft({ discipline: "Tennis" }), groups, ["Football"]).discipline);
  });
  test("weekly sessions: at least one, at most four, one per day, valid times and durations", () => {
    assert.ok(validateGroupDraft(draft({ slots: [] }), groups, ALL).slots);
    const five = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, time: "18:00", durationMin: 60 }));
    assert.ok(validateGroupDraft(draft({ slots: five }), groups, ALL).slots);
    const twice = validateGroupDraft(
      draft({ slots: [{ weekday: 2, time: "18:00", durationMin: 60 }, { weekday: 2, time: "19:00", durationMin: 60 }] }),
      groups,
      ALL,
    );
    assert.equal(twice.slot?.[0], undefined);
    assert.match(twice.slot?.[1] ?? "", /Tuesday is already/);
    assert.ok(validateGroupDraft(draft({ slots: [{ weekday: 1, time: "25:00", durationMin: 60 }] }), groups, ALL).slot?.[0]);
    assert.ok(validateGroupDraft(draft({ slots: [{ weekday: 1, time: "18:00", durationMin: 10 }] }), groups, ALL).slot?.[0]);
    assert.ok(validateGroupDraft(draft({ slots: [{ weekday: 1, time: "18:00", durationMin: NaN }] }), groups, ALL).slot?.[0]);
    assert.match(validateGroupDraft(draft({ slots: [{ weekday: 1, time: "23:30", durationMin: 60 }] }), groups, ALL).slot?.[0] ?? "", /same day/);
  });
  test("place is required; the short code is optional, letters and numbers, unique", () => {
    assert.ok(validateGroupDraft(draft({ venue: "" }), groups, ALL).venue);
    assert.deepEqual(validateGroupDraft(draft({ short: "" }), groups, ALL), {});
    assert.ok(validateGroupDraft(draft({ short: "U 10" }), groups, ALL).short);
    assert.ok(validateGroupDraft(draft({ short: "ABCDEF" }), groups, ALL).short);
    const taken = groups.find((g) => g.short)?.short;
    if (taken) assert.ok(validateGroupDraft(draft({ short: taken.toLowerCase() }), groups, ALL).short);
  });
  test("hasErrors and the empty form", () => {
    assert.equal(hasErrors({}), false);
    assert.equal(hasErrors(validateGroupDraft(emptyDraft("Football"), groups, ALL)), true);
    assert.equal(emptyDraft("Football").slots.length, 1);
  });
  test("Add a day picks the first free weekday and copies the last time", () => {
    assert.deepEqual(nextSlot([{ weekday: 1, time: "17:30", durationMin: 75 }]), { weekday: 2, time: "17:30", durationMin: 75 });
    assert.equal(nextSlot([]).weekday, 1);
  });
});

describe("ids", () => {
  test("the next id never repeats an existing one", () => {
    assert.equal(nextId("ng", ["g1", "g2"]), "ng-1");
    assert.equal(nextId("ng", ["ng-1", "ng-7", "ng-3"]), "ng-8");
    assert.equal(nextId("m", ["p01", "m-2"]), "m-3");
  });
  test("a new group's session ids point back to the group", () => {
    const { changes } = createGroup(NO_GROUP_CHANGES, draft(), { id: "ng-1", today: "2026-10-14" });
    setGroupChanges(changes);
    const s = sessionsOn("2026-10-17").find((x) => x.groupId === "ng-1");
    assert.ok(s);
    assert.equal(s.id, "ng-1-2026-10-17");
    assert.equal(sessionById(s.id)?.groupId, "ng-1");
  });
});

describe("creating and editing", () => {
  test("a created group is cleaned (trimmed, sorted days, upper-case code) and starts today", () => {
    const { group } = createGroup(
      NO_GROUP_CHANGES,
      draft({
        name: "  U10 Saturday ",
        short: "u10",
        slots: [{ weekday: 6, time: "10:00", durationMin: 60 }, { weekday: 3, time: "17:00", durationMin: 60 }],
      }),
      { id: "ng-1", today: "2026-10-14" },
    );
    assert.equal(group.name, "U10 Saturday");
    assert.equal(group.short, "U10");
    assert.deepEqual(group.slots.map((s) => s.weekday), [3, 6]);
    assert.equal(group.startsOn, "2026-10-14");
  });
  test("new groups get sessions from their first day only, in the calendar, upcoming list and RSVP", () => {
    const { changes } = createGroup(NO_GROUP_CHANGES, draft(), { id: "ng-1", today: "2026-10-14" });
    setGroupChanges(changes);
    assert.equal(sessionsOn("2026-10-10").some((s) => s.groupId === "ng-1"), false); // Saturday before
    assert.equal(sessionsOn("2026-10-17").some((s) => s.groupId === "ng-1"), true);
    const next = upcomingSessions(new Date(2026, 9, 14, 12), { groupId: "ng-1", limit: 2 });
    assert.deepEqual(next.map((s) => s.date), ["2026-10-17", "2026-10-24"]);
    // No members yet: nobody to answer.
    assert.deepEqual(seededAnswers(next[0], new Date(2026, 9, 14, 12)), {});
  });
  test("editing a scenario group stores an edit and leaves the scenario untouched", () => {
    const g1 = groupById("g1")!;
    const changes = editGroup(NO_GROUP_CHANGES, "g1", { ...draftFromGroup(g1), name: "U12 Football A", short: "" });
    assert.equal(changes.edited.g1.name, "U12 Football A");
    assert.equal("short" in changes.edited.g1, false);
    setGroupChanges(changes);
    assert.equal(groupById("g1")?.name, "U12 Football A");
    assert.equal(groupById("g1")?.short, undefined);
    assert.equal(base().groups.find((g) => g.id === "g1")?.name, g1.name);
    setGroupChanges(NO_GROUP_CHANGES);
    assert.equal(groupById("g1")?.name, g1.name);
  });
  test("editing a created group replaces it and keeps its first day", () => {
    const created = createGroup(NO_GROUP_CHANGES, draft(), { id: "ng-1", today: "2026-10-14" }).changes;
    const edited = editGroup(created, "ng-1", draft({ venue: "Harbour Park, Pitch 1", short: "" }));
    assert.equal(edited.created.length, 1);
    assert.equal(edited.created[0].venue, "Harbour Park, Pitch 1");
    assert.equal(edited.created[0].short, undefined);
    assert.equal(edited.created[0].startsOn, "2026-10-14");
    assert.deepEqual(edited.edited, {});
  });
  test("changing the weekly schedule changes the generated sessions", () => {
    const g1 = groupById("g1")!;
    const changes = editGroup(NO_GROUP_CHANGES, "g1", { ...draftFromGroup(g1), slots: [{ weekday: 7, time: "09:00", durationMin: 90 }] });
    setGroupChanges(changes);
    const sunday = sessionsOn("2026-10-18", undefined, "g1");
    assert.equal(sunday.length, 1);
    assert.equal(sunday[0].time, "09:00");
    assert.equal(sunday[0].endTime, "10:30");
  });
});

describe("members", () => {
  test("checks: a name, not already in the group; the guardian is optional", () => {
    const current = participantsOf("g1");
    assert.ok(validateMemberDraft({ name: "", guardian: "" }, current).name);
    assert.match(validateMemberDraft({ name: current[0].name.toUpperCase(), guardian: "" }, current).name ?? "", /already/);
    assert.deepEqual(validateMemberDraft({ name: "Sam Rivers", guardian: "" }, current), {});
    assert.ok(validateMemberDraft({ name: "Sam Rivers", guardian: "J" }, current).guardian);
  });
  test("an added member joins the group's roster today, with the guardian when given", () => {
    const before = participantsOf("g1").length;
    const { changes, member } = addMember(NO_GROUP_CHANGES, "g1", { name: " Sam Rivers ", guardian: "Jo Rivers" }, { id: "m-1", today: "2026-11-06" });
    assert.equal(member.name, "Sam Rivers");
    assert.equal(member.guardian, "Jo Rivers");
    assert.equal(member.joined, "Nov 2026");
    setGroupChanges(changes);
    assert.equal(participantsOf("g1").length, before + 1);
    const noGuardian = addMember(NO_GROUP_CHANGES, "g1", { name: "Ana Bell", guardian: " " }, { id: "m-2", today: "2026-11-06" }).member;
    assert.equal("guardian" in noGuardian, false);
  });
  test("members of a group that no longer exists are left out", () => {
    const changes = addMember(NO_GROUP_CHANGES, "ng-9", { name: "Sam Rivers", guardian: "" }, { id: "m-1", today: "2026-11-06" }).changes;
    const { participants } = applyGroupChanges(base().groups, base().participants, changes);
    assert.equal(participants.some((p) => p.id === "m-1"), false);
  });
  test("joined label", () => {
    assert.equal(joinedLabel("2026-01-31"), "Jan 2026");
  });
});

describe("invite link and QR placeholder", () => {
  test("the code is stable, lower case and based on the short code or name", () => {
    const g = { id: "ng-1", name: "U10 Saturday", short: "U10" };
    assert.equal(inviteCode(g), inviteCode({ ...g }));
    assert.match(inviteCode(g), /^u10-[a-z2-9]{4}$/);
    assert.match(inviteCode({ id: "x", name: "Ladies' Social!" }), /^ladies-[a-z2-9]{4}$/);
    assert.notEqual(inviteCode(g), inviteCode({ ...g, id: "ng-2" }));
    assert.equal(inviteLink(g), `https://coachspace.app/join/${inviteCode(g)}`);
  });
  test("the QR placeholder is stable, square and has the three corner markers", () => {
    const a = qrPlaceholder("https://coachspace.app/join/u10-abcd");
    assert.deepEqual(a, qrPlaceholder("https://coachspace.app/join/u10-abcd"));
    assert.equal(a.length, 21);
    assert.ok(a.every((row) => row.length === 21));
    for (const [r, c] of [[0, 0], [0, 14], [14, 0]]) {
      assert.equal(a[r][c], true); // outer ring
      assert.equal(a[r + 1][c + 1], false); // light ring
      assert.equal(a[r + 3][c + 3], true); // centre
    }
    assert.notDeepEqual(a, qrPlaceholder("https://coachspace.app/join/u12-wxyz"));
  });
});

describe("saved group changes", () => {
  test("unusable values give no changes", () => {
    assert.deepEqual(normaliseGroupChanges(undefined), NO_GROUP_CHANGES);
    assert.deepEqual(normaliseGroupChanges("x"), NO_GROUP_CHANGES);
    assert.deepEqual(normaliseGroupChanges({ created: 3, edited: [], members: null }), NO_GROUP_CHANGES);
  });
  test("malformed entries are left out, well-formed ones kept", () => {
    const good = createGroup(NO_GROUP_CHANGES, draft(), { id: "ng-1", today: "2026-10-14" }).changes;
    const withMember = addMember(good, "ng-1", { name: "Sam Rivers", guardian: "" }, { id: "m-1", today: "2026-10-14" }).changes;
    const saved = JSON.parse(JSON.stringify(withMember));
    saved.created.push({ id: "ng-2", name: "Broken", slots: [] });
    saved.members.push({ id: "m-2", name: 4 });
    saved.edited.g1 = { name: "No slots", discipline: "Football", slots: [{ weekday: 1, time: "6pm", durationMin: 60 }], venue: "x" };
    assert.deepEqual(normaliseGroupChanges(saved), withMember);
  });
  test("the changes key is stable and changes with the changes", () => {
    assert.equal(groupChangesKey(NO_GROUP_CHANGES), "scenario");
    const a = createGroup(NO_GROUP_CHANGES, draft(), { id: "ng-1", today: "2026-10-14" }).changes;
    assert.equal(groupChangesKey(a), groupChangesKey(JSON.parse(JSON.stringify(a))));
    assert.notEqual(groupChangesKey(a), groupChangesKey(editGroup(a, "ng-1", draft({ venue: "Elsewhere" }))));
  });
});

describe("wording", () => {
  test("one participant, several participants", async () => {
    const { participantsLabel } = await import("@/data/groups");
    assert.equal(participantsLabel(1), "1 participant");
    assert.equal(participantsLabel(0), "0 participants");
    assert.equal(participantsLabel(6), "6 participants");
  });
});
