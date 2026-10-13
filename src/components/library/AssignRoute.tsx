"use client";

import { useSearchParams } from "next/navigation";
import AssignForm from "./AssignForm";

/** Assign an exercise; `?group=` focuses one group. Read in the browser (D-054). */
export default function AssignRoute({ exerciseId }: { exerciseId: string }) {
  return <AssignForm exerciseId={exerciseId} focusGroupId={useSearchParams().get("group") ?? undefined} />;
}

/** The <Suspense> fallback, from the same module so it never replaces a form in use. */
export function AssignFallback({ exerciseId }: { exerciseId: string }) {
  return <AssignForm exerciseId={exerciseId} />;
}
