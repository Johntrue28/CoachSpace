"use client";

import { useSearchParams } from "next/navigation";
import CalendarView from "./CalendarView";

/** The coach's Calendar page. Reads `?date=` and `?group=` in the browser, so the page is built in advance (D-054). */
export default function CalendarRoute() {
  const params = useSearchParams();
  return <CalendarView date={params.get("date") ?? undefined} groupFilter={params.get("group") ?? undefined} />;
}
