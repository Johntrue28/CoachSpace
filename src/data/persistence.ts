// Local persistence for the demo store. This is the only place that touches localStorage,
// so a future backend can replace it without changing the UI (see docs/ARCHITECTURE.md).

const STORAGE_KEY = "coachspace-demo-v1";

/**
 * Reads the saved demo data. Fields missing from older saves fall back to `seed`, so data
 * saved before a feature existed still loads. Returns null when nothing usable is saved.
 */
export function loadDemoState<T extends Record<string, unknown>>(seed: T, required: (keyof T)[]): T | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<T>;
    if (required.some((k) => parsed[k] === undefined)) return null;
    return { ...seed, ...parsed };
  } catch {
    return null;
  }
}

export function saveDemoState(state: unknown) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked). The demo still works for this visit.
  }
}

export function clearDemoState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
