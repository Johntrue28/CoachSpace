import Link from "next/link";
import type { Group } from "@/data/types";
import { coach, colourOf, memberCount, participantsLabel, scheduleLabel } from "@/data/groups";
import { ChatIcon, ClockIcon, EditIcon, LinkIcon, PinIcon } from "@/components/Icons";

/**
 * The top of a coach's group page in the group's own colour (D-074), with Invite as its one primary action
 * (D-073), then the group chat and Edit.
 */
export default function GroupHero({ group, chatId, onInvite }: { group: Group; chatId?: string; onInvite: () => void }) {
  const colour = colourOf(group.id);
  return (
    <section aria-labelledby="group-title" className="fade-in overflow-hidden rounded-[1.5rem] text-on-brand shadow-raised" style={{ backgroundColor: colour.solid }}>
      <div className="bg-gradient-to-br from-white/10 to-black/20 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-bold" aria-hidden="true">
            {group.short ?? group.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-on-brand/85">{group.discipline}</p>
            <h1 id="group-title" className="truncate text-2xl font-bold tracking-tight">
              {group.name}
            </h1>
            <p className="text-sm text-on-brand/90">
              Coach {coach.name} · {participantsLabel(memberCount(group.id))}
              {group.capacity !== undefined && ` · ${group.capacity} places`}
            </p>
          </div>
        </div>
        {group.description && <p className="mt-3 text-sm text-on-brand/90">{group.description}</p>}
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-on-brand/90">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" /> {scheduleLabel(group)}
          </span>
          <span className="flex items-center gap-1.5">
            <PinIcon className="h-4 w-4" /> {group.venue}
          </span>
        </p>
        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2 sm:flex">
          <button type="button" onClick={onInvite} className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-card px-4 text-sm font-bold" style={{ color: colour.solid }}>
            <LinkIcon className="h-4 w-4" /> Invite
          </button>
          {chatId ? (
            <Link href={`/chat/${chatId}`} aria-label="Group chat" className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-white/15 px-4 text-sm font-bold hover:bg-white/25">
              <ChatIcon className="h-4 w-4" /> Chat
            </Link>
          ) : (
            <span />
          )}
          <Link href={`/groups/${group.id}/edit`} className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-white/15 px-4 text-sm font-bold hover:bg-white/25">
            <EditIcon className="h-4 w-4" /> Edit
          </Link>
        </div>
      </div>
    </section>
  );
}
