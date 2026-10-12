// Cover illustrations for the Demo Studio scenario cards (D-053).
// Original vector drawings made for CoachSpace: no third-party image, no licence to track, a few
// kilobytes each, sharp on every screen. Colours come from the scene tokens in globals.css.
// See docs/DEMO_CONTENT_SOURCES.md for why these are illustrations rather than photographs.
import type { ScenarioId } from "@/data/scenarios/types";

type PersonProps = {
  x: number;
  y: number;
  skin: string;
  shirt: string;
  shorts?: string;
  /** Height multiplier: figures further away are smaller. */
  scale?: number;
  /** Arm pose. */
  arms?: "down" | "point" | "up" | "racket" | "ball";
  flip?: boolean;
};

/** A simple standing figure whose feet are at (x, y). */
function Person({ x, y, skin, shirt, shorts = "var(--color-scene-dark)", scale = 1, arms = "down", flip = false }: PersonProps) {
  const armPaths: Record<NonNullable<PersonProps["arms"]>, string> = {
    down: "M-9 -44 L-12 -26 M9 -44 L12 -26",
    point: "M-9 -44 L-12 -26 M9 -44 L26 -52",
    up: "M-9 -44 L-16 -62 M9 -44 L16 -62",
    racket: "M-9 -44 L-12 -26 M9 -44 L20 -36",
    ball: "M-9 -44 L-4 -32 M9 -44 L4 -32",
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path d="M-5 -22 L-6 0 M5 -22 L6 0" stroke={skin} strokeWidth="5" strokeLinecap="round" />
      <rect x="-9" y="-28" width="18" height="10" rx="3" fill={shorts} />
      <rect x="-10" y="-50" width="20" height="25" rx="7" fill={shirt} />
      <path d={armPaths[arms]} stroke={skin} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {arms === "racket" && (
        <g>
          <path d="M20 -36 L28 -44" stroke="var(--color-scene-dark)" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="32" cy="-50" rx="6" ry="8" transform="rotate(35 32 -50)" fill="none" stroke="var(--color-scene-dark)" strokeWidth="2.5" />
        </g>
      )}
      {arms === "ball" && <circle cx="0" cy="-30" r="6" fill="var(--color-scene-basketball)" />}
      <circle cx="0" cy="-58" r="7.5" fill={skin} />
    </g>
  );
}

function Tennis() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-sky)" />
      <rect y="70" width="400" height="155" fill="var(--color-scene-court-out)" />
      <path d="M60 95 H340 L380 215 H20 Z" fill="var(--color-scene-court)" />
      <g stroke="var(--color-scene-line)" strokeWidth="2.5" fill="none">
        <path d="M60 95 H340 L380 215 H20 Z" />
        <path d="M80 95 L50 215 M320 95 L350 215 M200 95 V215 M70 125 H330 M42 185 H358" />
      </g>
      {/* Net */}
      <rect x="28" y="140" width="344" height="16" fill="var(--color-scene-net)" opacity="0.85" />
      <path d="M28 140 H372" stroke="var(--color-scene-line)" strokeWidth="3" />
      <g stroke="var(--color-scene-line)" strokeWidth="0.8" opacity="0.5">
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${36 + i * 16} 141 V156`} />
        ))}
      </g>
      {/* Players on the far side, coach feeding from a basket on the near side */}
      <Person x={135} y={128} scale={0.62} skin="var(--color-scene-skin-2)" shirt="var(--color-scene-kit-2)" arms="racket" />
      <Person x={262} y={124} scale={0.6} skin="var(--color-scene-skin-4)" shirt="var(--color-scene-kit-3)" arms="racket" flip />
      <Person x={238} y={212} scale={1} skin="var(--color-scene-skin-1)" shirt="var(--color-brand-strong)" arms="point" flip />
      <g>
        <path d="M268 212 L272 186 H302 L306 212 Z" fill="var(--color-scene-dark)" opacity="0.8" />
        {[276, 284, 292, 300, 280, 288, 296].map((cx, i) => (
          <circle key={i} cx={cx} cy={i < 4 ? 186 : 180} r="4" fill="var(--color-scene-tennis-ball)" />
        ))}
      </g>
      <path d="M214 150 Q190 92 150 86" stroke="var(--color-scene-line)" strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <circle cx="150" cy="86" r="4.5" fill="var(--color-scene-tennis-ball)" />
    </>
  );
}

function Football() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-sky)" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} y={60 + i * 28} width="400" height="28" fill={i % 2 ? "var(--color-scene-pitch)" : "var(--color-scene-pitch-alt)"} />
      ))}
      <g stroke="var(--color-scene-line)" strokeWidth="2.5" fill="none" opacity="0.9">
        <path d="M0 80 H400" />
        <path d="M290 80 V140 H400" />
      </g>
      {/* Goal */}
      <g stroke="var(--color-scene-line)" strokeWidth="3" fill="none">
        <path d="M330 106 V70 H392 V106" />
      </g>
      <g stroke="var(--color-scene-line)" strokeWidth="0.8" opacity="0.6">
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${336 + i * 8} 72 V106`} />
        ))}
      </g>
      {/* Cones */}
      {[
        [70, 168],
        [150, 196],
        [230, 168],
        [150, 140],
      ].map(([cx, cy], i) => (
        <path key={i} d={`M${cx - 6} ${cy} L${cx} ${cy - 13} L${cx + 6} ${cy} Z`} fill="var(--color-scene-cone)" />
      ))}
      {/* Passing pattern */}
      <path d="M92 160 L136 140 M164 140 L214 160 M210 176 L168 192" stroke="var(--color-scene-line)" strokeWidth="2" strokeDasharray="4 5" fill="none" />
      <Person x={84} y={166} scale={0.82} skin="var(--color-scene-skin-3)" shirt="var(--color-scene-kit-2)" />
      <Person x={150} y={136} scale={0.72} skin="var(--color-scene-skin-1)" shirt="var(--color-scene-kit-2)" />
      <Person x={222} y={166} scale={0.82} skin="var(--color-scene-skin-4)" shirt="var(--color-scene-kit-2)" flip />
      <circle cx="132" cy="146" r="5" fill="var(--color-scene-line)" stroke="var(--color-scene-dark)" strokeWidth="1.2" />
      {/* Coach with a clipboard */}
      <Person x={300} y={214} scale={1.05} skin="var(--color-scene-skin-2)" shirt="var(--color-brand-strong)" arms="point" flip />
      <rect x="306" y="168" width="12" height="16" rx="2" fill="var(--color-scene-line)" stroke="var(--color-scene-dark)" strokeWidth="1.2" />
    </>
  );
}

function Basketball() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-wall)" />
      <rect y="120" width="400" height="105" fill="var(--color-scene-floor)" />
      <g stroke="var(--color-scene-floor-line)" strokeWidth="1" opacity="0.55">
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M0 ${132 + i * 14} H400`} />
        ))}
      </g>
      {/* Key and three-point arc */}
      <g stroke="var(--color-scene-line)" strokeWidth="2.5" fill="none">
        <path d="M250 120 V178 H340 V120" />
        <path d="M250 178 A45 22 0 0 0 340 178" />
        <path d="M190 120 Q195 222 400 214" />
      </g>
      {/* Backboard and hoop */}
      <rect x="276" y="28" width="56" height="38" rx="2" fill="var(--color-scene-line)" stroke="var(--color-scene-dark)" strokeWidth="2" />
      <rect x="292" y="42" width="24" height="16" fill="none" stroke="var(--color-scene-cone)" strokeWidth="2" />
      <path d="M304 66 V120" stroke="var(--color-scene-dark)" strokeWidth="3" />
      <ellipse cx="304" cy="70" rx="13" ry="3.5" fill="none" stroke="var(--color-scene-cone)" strokeWidth="2.5" />
      <path d="M292 71 L296 86 H312 L316 71" stroke="var(--color-scene-line)" strokeWidth="1.2" fill="none" />
      {/* Players in a defensive stance, coach demonstrating with a ball */}
      <Person x={92} y={190} scale={0.95} skin="var(--color-scene-skin-3)" shirt="var(--color-scene-kit-3)" arms="up" />
      <Person x={168} y={176} scale={0.86} skin="var(--color-scene-skin-1)" shirt="var(--color-scene-kit-3)" arms="up" />
      <Person x={236} y={214} scale={1.08} skin="var(--color-scene-skin-4)" shirt="var(--color-brand-strong)" arms="ball" flip />
    </>
  );
}

function Pilates() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-studio)" />
      {/* Window with soft light */}
      <rect x="36" y="22" width="120" height="86" rx="4" fill="var(--color-scene-sky)" stroke="var(--color-scene-wood)" strokeWidth="4" />
      <path d="M96 22 V108 M36 65 H156" stroke="var(--color-scene-wood)" strokeWidth="3" />
      <rect y="150" width="400" height="75" fill="var(--color-scene-wood)" opacity="0.45" />
      {/* Plant */}
      <rect x="350" y="120" width="22" height="30" rx="3" fill="var(--color-scene-dark)" opacity="0.75" />
      <path d="M361 120 C350 100 340 96 336 82 M361 120 C364 98 372 92 382 84 M361 120 C358 104 362 92 360 76" stroke="var(--color-brand)" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Two reformers */}
      {[
        [40, 196],
        [150, 160],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y - 12} width="170" height="10" rx="5" fill="var(--color-scene-wood)" />
          <rect x={x + 30} y={y - 20} width="70" height="9" rx="3" fill="var(--color-scene-reformer)" />
          <path d={`M${x + 150} ${y - 12} V${y - 34} M${x + 6} ${y - 2} V${y + 8} M${x + 164} ${y - 2} V${y + 8}`} stroke="var(--color-scene-dark)" strokeWidth="3" strokeLinecap="round" />
          {/* Client lying on the carriage, feet on the footbar */}
          <circle cx={x + 40} cy={y - 26} r="7" fill={i ? "var(--color-scene-skin-2)" : "var(--color-scene-skin-4)"} />
          <rect x={x + 48} y={y - 32} width="44" height="12" rx="6" fill={i ? "var(--color-scene-kit-3)" : "var(--color-scene-kit-2)"} />
          <path d={`M${x + 92} ${y - 26} L${x + 124} ${y - 46} L${x + 150} ${y - 34}`} stroke={i ? "var(--color-scene-skin-2)" : "var(--color-scene-skin-4)"} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* Instructor */}
      <Person x={318} y={204} scale={1.05} skin="var(--color-scene-skin-1)" shirt="var(--color-brand-strong)" arms="point" flip />
    </>
  );
}

const scenes: Record<ScenarioId, () => React.ReactElement> = {
  tennis: Tennis,
  football: Football,
  basketball: Basketball,
  pilates: Pilates,
};

/** A 16:9 cover illustration for a scenario. Pass `alt` to describe it; omit it when decorative. */
export default function ScenarioCover({ scenario, alt, className = "" }: { scenario: ScenarioId; alt?: string; className?: string }) {
  const Scene = scenes[scenario];
  return (
    <svg
      viewBox="0 0 400 225"
      className={`block h-auto w-full ${className}`}
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
    >
      <Scene />
    </svg>
  );
}
