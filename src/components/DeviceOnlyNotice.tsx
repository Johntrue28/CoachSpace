import StatusMessage from "@/components/ui/StatusMessage";

/** Honest label for demo features: changes stay in this browser and are not shared. */
export default function DeviceOnlyNotice({ children }: { children?: React.ReactNode }) {
  return (
    <StatusMessage tone="demo" className="text-[13px]">
      <strong>Demo:</strong>{" "}
      {children ?? "changes are saved on this device only. Nothing is sent to participants yet."}
    </StatusMessage>
  );
}
