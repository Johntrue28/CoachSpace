import StatusMessage from "@/components/ui/StatusMessage";
import { t } from "@/i18n";

/** Honest label for demo features: changes stay in this browser and are not shared. */
export default function DeviceOnlyNotice({ children }: { children?: React.ReactNode }) {
  return (
    <StatusMessage tone="demo" className="text-xs">
      <strong>{t("common.demoLabel")}</strong>{" "}
      {children ?? t("common.deviceOnly")}
    </StatusMessage>
  );
}
