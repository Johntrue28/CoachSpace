"use client";

// "Are you coming?" answers bound to the demo store (D-071), so the coach's agenda, the session page,
// the register and the participant view all read the same answers.

import { useMemo } from "react";
import type { Session } from "./types";
import { useDemoStore } from "./store";
import { useNow } from "@/components/useNow";
import { DEMO_PARTICIPANT_ID } from "./groups";
import { activeScenario } from "./scenario";
import { answersFor, seededAnswers, summarise, type RsvpAnswer } from "./rsvp";

export function useRsvp() {
  const { rsvp, rsvpReminders, ready, setRsvp, markReminded } = useDemoStore();
  const now = useNow();
  return useMemo(() => {
    const goingRate = Math.min(0.9, Math.max(0.6, activeScenario().attendanceRate));
    const answers = (s: Session) =>
      now ? answersFor(seededAnswers(s, now, { selfId: DEMO_PARTICIPANT_ID, goingRate }), rsvp, s) : {};
    return {
      /** False until saved answers and the current time are known (both only in the browser). */
      ready: ready && now !== null,
      answers,
      summary: (s: Session) => summarise(answers(s), s.groupId),
      answerOf: (s: Session, participantId: string): RsvpAnswer | undefined => answers(s)[participantId],
      set: setRsvp,
      remindedAt: (sessionId: string): string | undefined => rsvpReminders[sessionId],
      remind: markReminded,
    };
  }, [rsvp, rsvpReminders, ready, now, setRsvp, markReminded]);
}
