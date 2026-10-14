// Demo scenarios (D-053): one CoachSpace application, four sets of fictional data.
// A scenario only supplies data; every page, component and rule is shared.
import type {
  Announcement,
  Assignment,
  ChatMessage,
  CoachNote,
  Coach,
  Conversation,
  Discipline,
  Exercise,
  ExerciseDiscipline,
  Group,
  Participant,
  PlanBlock,
  SessionPlan,
} from "../types";
import type { ReadState } from "../unread";

export const SCENARIO_IDS = ["tennis", "football", "basketball", "pilates"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];
export const DEFAULT_SCENARIO: ScenarioId = "tennis";

export function isScenarioId(value: unknown): value is ScenarioId {
  return typeof value === "string" && (SCENARIO_IDS as readonly string[]).includes(value);
}

/** The demo user is always the coach: author of announcements and "you" in the chat. */
export const COACH_SENDER_ID = "coach";

/** Session topics of a group, used in rotation from the session on `from`. */
export type TopicRotation = { from: string; list: string[] };

/** Everything that differs between scenarios. Ids only need to be unique within a scenario. */
export type ScenarioData = {
  id: ScenarioId;
  coach: Coach;
  /** The fictional participant shown in the participant view. Belongs to two groups. */
  demoParticipantId: string;
  /** Sport filters offered in the Exercise Library, "General" first. */
  disciplines: ExerciseDiscipline[];
  groups: Group[];
  participants: Participant[];
  sessionTopics: Record<string, TopicRotation>;
  exercises: Exercise[];
  assignments: Assignment[];
  announcements: Announcement[];
  conversations: Conversation[];
  chatMessages: ChatMessage[];
  readState: ReadState;
  plans: SessionPlan[];
  notes: CoachNote[];
  /** Names of the four plan blocks when the sport uses other words (e.g. Pilates). */
  planBlockLabels?: Partial<Record<PlanBlock, string>>;
  /** Share of participants marked present in the seeded attendance history (0–1). */
  attendanceRate: number;
  /**
   * Session plans prepared in advance (D-058): each template is copied into a plan for the group's
   * next session, in the browser, so the coach and the participant both have a plan to look at.
   */
  sessionPlanSeeds?: { groupId: string; templateId: string }[];
};

/** What the Demo Studio shows about a scenario before its data is loaded. */
export type ScenarioProfile = {
  id: ScenarioId;
  /** "Tennis Coaching" */
  name: string;
  sport: Discipline;
  organisation: string;
  coachName: string;
  /** Who this scenario is for. */
  audience: string;
  /** One sentence for the welcome screen: what the visitor will explore. */
  summary: string;
  /** Examples of groups or classes, as shown on the card. */
  groupExamples: string[];
  /** What to show a prospective customer with this scenario. */
  showcases: string[];
  /** Describes the cover illustration for screen readers. */
  coverAlt: string;
};
