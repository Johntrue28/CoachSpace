"use client";

import { useEffect, useId, useRef } from "react";
import { CloseIcon } from "@/components/Icons";

/**
 * A sheet over the page (D-072): rises from the bottom on phones and is a centred panel from 640 px.
 * Built on the native <dialog>, so focus stays inside, Escape closes it and the page behind is inert.
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A tap on the dimmed backdrop (the dialog element itself, outside the panel) closes the sheet.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-card bg-card p-0 text-ink shadow-raised backdrop:bg-ink/40 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-card"
    >
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-control text-ink-soft hover:bg-surface"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
