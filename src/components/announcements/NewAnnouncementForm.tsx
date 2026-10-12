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

const TITLE_MAX = 80;
const BODY_MAX = 500;

type Errors = Partial<Record<"title" | "body", string>>;

/** The page for a new announcement (/announcements/new). */
export default function NewAnnouncementForm({ groupId }: { groupId?: string }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <BackLink fallback="/announcements" fallbackLabel="Announcements" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">New announcement</h1>
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
    if (!title.trim()) next.title = "Give the announcement a title.";
    else if (title.trim().length > TITLE_MAX) next.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (!body.trim()) next.body = "Write the announcement.";
    else if (body.trim().length > BODY_MAX) next.body = `Keep the announcement under ${BODY_MAX} characters.`;
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
      "Announcement posted on this device. Participants have not been notified (demo).",
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-4 space-y-3" : "mt-5 space-y-4"} noValidate>
      <Field label={compact ? "Audience" : "For"}>
        <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
          <option value="all">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title" error={errors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Training cancelled on Friday"
          aria-invalid={Boolean(errors.title)}
        />
      </Field>

      <Field label={compact ? "Message" : "Announcement"} hint={`${body.trim().length}/${BODY_MAX} characters`} error={errors.body}>
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
          Publish announcement
        </Button>
      ) : (
        <PrimaryButton type="submit">Post announcement</PrimaryButton>
      )}
      {!compact && <DeviceOnlyNotice />}
    </form>
  );
}
