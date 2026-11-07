"use client";

import { useEffect, useState } from "react";
import type { WeeklySlot } from "@/data/types";
import { useDemoStore } from "@/data/store";
import { groupById, groups, scenarioDisciplines, sessionWords } from "@/data/groups";
import {
  MAX_SLOTS,
  WEEKDAY_NAMES,
  draftFromGroup,
  emptyDraft,
  hasErrors,
  nextSlot,
  validateGroupDraft,
  type GroupDraft,
  type GroupDraftErrors,
} from "@/data/group-admin";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";
import { CloseIcon, PlusIcon } from "@/components/Icons";
import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Loading } from "@/components/ui/EmptyState";

/**
 * Creates a group or (with `groupId`) edits one (D-072): name, sport, weekly sessions, place and a
 * short code. Saved in this browser only; nobody is invited or told.
 */
export default function GroupForm({ groupId }: { groupId?: string }) {
  const nav = useNavigation();
  const { ready, createGroup, updateGroup } = useDemoStore();
  const existing = groupId ? groupById(groupId) : undefined;
  const disciplines = scenarioDisciplines();
  const words = sessionWords();

  const [draft, setDraft] = useState<GroupDraft>(() => (existing ? draftFromGroup(existing) : emptyDraft(disciplines[0])));
  const [errors, setErrors] = useState<GroupDraftErrors>({});
  const [loaded, setLoaded] = useState(!groupId || Boolean(existing));

  // Opened directly: the group is known once the saved changes have been read.
  useEffect(() => {
    if (loaded || !ready || !existing) return;
    setDraft(draftFromGroup(existing));
    setLoaded(true);
  }, [loaded, ready, existing]);

  const back = existing ? `/groups/${existing.id}` : "/groups";

  if (groupId && !existing) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
        <BackLink fallback="/groups" fallbackLabel="Groups" />
        {ready ? <p className="mt-6 text-sm text-ink-soft">This group was not found in this demo.</p> : <Loading className="mt-6" />}
      </main>
    );
  }

  const set = <K extends keyof GroupDraft>(key: K, value: GroupDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setSlot = (i: number, patch: Partial<WeeklySlot>) =>
    setDraft((d) => ({ ...d, slots: d.slots.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const others = groups.filter((g) => g.id !== groupId);
    const next = validateGroupDraft(draft, others, disciplines);
    setErrors(next);
    if (hasErrors(next)) return;
    if (existing) {
      updateGroup(existing.id, draft);
      nav.returnTo(`/groups/${existing.id}`, "Group saved in this browser only. Members have not been told (demo).");
    } else {
      const id = createGroup(draft);
      nav.flash(`/groups/${id}`, "Group created in this browser only. Add members or use Invite to see how joining would work (demo).");
      nav.replace(`/groups/${id}`);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
      <BackLink fallback={back} fallbackLabel={existing ? existing.name : "Groups"} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{existing ? "Edit group" : "New group"}</h1>

      {!loaded ? (
        <Loading className="mt-6" />
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
          <Field label="Group name" error={errors.name}>
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. U12 Saturday group"
              autoComplete="off"
              maxLength={60}
            />
          </Field>

          {disciplines.length > 1 ? (
            <Field label="Sport" error={errors.discipline}>
              <select value={draft.discipline} onChange={(e) => set("discipline", e.target.value as GroupDraft["discipline"])} className={inputClass}>
                {disciplines.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          ) : (
            <div>
              <p className="text-sm font-semibold">Sport</p>
              <p className="mt-1.5 text-sm text-ink-soft">{draft.discipline} — the sport of this example</p>
            </div>
          )}

          <fieldset>
            <legend className="text-sm font-semibold">Weekly {words.many}</legend>
            {errors.slots && (
              <p role="alert" className="mt-1 text-xs font-semibold text-danger">
                {errors.slots}
              </p>
            )}
            <ul className="mt-2 divide-y divide-line rounded-card bg-card ring-1 ring-line">
              {draft.slots.map((slot, i) => (
                <li key={i} className="p-3">
                  {/* Phones: the day and Remove on one line, start and minutes below; one line from 640 px. */}
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-end gap-2 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_2.75rem]">
                    <label className="order-1 col-span-2 block min-w-0 sm:col-span-1">
                      <span className="text-xs font-medium text-ink-soft">Day</span>
                      <select
                        value={slot.weekday}
                        aria-label={`Day, ${words.one} ${i + 1}`}
                        onChange={(e) => setSlot(i, { weekday: Number(e.target.value) })}
                        className={`${inputClass} mt-1 px-2`}
                      >
                        {WEEKDAY_NAMES.map((name, d) => (
                          <option key={name} value={d + 1}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="order-3 block min-w-0 sm:order-2">
                      <span className="text-xs font-medium text-ink-soft">Start</span>
                      <input type="time" aria-label={`Start time, ${words.one} ${i + 1}`} value={slot.time} onChange={(e) => setSlot(i, { time: e.target.value })} className={`${inputClass} mt-1 px-2`} />
                    </label>
                    <label className="order-4 block min-w-0 sm:order-3">
                      <span className="text-xs font-medium text-ink-soft">Minutes</span>
                      <input
                        inputMode="numeric"
                        aria-label={`Minutes, ${words.one} ${i + 1}`}
                        value={Number.isNaN(slot.durationMin) ? "" : String(slot.durationMin)}
                        onChange={(e) => setSlot(i, { durationMin: e.target.value === "" ? NaN : Number(e.target.value) })}
                        className={`${inputClass} mt-1 px-2`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, slots: d.slots.filter((_, j) => j !== i) }))}
                      disabled={draft.slots.length === 1}
                      aria-label={`Remove ${WEEKDAY_NAMES[slot.weekday - 1] ?? "this day"}`}
                      className="order-2 grid h-11 w-11 place-items-center rounded-control text-ink-soft hover:bg-surface disabled:opacity-30 sm:order-4"
                    >
                      <CloseIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {errors.slot?.[i] && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger">
                      {errors.slot[i]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {draft.slots.length < MAX_SLOTS && (
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, slots: [...d.slots, nextSlot(d.slots)] }))}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft"
              >
                <PlusIcon className="h-4 w-4" /> Add a day
              </button>
            )}
            {existing && <p className="mt-1 text-xs text-ink-soft">In this demo the new schedule is used for every week in the calendar.</p>}
          </fieldset>

          <Field label="Place" error={errors.venue}>
            <input value={draft.venue} onChange={(e) => set("venue", e.target.value)} className={inputClass} placeholder="e.g. Court 3, Riverside Club" maxLength={80} />
          </Field>

          <Field label="Short code (optional)" hint="Shown where space is tight, such as the month calendar. Up to 5 letters or numbers." error={errors.short}>
            <input
              value={draft.short}
              onChange={(e) => set("short", e.target.value)}
              className={`${inputClass} uppercase placeholder:normal-case`}
              placeholder="e.g. U12"
              autoComplete="off"
              maxLength={8}
            />
          </Field>

          <PrimaryButton>{existing ? "Save changes" : "Create group"}</PrimaryButton>
          <DeviceOnlyNotice>the group is saved in this browser only. Nobody is invited or told.</DeviceOnlyNotice>
        </form>
      )}
    </main>
  );
}
