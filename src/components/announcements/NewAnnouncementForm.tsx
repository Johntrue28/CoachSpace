"use client";

import { useState } from "react";
import { useDemoStore } from "@/data/store";
import { groupById, groups } from "@/data/groups";
import { COACH_SENDER_ID } from "@/data/messages";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";

import BackLink from "@/components/navigation/BackLink";
import { useNavigation } from "@/components/navigation/NavigationProvider";

const TITLE_MAX = 80;
const BODY_MAX = 500;

type Errors = Partial<Record<"title" | "body", string>>;

export default function NewAnnouncementForm({ groupId }: { groupId?: string }) {
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
    nav.returnTo(
      audience === "all" ? "/announcements" : `/announcements?group=${audience}`,
      "Announcement posted on this device. Participants have not been notified (demo).",
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6">
      <BackLink fallback="/announcements" fallbackLabel="Announcements" />
      <h1 className="mt-4 text-2xl font-bold">New announcement</h1>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <Field label="For">
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

        <Field label="Announcement" hint={`${body.trim().length}/${BODY_MAX} characters`} error={errors.body}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className={inputClass}
            aria-invalid={Boolean(errors.body)}
          />
        </Field>

        <PrimaryButton type="submit">Post announcement</PrimaryButton>
        <DeviceOnlyNotice />
      </form>
    </main>
  );
}
