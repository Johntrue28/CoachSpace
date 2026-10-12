"use client";

import { useSearchParams } from "next/navigation";
import SessionForm from "./SessionForm";

/** New session, on the date from `?date=`, read in the browser (D-054). */
export default function NewSessionRoute() {
  return <SessionForm defaultDate={useSearchParams().get("date") ?? undefined} />;
}
