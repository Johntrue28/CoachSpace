// Optional features the coach can switch on or off for the whole demo (D-042).
// Pure, no React (unit tested). The settings live in the demo store with the other coach data.

export type FeatureSettings = {
  /** Attendance tracking. Off hides every attendance entry point; saved records are kept. */
  attendanceEnabled: boolean;
};

export const DEFAULT_FEATURES: FeatureSettings = { attendanceEnabled: true };

/** Settings read from storage, with defaults for anything missing or invalid (older saves). */
export function normaliseFeatures(saved: unknown): FeatureSettings {
  const value = (saved ?? {}) as Partial<Record<keyof FeatureSettings, unknown>>;
  return {
    attendanceEnabled: typeof value.attendanceEnabled === "boolean" ? value.attendanceEnabled : DEFAULT_FEATURES.attendanceEnabled,
  };
}

/** True for the attendance pages: /attendance and a session's /calendar/<id>/attendance. */
export function isAttendancePath(path: string) {
  const pathname = path.split(/[?#]/)[0];
  return pathname === "/attendance" || pathname.startsWith("/attendance/") || /^\/calendar\/[^/]+\/attendance\/?$/.test(pathname);
}

/** Navigation items without the disabled features. */
export function visibleItems<T extends { href: string }>(items: T[], features: FeatureSettings): T[] {
  return features.attendanceEnabled ? items : items.filter((item) => !isAttendancePath(item.href));
}
