"use client";

import { useSearchParams } from "next/navigation";
import { groupById } from "@/data/groups";
import LibraryView from "./LibraryView";

/** The Library; `?group=` when it was opened to assign an exercise to that group. Read in the browser (D-054). */
export default function LibraryRoute() {
  const group = useSearchParams().get("group");
  return <LibraryView assignTo={group && groupById(group) ? group : undefined} />;
}
