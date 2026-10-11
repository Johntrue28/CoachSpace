// Shared data types. These shapes will guide the future database model.

export type Discipline = "Football" | "Basketball" | "Tennis" | "Pilates";

export type Coach = {
  name: string;
  organisation: string;
};

export type Group = {
  id: string;
  name: string;
  discipline: Discipline;
  description: string;
  schedule: string;
  venue: string;
  unread: number;
};

export type Participant = {
  id: string;
  groupId: string;
  name: string;
  /** Position, level or focus, depending on the discipline. */
  detail: string;
  joined: string;
};

export type Session = {
  id: string;
  groupId: string;
  title: string;
  day: string;
  time: string;
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

export type ExerciseDiscipline = Discipline | "General";

export type ExerciseCategory = "Warm-up" | "Technique" | "Tactics" | "Strength" | "Conditioning" | "Mobility";

/** An exercise is stored once in the coach's library and can be reused across groups. */
export type Exercise = {
  id: string;
  title: string;
  discipline: ExerciseDiscipline;
  category: ExerciseCategory;
  durationMin: number;
  equipment: string;
  /** Base instructions, used unless an assignment overrides them. */
  instructions: string;
  /** Optional link to an external video (YouTube, Vimeo…). We never host videos. */
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
