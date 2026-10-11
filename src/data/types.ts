// Shared data types. These shapes will guide the future database model.

export type Discipline = "Football" | "Basketball" | "Tennis" | "Pilates";

export type Coach = {
  name: string;
  organisation: string;
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
  unread: number;
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
};

/** One training session of a group on a given date. */
export type Session = {
  /** Stable id: `<groupId>-<YYYY-MM-DD>`. */
  id: string;
  groupId: string;
  title: string;
  /** Local date, "YYYY-MM-DD". */
  date: string;
  /** 24-hour start and end times, e.g. "18:00". */
  time: string;
  endTime: string;
  place: string;
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
