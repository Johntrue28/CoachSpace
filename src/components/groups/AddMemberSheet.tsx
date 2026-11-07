"use client";

import { useState } from "react";
import type { Group } from "@/data/types";
import { participantsOf } from "@/data/groups";
import { useDemoStore } from "@/data/store";
import { hasErrors, validateMemberDraft, type MemberDraft, type MemberDraftErrors } from "@/data/group-admin";
import Sheet from "@/components/ui/Sheet";
import DeviceOnlyNotice from "@/components/DeviceOnlyNotice";
import { Field, PrimaryButton, inputClass } from "@/components/Form";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { t } from "@/i18n";

const EMPTY: MemberDraft = { name: "", guardian: "" };

/** "Add member" (D-072): a name and, for young members, a parent or guardian. Saved in this browser only. */
export default function AddMemberSheet({ group, open, onClose }: { group: Group; open: boolean; onClose: () => void }) {
  const nav = useNavigation();
  const { addMember } = useDemoStore();
  const [draft, setDraft] = useState<MemberDraft>(EMPTY);
  const [errors, setErrors] = useState<MemberDraftErrors>({});

  function close() {
    setDraft(EMPTY);
    setErrors({});
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validateMemberDraft(draft, participantsOf(group.id));
    setErrors(next);
    if (hasErrors(next)) return;
    addMember(group.id, draft);
    // The group page is shown again with the new member, so the confirmation goes through the navigation.
    nav.flash(`/groups/${group.id}`, t("member.added", { name: draft.name.trim() }));
    close();
  }

  return (
    <Sheet open={open} onClose={close} title={t("member.title", { group: group.name })}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label={t("member.name")} error={errors.name}>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={inputClass} autoComplete="off" maxLength={60} placeholder="A fictional name" />
        </Field>
        <Field label={t("member.guardian")} hint={t("member.guardianHint")} error={errors.guardian}>
          <input value={draft.guardian} onChange={(e) => setDraft((d) => ({ ...d, guardian: e.target.value }))} className={inputClass} autoComplete="off" maxLength={60} />
        </Field>
        <PrimaryButton>{t("member.add")}</PrimaryButton>
        <DeviceOnlyNotice>{t("member.device")}</DeviceOnlyNotice>
      </form>
    </Sheet>
  );
}
