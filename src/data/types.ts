// Shared data types. These shapes will guide the future database model.

export type Discipline = "Football" | "Basketball" | "Tennis" | "Pilates";

export type Coach = {
  name: string;
  organisation: string;
  /** How participants address the role: "Coach" by default, "Instructor" in a Pilates studio. */
  role?: "Coach" | "Instructor";
  /** What a training session is called: "session" by default, "class" in a Pilates studio. */
  sessionWord?: "session" | "class";
};

/** A recurring weekly training slot. `weekday`: 1 = Monday … 7 = Sunday. */
export type WeeklySlot = {
  weekday: number;
  /** 24-hour start time, e.g. "18:00". */
  time: string;
  durationMin: number;
};

export type Group = {
  id: string;
  name: string;
  discipline: Discipline;
  description: string;
  /** Weekly training slots. Calendar sessions are generated from them. */
  slots: WeeklySlot[];
  venue: string;
  /** Places available, e.g. the reformers in a Pilates studio or players per court booking. */
  capacity?: number;
  /** A short code for tight spaces such as month calendar cells, e.g. "U16" (D-061). */
  short?: string;
  /** A group created in the demo (D-072): its first day, "YYYY-MM-DD". No sessions are generated before it. */
  startsOn?: string;
};

/**
 * A participant's membership of one group. The same person can belong to several
 * groups: each membership is a separate entry with the same `id` and `name`.
 */
export type Participant = {
  id: string;
  groupId: string;
  name: string;
  /** Position, level or focus, depending on the discipline. */
  detail: string;
  joined: string;
  /** Parent or guardian who answers for a young member (added in the demo, D-072). */
  guardian?: string;
};

/**
 * One training session as shown in the app: a recurring session generated from the group's
 * weekly slots (with any change applied), or a one-off session.
 */
export type Session = {
  /** Stable id. Recurring: `<groupId>-<YYYY-MM-DD of its regular date>`, kept when moved. One-off: `oo-…`. */
  id: string;
  groupId: string;
  title: string;
  /** Local date, "YYYY-MM-DD". */
  date: string;
  /** 24-hour start and end times, e.g. "18:00". */
  time: string;
  endTime: string;
  place: string;
  kind: "recurring" | "one-off";
  status: "scheduled" | "cancelled";
  cancelReason?: string;
  /** Recurring session moved to another date or time: its regular date and time. */
  movedFrom?: { date: string; time: string };
  /** The place differs from the group's usual venue. */
  placeChanged?: boolean;
};

/** A change to one occurrence of a recurring session. Only the changed fields are stored. */
export type SessionOverride = {
  date?: string;
  time?: string;
  endTime?: string;
  place?: string;
  title?: string;
  cancelled?: boolean;
  cancelReason?: string;
};

/** A session that is not part of a group's weekly schedule. */
export type OneOffSession = {
  id: string;
  groupId: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  place: string;
  cancelled?: boolean;
  cancelReason?: string;
};

/**
 * Everything the coach changed in the calendar. The weekly slots stay the source of the
 * recurring sessions; this only holds exceptions (by session id) and one-off sessions.
 */
export type ScheduleChanges = {
  overrides: Record<string, SessionOverride>;
  oneOffs: OneOffSession[];
};

/** A notice from the coach, separate from chat messages. */
export type Announcement = {
  id: string;
  /** null means the announcement is for all groups. */
  groupId: string | null;
  title: string;
  body: string;
  /** `COACH_SENDER_ID` for the coach. */
  authorId: string;
  /** ISO 8601 date and time. */
  postedAt: string;
};

export type AttendanceMark = "present" | "absent";

/** Attendance taken by the coach for one session. */
export type AttendanceRecord = {
  sessionId: string;
  groupId: string;
  /** One mark per participant of the session's group. */
  marks: Record<string, AttendanceMark>;
  /** ISO 8601 date and time of the last save. */
  savedAt: string;
};

export type ExerciseDiscipline = Discipline | "General";

export type ExerciseCategory = "Warm-up" | "Technique" | "Tactics" | "Strength" | "Conditioning" | "Mobility";

/** An exercise is stored once in the coach's library and can be reused across groups. */
export type Exercise = {
  id: string;
  title: string;
  /** Short summary shown in lists. */
  description: string;
  discipline: ExerciseDiscipline;
  category: ExerciseCategory;
  durationMin: number;
  equipment: string;
  /** Base instructions, used unless an assignment overrides them. */
  instructions: string;
  /** Optional link to a YouTube or Vimeo video. We never host videos. */
  videoUrl?: string;
  /** What the exercise is for, in one sentence. */
  objective?: string;
  /** Court, pitch or studio organisation. */
  setup?: string;
  /** Typical number of players or clients, e.g. "4 per court". */
  groupSize?: string;
  /** Short cues the coach repeats while the group works. */
  coachingPoints?: string[];
  /** How to make it harder (or easier) once the group is ready. */
  progression?: string;
  /** Safety or suitability note, shown with the exercise. Never medical advice. */
  safetyNote?: string;
};

/** "This exercise, for this group" — optionally only for selected participants. */
export type Assignment = {
  id: string;
  exerciseId: string;
  groupId: string;
  audience: "group" | "selected";
  /** Only used when audience is "selected". */
  participantIds: string[];
  /** Group-specific instructions. Empty means the base instructions apply. */
  customInstructions: string;
  assignedOn: string;
};

/** A chat is either a group's chat or a one-to-one chat between the coach and a participant. */
export type Conversation =
  | { id: string; kind: "group"; groupId: string }
  | { id: string; kind: "direct"; participantId: string };

export type ChatMessage = {
  id: string;
  conversationId: string;
  /** `COACH_SENDER_ID` for the coach, otherwise a participant id. */
  senderId: string;
  body: string;
  /** ISO 8601 date and time. */
  sentAt: string;
  /** True for messages written in this demo session. They are never delivered to anyone. */
  local?: boolean;
};

/** The four parts of a session plan, in the order they are run. */
export type PlanBlock = "warm-up" | "technical" | "tactical" | "cool-down";

/** One library exercise placed in a plan. The exercise itself is never copied. */
export type PlanItem = {
  id: string;
  exerciseId: string;
  block: PlanBlock;
  durationMin: number;
  /** Instructions for this plan only. Empty means the exercise's base instructions. */
  instructions: string;
};

/**
 * A session plan. A "template" is reusable and not tied to a group; a "plan" is for one
 * group and optionally one session. Copies never change the plan they come from.
 */
export type SessionPlan = {
  id: string;
  kind: "template" | "plan";
  title: string;
  groupId: string | null;
  sessionId: string | null;
  /** The template or plan this one was copied from, if any. */
  copiedFromId: string | null;
  /** Items in order; the order within each block is the order of this list. */
  items: PlanItem[];
  updatedAt: string;
};

/** The coach's three short notes after a session ("coach memory"). One per session. */
export type CoachNote = {
  sessionId: string;
  groupId: string;
  worked: string;
  improve: string;
  revisit: string;
  savedAt: string;
};
