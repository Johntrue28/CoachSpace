// Calendar changes made by the coach (D-031).
//
// The weekly slots of each group stay the only source of recurring sessions. Changes are
// stored separately: one override per changed occurrence (keyed by its stable session id)
// and a list of one-off sessions. These functions are pure: they take the current changes
// and return new ones, so the store, the tests and a future backend can share them.

import type { OneOffSession, ScheduleChanges, SessionOverride } from "./types";
import { addMinutes, isDateKey, isOneOffId, minutesBetween, regularSession } from "./calendar";
import { groupById } from "./groups";
import { t } from "@/i18n";

export type SessionInput = {
  groupId: string;
  title: string;
  date: string;
  time: string;
  durationMin: number;
  place: string;
};

export type SessionInputErrors = Partial<Record<keyof SessionInput, string>>;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Checks a session form. Returns an empty object when everything is valid. */
export function validateSessionInput(input: SessionInput): SessionInputErrors {
  const errors: SessionInputErrors = {};
  if (!groupById(input.groupId)) errors.groupId = t("form.errorGroup");
  if (!input.title.trim()) errors.title = t("form.errorTitle");
  if (!isDateKey(input.date)) errors.date = t("form.errorDate");
  if (!TIME.test(input.time)) errors.time = t("form.errorTime");
  if (!Number.isInteger(input.durationMin) || input.durationMin < 15 || input.durationMin > 240) {
    errors.durationMin = t("form.errorDuration");
  } else if (TIME.test(input.time) && minutesBetween(input.time, addMinutes(input.time, input.durationMin)) <= 0) {
    errors.durationMin = t("form.errorSameDay");
  }
  if (!input.place.trim()) errors.place = t("form.errorPlace");
  return errors;
}

/** Adds a one-off session. `id` must start with "oo-". */
export function createOneOff(changes: ScheduleChanges, input: SessionInput, id: string) {
  if (!isOneOffId(id)) throw new Error("One-off session ids start with 'oo-'.");
  const session: OneOffSession = {
    id,
    groupId: input.groupId,
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    endTime: addMinutes(input.time, input.durationMin),
    place: input.place.trim(),
  };
  return { changes: { ...changes, oneOffs: [...changes.oneOffs, session] }, session };
}

export type SessionPatch = Partial<Pick<SessionInput, "title" | "date" | "time" | "durationMin" | "place">>;

function setOverride(changes: ScheduleChanges, id: string, next: SessionOverride): ScheduleChanges {
  const overrides = { ...changes.overrides };
  const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)) as SessionOverride;
  if (Object.keys(clean).length === 0) delete overrides[id];
  else overrides[id] = clean;
  return { ...changes, overrides };
}

/**
 * Changes one session: reschedule (date, time, duration), change its place or title.
 * For a recurring session only the fields that differ from the weekly schedule are stored,
 * so the schedule itself is never modified.
 */
export function updateSession(changes: ScheduleChanges, id: string, patch: SessionPatch): ScheduleChanges {
  if (isOneOffId(id)) {
    return {
      ...changes,
      oneOffs: changes.oneOffs.map((o) => {
        if (o.id !== id) return o;
        const time = patch.time ?? o.time;
        const duration = patch.durationMin ?? minutesBetween(o.time, o.endTime);
        return {
          ...o,
          title: patch.title?.trim() ?? o.title,
          date: patch.date ?? o.date,
          time,
          endTime: addMinutes(time, duration),
          place: patch.place?.trim() ?? o.place,
        };
      }),
    };
  }
  const base = regularSession(id);
  if (!base) return changes;
  const current = changes.overrides[id] ?? {};
  const time = patch.time ?? current.time ?? base.time;
  const duration = patch.durationMin ?? minutesBetween(current.time ?? base.time, current.endTime ?? base.endTime);
  const endTime = addMinutes(time, duration);
  const date = patch.date ?? current.date ?? base.date;
  const place = patch.place?.trim() ?? current.place ?? base.place;
  const title = patch.title?.trim() ?? current.title ?? base.title;
  return setOverride(changes, id, {
    ...current,
    date: date !== base.date ? date : undefined,
    time: time !== base.time ? time : undefined,
    endTime: endTime !== base.endTime ? endTime : undefined,
    place: place !== base.place ? place : undefined,
    title: title !== base.title ? title : undefined,
  });
}

/** Cancels one session. The weekly schedule and every other session stay as they are. */
export function cancelSession(changes: ScheduleChanges, id: string, reason = ""): ScheduleChanges {
  const cancelReason = reason.trim() || undefined;
  if (isOneOffId(id)) {
    return { ...changes, oneOffs: changes.oneOffs.map((o) => (o.id === id ? { ...o, cancelled: true, cancelReason } : o)) };
  }
  if (!regularSession(id)) return changes;
  return setOverride(changes, id, { ...changes.overrides[id], cancelled: true, cancelReason });
}

/** Undoes a cancellation. */
export function restoreSession(changes: ScheduleChanges, id: string): ScheduleChanges {
  if (isOneOffId(id)) {
    return {
      ...changes,
      oneOffs: changes.oneOffs.map((o) => (o.id === id ? { ...o, cancelled: undefined, cancelReason: undefined } : o)),
    };
  }
  if (!changes.overrides[id]) return changes;
  return setOverride(changes, id, { ...changes.overrides[id], cancelled: undefined, cancelReason: undefined });
}

/** Puts a recurring session back to its regular date, time and place. */
export function resetToSchedule(changes: ScheduleChanges, id: string): ScheduleChanges {
  if (isOneOffId(id) || !changes.overrides[id]) return changes;
  return setOverride(changes, id, {});
}
