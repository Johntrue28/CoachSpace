import { DeviceIcon } from "./Icons";

/** Honest label for demo features: changes stay in this browser and are not shared. */
export default function DeviceOnlyNotice() {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-accent/15 px-3 py-2 text-xs text-ink">
      <DeviceIcon className="mt-px h-4 w-4 shrink-0" />
      <span>
        <strong>Demo:</strong> changes are saved on this device only. Nothing is sent to participants yet.
      </span>
    </p>
  );
}
