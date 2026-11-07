"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/data/store";
import { useSessions } from "@/data/use-sessions";
import { isDateKey, minutesBetween, regularSession } from "@/data/calendar";
import { validateSessionInput, type SessionInput, type SessionInputErrors } from "@/data/schedule";
import { groupById, groups } from "@/data/groups";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import { formatDateKey } from "@/components/format";
import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Loading } from "@/components/ui/EmptyState";
import { t } from "@/i18n";

/**
 * Creates a one-off session, or (with `sessionId`) reschedules or changes one session.
 * Changing a recurring session never changes the group's weekly schedule.
 */
export default function SessionForm({ sessionId, defaultDate }: { sessionId?: string; defaultDate?: string }) {
  const nav = useNavigation();
  const { createSession, updateSession, resetSessionToSchedule } = useDemoStore();
  const { ready, byId } = useSessions();
  const existing = sessionId ? byId(sessionId) : undefined;
  const regular = sessionId ? regularSession(sessionId) : undefined;

  const [form, setForm] = useState<SessionInput>({
    groupId: groups[0].id,
    title: "",
    date: isDateKey(defaultDate) ? defaultDate : "",
    time: "18:00",
    durationMin: 60,
    place: groups[0].venue,
  });
  const [errors, setErrors] = useState<SessionInputErrors>({});
  const [loaded, setLoaded] = useState(!sessionId);

  // When editing, start from the session as it is now (with earlier changes).
  useEffect(() => {
    if (loaded || !ready || !existing) return;
    setForm({
      groupId: existing.groupId,
      title: existing.title,
      date: existing.date,
      time: existing.time,
      durationMin: minutesBetween(existing.time, existing.endTime),
      place: existing.place,
    });
    setLoaded(true);
  }, [loaded, ready, existing]);

  if (!ready || (sessionId && !existing)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 pt-8">
        <p className="text-sm text-ink-soft">{ready ? t("session.notFound") : t("common.loading")}</p>
      </main>
    );
  }

  const set = <K extends keyof SessionInput>(key: K, value: SessionInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  function chooseGroup(groupId: string) {
    // Suggest the group's usual venue when the place was not changed by hand.
    setForm((f) => ({
      ...f,
      groupId,
      place: f.place === groupById(f.groupId)?.venue ? (groupById(groupId)?.venue ?? f.place) : f.place,
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateSessionInput(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (existing) {
      updateSession(existing.id, {
        title: form.title,
        date: form.date,
        time: form.time,
        durationMin: form.durationMin,
        place: form.place,
      });
      nav.returnTo(`/calendar/${existing.id}`, t("form.sessionChanged"));
    } else {
      const id = createSession(form);
      nav.flash(`/calendar/${id}`, t("form.sessionAdded"));
      nav.replace(`/calendar/${id}`);
    }
  }

  const back = existing ? `/calendar/${existing.id}` : "/calendar";
  const changed =
    existing?.kind === "recurring" &&
    regular !== undefined &&
    (["date", "time", "endTime", "place", "title"] as const).some((k) => existing[k] !== regular[k]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback={back} fallbackLabel={existing ? t("back.session") : t("back.calendar")} />
      <h1 className="mt-4 text-2xl font-bold">{existing ? t("form.sessionChangeTitle") : t("form.sessionNewTitle")}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {existing?.kind === "recurring"
          ? t("form.sessionOnlyThis", { when: regular ? `${formatDateKey(regular.date)}, ${regular.time}` : "" })
          : existing
            ? t("form.sessionIsExtra")
            : t("form.sessionNewHint")}
      </p>

      {!loaded ? (
        <Loading className="mt-6" />
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <Field label={t("form.group")} error={errors.groupId}>
            <select
              value={form.groupId}
              onChange={(e) => chooseGroup(e.target.value)}
              disabled={Boolean(existing)}
              className={`${inputClass} disabled:opacity-60`}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("form.title")} error={errors.title}>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} placeholder={t("form.titlePlaceholder")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.date")} error={errors.date}>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
            </Field>
            <Field label={t("form.startTime")} error={errors.time}>
              <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.duration")} error={errors.durationMin}>
              <input
                inputMode="numeric"
                value={Number.isNaN(form.durationMin) ? "" : String(form.durationMin)}
                onChange={(e) => set("durationMin", Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            <Field label={t("form.location")} error={errors.place}>
              <input value={form.place} onChange={(e) => set("place", e.target.value)} className={inputClass} />
            </Field>
          </div>

          <PrimaryButton type="submit">{existing ? t("form.saveChanges") : t("form.addSession")}</PrimaryButton>
          {changed && (
            <button
              type="button"
              onClick={() => {
                resetSessionToSchedule(existing!.id);
                nav.returnTo(`/calendar/${existing!.id}`, t("form.backToScheduleDone"));
              }}
              className="w-full text-center text-sm font-semibold text-brand-strong"
            >
              {t("form.backToSchedule")}
            </button>
          )}
          <DeviceOnlyNotice>
            {t("form.calendarDevice")}
          </DeviceOnlyNotice>
        </form>
      )}
    </main>
  );
}
