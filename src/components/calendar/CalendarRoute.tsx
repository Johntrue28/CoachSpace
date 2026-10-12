"use client";

import { useSearchParams } from "next/navigation";
import CalendarView from "./CalendarView";
import { DEMO_PARTICIPANT_ID, groupIdsOf } from "@/data/groups";

type Query = { date?: string; week?: string; view?: string; group?: string };

/**
 * The coach's or the participant's calendar page. Reads the URL in the browser, so the page
 * itself can be built in advance and opens without waiting for the server (D-054).
 */
export function CalendarScreen({ participant = false, query = {} }: { participant?: boolean; query?: Query }) {
  const { date, week, view, group } = query;
  // ?week= alone (older links) opens the week view.
  const mode = view === "week" || (week && view !== "month") ? "week" : "month";
  if (participant) {
    return (
      <CalendarView
        date={date}
        week={week}
        view={mode}
        groupIds={groupIdsOf(DEMO_PARTICIPANT_ID)}
        basePath="/me/calendar"
        title="My calendar"
        subtitle="Training sessions for your groups."
      />
    );
  }
  return <CalendarView date={date} week={week} view={mode} groupFilter={group} canManage />;
}

export default function CalendarRoute({ participant = false }: { participant?: boolean }) {
  const params = useSearchParams();
  const get = (k: keyof Query) => params.get(k) ?? undefined;
  return <CalendarScreen participant={participant} query={{ date: get("date"), week: get("week"), view: get("view"), group: get("group") }} />;
}
