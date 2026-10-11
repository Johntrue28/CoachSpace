# CoachSpace — Implementation Prompts

> This document holds the prompts used to continue Phase 1 (Interactive Demo), one pull request per feature. The current phase is recorded only in [`ROADMAP.md`](ROADMAP.md) (D-015).
>
> **Missing content:** the original prompt texts were not available when this file was created. Each prompt section below is a placeholder marked `NOT AVAILABLE`. The owner must paste the original text before that prompt is used. Do not write or reconstruct a prompt from memory.

## 1. Before Running Any Prompt

Some features already exist. Before executing a prompt:

1. Check the current state of the code in `src/` and the status in `docs/ROADMAP.md`.
2. Reuse existing features, components, data and patterns instead of rebuilding them.
3. If a prompt asks for something that already exists, extend or adjust it; do not duplicate it.
4. If a prompt conflicts with the code or with the documentation, explain the conflict to the owner before making changes.

### Already implemented

| Feature | Status | Where |
|---|---|---|
| Groups & Participants | Implemented (PR #4) | `/groups`, `/groups/[id]`, `src/components/ParticipantList.tsx`, `src/data/groups.ts` |
| Exercise library | Implemented (PR #5) | `/library`, `/library/new`, `/library/[id]`, `/library/[id]/assign`, `src/components/library/`, `src/data/exercises.ts`, `src/data/store.tsx` |

The exercise library already supports: one shared library per coach, search and discipline filters, creating exercises, optional external video links (no video hosting, D-009), assigning an exercise to several groups with group-specific instructions, and assigning to the whole group or to selected participants. `/videos` redirects to `/library`.

## 2. General Instructions for Every PR

> **NOT AVAILABLE:** the original general instructions were not provided. Paste them here.

Until they are added, the rules in [`CLAUDE.md`](../CLAUDE.md) apply to every PR (this is a reference, not a copy of the missing instructions): one small task per branch, fictional data only, no backend, every control working or marked `Coming soon`, simulated behaviour shown honestly, `npm run check` before finishing, and a Spanish summary at the end.

## 3. Implementation Order

Chat is the next new feature.

| Order | Feature | Status |
|---|---|---|
| 1 | Chat | Next — not started (`/chat` shows `Coming soon`) |
| 2 | Announcements | Not started as a dedicated feature (read-only announcements are shown on the dashboard and group detail) |
| 3 | Calendar | Not started (`/calendar` shows `Coming soon`; read-only sessions appear on the dashboard and group detail) |
| 4 | Attendance | Not started |
| 5 | Videos & Exercises | Largely covered by the existing exercise library; use the prompt only for gaps |
| 6 | Participant View | Not started |

Groups & Participants and the exercise library are not listed as pending because they are already implemented.

## 4. Local Persistence Decision (D-023)

This decision is consistent with the current code (checked against `src/data/store.tsx` and `src/components/DeviceOnlyNotice.tsx`):

- Created exercises and their assignments are saved in the browser's `localStorage` (key `coachspace-demo-v1`), through `DemoStoreProvider` / `useDemoStore()`.
- Screens where the coach creates or edits data show the "saved on this device only" notice (`DeviceOnlyNotice`). Current text: "Demo: changes are saved on this device only. Nothing is sent to participants yet."
- A `Reset demo data` action on `/library` restores the fictional seed data.
- Nothing is sent to a server or to other users. Do not describe this data as shared or stored in the cloud.

New features that let the coach change data (for example, chat messages or attendance) should reuse the same demo store, notice and reset action, unless the owner approves a different approach.

## 5. Prompts

### 5.1 Chat

> **NOT AVAILABLE:** paste the original Chat prompt here.

### 5.2 Announcements

> **NOT AVAILABLE:** paste the original Announcements prompt here.

### 5.3 Calendar

> **NOT AVAILABLE:** paste the original Calendar prompt here.

### 5.4 Attendance

> **NOT AVAILABLE:** paste the original Attendance prompt here.

### 5.5 Videos & Exercises

> **NOT AVAILABLE:** paste the original Videos & Exercises prompt here. Check it against the existing exercise library before running it (see section 1).

### 5.6 Participant View

> **NOT AVAILABLE:** paste the original Participant View prompt here.
