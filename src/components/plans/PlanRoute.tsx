"use client";

import { useSearchParams } from "next/navigation";
import PlanEditor from "./PlanEditor";

/** A session plan; `?from=session` when it was opened from a session. Read in the browser (D-054). */
export default function PlanRoute({ planId }: { planId: string }) {
  // Keyed by id so moving from one plan to its copy starts a fresh editor.
  return <PlanEditor key={planId} planId={planId} fromSession={useSearchParams().get("from") === "session"} />;
}
