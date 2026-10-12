import Link from "next/link";
import { cardClass } from "@/components/ui/Card";
import { UserCheckIcon } from "@/components/Icons";

/** Shown instead of the attendance screens while attendance is switched off (D-042). */
export default function AttendanceOff({ backHref = "/", backLabel = "Back to the dashboard" }: { backHref?: string; backLabel?: string }) {
  return (
    <section role="status" className={cardClass({ className: "mt-4 text-center" })}>
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink-soft">
        <UserCheckIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 font-bold text-ink">Attendance is turned off</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
        Attendance tracking is switched off for all groups in this demo. Saved attendance records are kept on this device and
        come back when you turn it on again from the Attendance page.
      </p>
      <Link href={backHref} className="mt-3 inline-block text-sm font-semibold text-brand-strong">
        {backLabel}
      </Link>
    </section>
  );
}
