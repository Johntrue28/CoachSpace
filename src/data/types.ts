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

export type Announcement = {
  id: string;
  groupId: string;
  title: string;
  body: string;
  date: string;
};
