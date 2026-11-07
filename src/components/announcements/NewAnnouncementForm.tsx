"use client";

import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { groupById, groups } from "@/data/groups";
import { COACH_SENDER_ID } from "@/data/messages";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";
import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n";

const TITLE_MAX = 80;
const BODY_MAX = 500;

type Errors = Partial<Record<"title" | "body", string>>;

/** The page for a new announcement (/announcements/new). */
export default function NewAnnouncementForm({ groupId }: { groupId?: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <BackLink fallback="/announcements" fallbackLabel={t("back.announcements")} />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("announce.new")}</h1>
      <AnnouncementComposer groupId={groupId} />
    </main>
  );
}

/**
 * The announcement form: audience, title and text, with validation. Used on its own page and, from
 * 1280 px, beside the board (`compact`). Posting saves in this browser and returns to the board.
 */
export function AnnouncementComposer({ groupId, compact = false }: { groupId?: string; compact?: boolean }) {
  const nav = useNavigation();
  const { addAnnouncement } = useDemoStore();
  const [audience, setAudience] = useState(groupId && groupById(groupId) ? groupId : "all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = t("announce.errorTitle");
    else if (title.trim().length > TITLE_MAX) next.title = t("announce.errorTitleLong", { max: TITLE_MAX });
    if (!body.trim()) next.body = t("announce.errorBody");
    else if (body.trim().length > BODY_MAX) next.body = t("announce.errorBodyLong", { max: BODY_MAX });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    addAnnouncement({
      groupId: audience === "all" ? null : audience,
      title: title.trim(),
      body: body.trim(),
      authorId: COACH_SENDER_ID,
    });
    setTitle("");
    setBody("");
    nav.returnTo(
      audience === "all" ? "/announcements" : `/announcements?group=${audience}`,
      t("announce.posted"),
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-4 space-y-3" : "mt-5 space-y-4"} noValidate>
      <Field label={compact ? t("announce.audience") : t("announce.for")}>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
          <option value="all">{t("announce.allGroups")}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("announce.title")} error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder={t("announce.titlePlaceholder")}
          aria-invalid={Boolean(errors.title)}
        />
      </Field>

      <Field label={compact ? t("announce.message") : t("announce.announcement")} hint={t("announce.characters", { count: body.trim().length, max: BODY_MAX })} error={errors.body}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={compact ? 4 : 5}
          className={inputClass}
          aria-invalid={Boolean(errors.body)}
        />
      </Field>

      {compact ? (
        <Button type="submit" block>
          {t("announce.publish")}
        </Button>
      ) : (
        <PrimaryButton type="submit">{t("announce.post")}</PrimaryButton>
      )}
      {!compact && <DeviceOnlyNotice />}
    </form>
  );
}
