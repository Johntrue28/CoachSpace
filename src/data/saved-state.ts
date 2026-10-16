// Checks the shape of demo data read back from this browser (D-069). Pure functions, no React.
//
// What is saved can come from an older version of the demo or be edited by hand. Anything that does
// not have the shape the pages expect is dropped: a whole field falls back to the scenario's seed, and
// a malformed entry in a list is left out. So a saved value can make the demo forget a change, but it
// can never break a page.

type Entry = Record<string, unknown>;

const isEntry = (v: unknown): v is Entry => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStringOrNull = (v: unknown) => v === null || isString(v);
const isStringList = (v: unknown) => Array.isArray(v) && v.every(isString);
const optional = (v: unknown, check: (x: unknown) => boolean) => v === undefined || check(v);

/** The list if it is one, keeping only well-formed entries; otherwise the fallback. */
function list<T>(value: unknown, fallback: T[], wellFormed: (e: Entry) => boolean): T[] {
  return Array.isArray(value) ? (value.filter((e) => isEntry(e) && wellFormed(e)) as T[]) : fallback;
}

const exercise = (e: Entry) =>
  isString(e.id) &&
  isString(e.title) &&
  optional(e.description, isString) &&
  isString(e.discipline) &&
  isString(e.category) &&
  isNumber(e.durationMin) &&
  optional(e.equipment, isString) &&
  optional(e.instructions, isString) &&
  optional(e.videoUrl, isString) &&
  optional(e.coachingPoints, isStringList);

const assignment = (e: Entry) =>
  isString(e.id) &&
  isString(e.exerciseId) &&
  isString(e.groupId) &&
  (e.audience === "group" || e.audience === "selected") &&
  isStringList(e.participantIds) &&
  isString(e.customInstructions) &&
  isString(e.assignedOn);

const announcement = (e: Entry) =>
  isString(e.id) && isStringOrNull(e.groupId) && isString(e.title) && isString(e.body) && isString(e.postedAt) && !Number.isNaN(Date.parse(e.postedAt));

const attendance = (e: Entry) =>
  isString(e.sessionId) &&
  isString(e.groupId) &&
  isEntry(e.marks) &&
  Object.values(e.marks).every((m) => m === "present" || m === "absent") &&
  isString(e.savedAt);

const planItem = (e: unknown) =>
  isEntry(e) && isString(e.id) && isString(e.exerciseId) && isString(e.block) && isNumber(e.durationMin) && isString(e.instructions);

const plan = (e: Entry) =>
  isString(e.id) &&
  (e.kind === "template" || e.kind === "plan") &&
  isString(e.title) &&
  isStringOrNull(e.groupId) &&
  isStringOrNull(e.sessionId) &&
  optional(e.copiedFromId, isStringOrNull) &&
  Array.isArray(e.items) &&
  e.items.every(planItem) &&
  isString(e.updatedAt);

const note = (e: Entry) =>
  isString(e.sessionId) && isString(e.groupId) && isString(e.worked) && isString(e.improve) && isString(e.revisit) && isString(e.savedAt);

const override = (v: unknown) =>
  isEntry(v) &&
  optional(v.date, isString) &&
  optional(v.time, isString) &&
  optional(v.endTime, isString) &&
  optional(v.place, isString) &&
  optional(v.title, isString) &&
  optional(v.cancelled, (x) => typeof x === "boolean") &&
  optional(v.cancelReason, isString);

const oneOff = (e: Entry) =>
  isString(e.id) && isString(e.groupId) && isString(e.title) && isString(e.date) && isString(e.time) && isString(e.endTime) && isString(e.place);

/** Calendar changes: overrides keyed by session id and one-off sessions. */
function schedule<T>(value: unknown, fallback: T): T {
  if (!isEntry(value) || !isEntry(value.overrides) || !Array.isArray(value.oneOffs)) return fallback;
  return {
    overrides: Object.fromEntries(Object.entries(value.overrides).filter(([, o]) => override(o))),
    oneOffs: list(value.oneOffs, [], oneOff),
  } as T;
}

type Checked = {
  exercises: unknown[];
  assignments: unknown[];
  announcements: unknown[];
  attendance: unknown[];
  schedule: unknown;
  plans: unknown[];
  notes: unknown[];
};

/**
 * `saved` with every field checked against the shape the pages expect. Fields that are missing or
 * malformed come from `seed`; other fields of `saved` (settings) are passed through for their own checks.
 */
export function checkSavedState<S extends Checked>(saved: Record<string, unknown>, seed: S): S {
  return {
    ...seed,
    ...saved,
    exercises: list(saved.exercises, seed.exercises, exercise),
    assignments: list(saved.assignments, seed.assignments, assignment),
    announcements: list(saved.announcements, seed.announcements, announcement),
    attendance: list(saved.attendance, seed.attendance, attendance),
    schedule: schedule(saved.schedule, seed.schedule),
    plans: list(saved.plans, seed.plans, plan),
    notes: list(saved.notes, seed.notes, note),
  };
}
