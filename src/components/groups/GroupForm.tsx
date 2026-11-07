"use client";

import { useEffect, useState } from "react";
import type { WeeklySlot } from "@/data/types";
import { useDemoStore } from "@/data/store";
import { groupById, groups, scenarioDisciplines } from "@/data/groups";
import {
  MAX_SLOTS,
  weekdayName,
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
import { sportLabel, t, type MessageKey } from "@/i18n";

/**
 * Creates a group or (with `groupId`) edits one (D-072): name, sport, weekly sessions, place and a
 * short code. Saved in this browser only; nobody is invited or told.
 */
export default function GroupForm({ groupId }: { groupId?: string }) {
  const nav = useNavigation();
  const { ready, createGroup, updateGroup } = useDemoStore();
  const existing = groupId ? groupById(groupId) : undefined;
  const disciplines = scenarioDisciplines();

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
        <BackLink fallback="/groups" fallbackLabel={t("back.groups")} />
        {ready ? <p className="mt-6 text-sm text-ink-soft">{t("groupForm.notFound")}</p> : <Loading className="mt-6" />}
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
      nav.returnTo(`/groups/${existing.id}`, t("groupForm.saved"));
    } else {
      const id = createGroup(draft);
      nav.flash(`/groups/${id}`, t("groupForm.created"));
      nav.replace(`/groups/${id}`);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
      <BackLink fallback={back} fallbackLabel={existing ? existing.name : "Groups"} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{existing ? t("groupForm.editTitle") : t("groupForm.newTitle")}</h1>

      {!loaded ? (
        <Loading className="mt-6" />
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
          <Field label={t("groupForm.name")} error={errors.name}>
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder={t("groupForm.namePlaceholder")}
              autoComplete="off"
              maxLength={60}
            />
          </Field>

          {disciplines.length > 1 ? (
            <Field label={t("groupForm.sport")} error={errors.discipline}>
              <select value={draft.discipline} onChange={(e) => set("discipline", e.target.value as GroupDraft["discipline"])} className={inputClass}>
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {t(`sport.${d}` as MessageKey)}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div>
              <p className="text-sm font-semibold">{t("groupForm.sport")}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{t("groupForm.onlySport", { sport: sportLabel(draft.discipline) })}</p>
            </div>
          )}

          <fieldset>
            <legend className="text-sm font-semibold">{t("groupForm.weekly")}</legend>
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
                      <span className="text-xs font-medium text-ink-soft">{t("groupForm.day")}</span>
                      <select
                        value={slot.weekday}
                        aria-label={t("groupForm.dayAria", { n: i + 1 })}
                        onChange={(e) => setSlot(i, { weekday: Number(e.target.value) })}
                        className={`${inputClass} mt-1 px-2`}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>
                            {weekdayName(d)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="order-3 block min-w-0 sm:order-2">
                      <span className="text-xs font-medium text-ink-soft">{t("groupForm.start")}</span>
                      <input type="time" aria-label={t("groupForm.startAria", { n: i + 1 })} value={slot.time} onChange={(e) => setSlot(i, { time: e.target.value })} className={`${inputClass} mt-1 px-2`} />
                    </label>
                    <label className="order-4 block min-w-0 sm:order-3">
                      <span className="text-xs font-medium text-ink-soft">{t("groupForm.minutes")}</span>
                      <input
                        inputMode="numeric"
                        aria-label={t("groupForm.minutesAria", { n: i + 1 })}
                        value={Number.isNaN(slot.durationMin) ? "" : String(slot.durationMin)}
                        onChange={(e) => setSlot(i, { durationMin: e.target.value === "" ? NaN : Number(e.target.value) })}
                        className={`${inputClass} mt-1 px-2`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, slots: d.slots.filter((_, j) => j !== i) }))}
                      disabled={draft.slots.length === 1}
                      aria-label={t("groupForm.removeDay", { day: weekdayName(slot.weekday) ?? t("groupForm.thisDay") })}
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
                <PlusIcon className="h-4 w-4" /> {t("groupForm.addDay")}
              </button>
            )}
            {existing && <p className="mt-1 text-xs text-ink-soft">{t("groupForm.everyWeek")}</p>}
          </fieldset>

          <Field label={t("groupForm.place")} error={errors.venue}>
            <input value={draft.venue} onChange={(e) => set("venue", e.target.value)} className={inputClass} placeholder="e.g. Court 3, Riverside Club" maxLength={80} />
          </Field>

          <Field label={t("groupForm.short")} hint={t("groupForm.shortHint")} error={errors.short}>
            <input
              value={draft.short}
              onChange={(e) => set("short", e.target.value)}
              className={`${inputClass} uppercase placeholder:normal-case`}
              placeholder={t("groupForm.shortPlaceholder")}
              autoComplete="off"
              maxLength={8}
            />
          </Field>

          <PrimaryButton>{existing ? t("groupForm.save") : t("groupForm.create")}</PrimaryButton>
          <DeviceOnlyNotice>{t("groupForm.device")}</DeviceOnlyNotice>
        </form>
      )}
    </main>
  );
}
