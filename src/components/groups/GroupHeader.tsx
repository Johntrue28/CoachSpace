import type { Group } from "@/data/types";
import { coach, memberCount, scheduleLabel } from "@/data/groups";
import Avatar from "@/components/Avatar";
import { ClockIcon, PinIcon } from "@/components/Icons";
import { cardClass } from "@/components/ui/Card";

/** The top of a group page (Figma group panel): name, sport, coach, size, schedule, place and the group's actions. */
export default function GroupHeader({ group, actions }: { group: Group; actions?: React.ReactNode }) {
  return (
    <section aria-labelledby="group-title" className={cardClass({ className: "sm:p-6" })}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={group.name} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">{group.discipline}</p>
            <h1 id="group-title" className="mt-0.5 text-2xl font-bold tracking-tight text-ink">
              {group.name}
            </h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Coach {coach.name} · {memberCount(group.id)} participants
            </p>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      <p className="mt-4 text-sm text-ink">{group.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4" /> {scheduleLabel(group)}
        </span>
        <span className="flex items-center gap-1.5">
          <PinIcon className="h-4 w-4" /> {group.venue}
        </span>
      </div>
    </section>
  );
}
