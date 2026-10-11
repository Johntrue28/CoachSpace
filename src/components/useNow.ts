"use client";

import { useEffect, useState } from "react";

/**
 * The viewer's current date and time, or null during the first render.
 * Pages are built ahead of time, so "today" is only known in the browser.
 */
export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}
