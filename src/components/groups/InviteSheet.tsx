"use client";

import { useState } from "react";
import type { Group } from "@/data/types";
import { inviteLink } from "@/data/group-admin";
import Sheet from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import StatusMessage from "@/components/ui/StatusMessage";
import { inputClass } from "@/components/Form";
import { LinkIcon } from "@/components/Icons";
import InviteQr from "./InviteQr";
import { t } from "@/i18n";

/**
 * "Invite" (D-072): how a coach would bring a group in with one link or a QR code, as in
 * PlayerPlus/TeamPlus. In the demo the link is fictional, the QR code is a picture and nobody is invited.
 */
export default function InviteSheet({ group, open, onClose }: { group: Group; open: boolean; onClose: () => void }) {
  const link = inviteLink(group);
  const [copied, setCopied] = useState<"" | "done" | "failed">("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        setCopied("");
        onClose();
      }}
      title={t("invite.title", { group: group.name })}
    >
      <p className="text-sm text-ink-soft">{t("invite.intro")}</p>
      <div className="mt-4 flex justify-center">
        <InviteQr text={link} className="h-44 w-44 rounded-card ring-1 ring-line" />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold">{t("invite.link")}</span>
        <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} mt-1.5 font-mono text-sm`} />
      </label>
      <Button onClick={copy} size="lg" block className="mt-3">
        <LinkIcon className="h-5 w-5" />
        {t("invite.copy")}
      </Button>
      <p role="status" aria-live="polite" className={copied ? "mt-2 text-sm font-medium text-success-ink" : "sr-only"}>
        {copied === "done" && t("invite.copied")}
        {copied === "failed" && t("invite.copyFailed")}
      </p>
      <StatusMessage tone="demo" className="mt-3 text-xs">
        <strong>{t("common.demoLabel")}</strong> {t("invite.demo")}
      </StatusMessage>
    </Sheet>
  );
}
