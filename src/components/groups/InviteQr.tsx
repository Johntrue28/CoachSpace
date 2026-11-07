import { qrPlaceholder } from "@/data/group-admin";
import { t } from "@/i18n";

/**
 * A picture that only looks like a QR code (D-072): the corner markers and a stable pattern, with
 * "DEMO" across the middle. It encodes nothing and cannot be scanned.
 */
export default function InviteQr({ text, className = "" }: { text: string; className?: string }) {
  const rows = qrPlaceholder(text);
  const size = rows.length;
  const cells: React.ReactElement[] = [];
  rows.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) cells.push(<rect key={`${r}-${c}`} x={c + 2} y={r + 2} width={1} height={1} />);
    }),
  );
  const mid = size / 2 + 2;
  return (
    <svg
      viewBox={`0 0 ${size + 4} ${size + 4}`}
      role="img"
      aria-label={t("invite.qr")}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect width={size + 4} height={size + 4} rx={1.5} className="fill-card" />
      <g className="fill-ink">{cells}</g>
      <rect x={mid - 4.5} y={mid - 1.8} width={9} height={3.6} rx={0.8} className="fill-attention-soft stroke-ink" strokeWidth={0.25} />
      <text x={mid} y={mid + 0.95} textAnchor="middle" fontSize={2.6} fontWeight={700} className="fill-ink">
        {t("invite.qrBadge")}
      </text>
    </svg>
  );
}
