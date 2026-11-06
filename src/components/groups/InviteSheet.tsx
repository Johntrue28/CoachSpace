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
      title={`Invite to ${group.name}`}
    >
      <p className="text-sm text-ink-soft">Members would open the link or scan the code and join in under a minute, without a password.</p>
      <div className="mt-4 flex justify-center">
        <InviteQr text={link} className="h-44 w-44 rounded-card ring-1 ring-line" />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold">Invite link</span>
        <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} mt-1.5 font-mono text-sm`} />
      </label>
      <Button onClick={copy} size="lg" block className="mt-3">
        <LinkIcon className="h-5 w-5" />
        Copy link
      </Button>
      <p role="status" aria-live="polite" className={copied ? "mt-2 text-sm font-medium text-success-ink" : "sr-only"}>
        {copied === "done" && "Link copied. It is a demo link and does not open anything."}
        {copied === "failed" && "Copying is not available here. Select the link above to copy it."}
      </p>
      <StatusMessage tone="demo" className="mt-3 text-xs">
        <strong>Demo:</strong> this link does not work and nobody is invited.
      </StatusMessage>
    </Sheet>
  );
}
