// Cover illustrations for the four demo scenarios (D-053, D-055).
// Original vector drawings made for CoachSpace, in the style of a coach's tactics board seen from
// above: no third-party image, no licence to track, a few kilobytes each, sharp on every screen and
// no network request. Colours come from the scene tokens in globals.css.
// See docs/DEMO_CONTENT_SOURCES.md for why these are illustrations rather than photographs.
import type { ScenarioId } from "@/data/scenarios/types";
import { SPORT_PHOTOS } from "@/data/look";
import Photo from "@/components/ui/Photo";

const LINE = "var(--color-scene-line)";

/** A person seen from above: a coloured disc with a white ring and a soft shadow. */
function Player({ x, y, fill, r = 8 }: { x: number; y: number; fill: string; r?: number }) {
  return (
    <g>
      <circle cx={x + 1.5} cy={y + 2} r={r + 1} fill="var(--color-scene-dark)" opacity="0.22" />
      <circle cx={x} cy={y} r={r} fill={fill} stroke={LINE} strokeWidth="2.5" />
    </g>
  );
}

/** The coach: the brand colour with a small white centre, so it reads as "the one in charge". */
function Coach({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Player x={x} y={y} r={10} fill="var(--color-brand-strong)" />
      <circle cx={x} cy={y} r="3" fill={LINE} />
    </g>
  );
}

/** A dashed movement or passing line with an arrowhead pointing at (x, y), at `deg` degrees. */
function Move({ d, x, y, deg, colour = LINE }: { d: string; x: number; y: number; deg: number; colour?: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={colour} strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
      <path d="M0 0 L-9 -5 L-9 5 Z" fill={colour} transform={`translate(${x} ${y}) rotate(${deg})`} />
    </g>
  );
}

function Cone({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 5} ${y + 4} L${x} ${y - 6} L${x + 5} ${y + 4} Z`} fill="var(--color-scene-cone)" stroke={LINE} strokeWidth="1" />;
}

function Tennis() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-court-out)" />
      <rect x="40" y="37" width="320" height="151" fill="var(--color-scene-court)" />
      <g stroke={LINE} strokeWidth="2.2" fill="none">
        <rect x="40" y="37" width="320" height="151" />
        <path d="M40 56 H360 M40 169 H360" />
        <path d="M114 56 V169 M286 56 V169 M114 112.5 H286" />
        <path d="M40 112.5 H47 M353 112.5 H360" />
      </g>
      {/* Net across the middle of the court */}
      <path d="M200 30 V195" stroke="var(--color-scene-net)" strokeWidth="4" />
      <circle cx="200" cy="30" r="3.5" fill="var(--color-scene-net)" />
      <circle cx="200" cy="195" r="3.5" fill="var(--color-scene-net)" />
      {/* Targets in the far service boxes */}
      <g fill="none" stroke="var(--color-scene-tennis-ball)" strokeWidth="2">
        <circle cx="262" cy="80" r="11" />
        <circle cx="262" cy="145" r="11" />
      </g>
      {/* Coach feeding from a basket; two players returning */}
      <circle cx="52" cy="160" r="11" fill="var(--color-scene-dark)" opacity="0.85" />
      {[
        [48, 156],
        [56, 156],
        [52, 163],
        [46, 164],
        [58, 164],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.2" fill="var(--color-scene-tennis-ball)" />
      ))}
      <Move d="M84 128 Q170 70 252 80" x={252} y={80} deg={8} colour="var(--color-scene-tennis-ball)" />
      <Move d="M300 150 Q240 176 160 150" x={160} y={150} deg={198} />
      <Coach x={72} y={136} />
      <Player x={312} y={84} fill="var(--color-scene-kit-2)" />
      <Player x={312} y={150} fill="var(--color-scene-kit-3)" />
      <circle cx="232" cy="78" r="4" fill="var(--color-scene-tennis-ball)" stroke="var(--color-scene-dark)" strokeWidth="0.8" />
    </>
  );
}

function Football() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 50} width="50" height="225" fill={i % 2 ? "var(--color-scene-pitch)" : "var(--color-scene-pitch-alt)"} />
      ))}
      <g stroke={LINE} strokeWidth="2.2" fill="none" opacity="0.95">
        <rect x="14" y="14" width="372" height="197" />
        <path d="M200 14 V211" />
        <circle cx="200" cy="112.5" r="30" />
        <path d="M386 58 H326 V167 H386 M386 88 H364 V137 H386" />
        <path d="M326 94 A22 22 0 0 0 326 131" />
      </g>
      <circle cx="200" cy="112.5" r="2.5" fill={LINE} />
      <circle cx="346" cy="112.5" r="2.5" fill={LINE} />
      {/* Rondo 4v1 inside a coned square */}
      <Cone x={58} y={52} />
      <Cone x={162} y={52} />
      <Cone x={162} y={172} />
      <Cone x={58} y={172} />
      <Move d="M120 58 L157 102" x={157} y={102} deg={50} />
      <Move d="M160 124 L121 163" x={121} y={163} deg={135} />
      <Move d="M98 165 L61 125" x={61} y={125} deg={228} />
      <Player x={110} y={54} fill="var(--color-scene-kit-2)" />
      <Player x={166} y={112} fill="var(--color-scene-kit-2)" />
      <Player x={110} y={170} fill="var(--color-scene-kit-2)" />
      <Player x={54} y={112} fill="var(--color-scene-kit-2)" />
      <Player x={112} y={110} fill="var(--color-scene-kit-3)" />
      <circle cx="150" cy="94" r="4.5" fill={LINE} stroke="var(--color-scene-dark)" strokeWidth="1.2" />
      {/* A finishing pattern towards goal, watched by the coach */}
      <Move d="M262 74 Q300 82 318 104" x={318} y={104} deg={52} />
      <Player x={252} y={70} fill="var(--color-scene-kit-2)" />
      <Player x={300} y={140} fill="var(--color-scene-kit-3)" />
      <Coach x={226} y={182} />
    </>
  );
}

function Basketball() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-floor)" />
      <g stroke="var(--color-scene-floor-line)" strokeWidth="1" opacity="0.45">
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${i * 19} 0 V225`} />
        ))}
      </g>
      {/* Painted key */}
      <rect x="300" y="84" width="86" height="57" fill="var(--color-scene-basketball)" opacity="0.28" />
      <g stroke={LINE} strokeWidth="2.2" fill="none">
        <rect x="14" y="14" width="372" height="197" />
        <rect x="300" y="84" width="86" height="57" />
        <circle cx="300" cy="112.5" r="26" />
        <path d="M386 24 H313.5 A105 105 0 0 0 313.5 201 H386" />
        <path d="M14 82.5 A30 30 0 0 1 14 142.5" />
      </g>
      {/* Backboard and rim */}
      <path d="M378 98 V127" stroke="var(--color-scene-dark)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="370" cy="112.5" r="6" fill="none" stroke="var(--color-scene-basketball)" strokeWidth="2.5" />
      {/* A pass and a cut to the basket */}
      <Move d="M236 72 Q214 118 226 152" x={226} y={152} deg={80} />
      <Move d="M244 176 Q300 186 344 136" x={344} y={136} deg={-48} />
      <Player x={240} y={62} fill="var(--color-scene-kit-2)" />
      <Player x={232} y={168} fill="var(--color-scene-kit-2)" />
      <Player x={318} y={40} fill="var(--color-scene-kit-2)" />
      <Player x={262} y={84} fill="var(--color-scene-kit-3)" />
      <Player x={262} y={150} fill="var(--color-scene-kit-3)" />
      <Player x={330} y={64} fill="var(--color-scene-kit-3)" />
      <g>
        <circle cx="253" cy="54" r="5.5" fill="var(--color-scene-basketball)" stroke="var(--color-scene-dark)" strokeWidth="1" />
        <path d="M247.5 54 H258.5 M253 48.5 V59.5" stroke="var(--color-scene-dark)" strokeWidth="0.8" />
      </g>
      <Coach x={120} y={112} />
    </>
  );
}

/** A reformer seen from above, with a client lying on the carriage. */
function Reformer({ x, y, client }: { x: number; y: number; client: string }) {
  return (
    <g>
      <rect x={x + 2} y={y + 3} width="132" height="34" rx="8" fill="var(--color-scene-dark)" opacity="0.15" />
      <rect x={x} y={y} width="132" height="34" rx="8" fill="var(--color-scene-wood)" />
      <path d={`M${x + 8} ${y + 9} H${x + 124} M${x + 8} ${y + 25} H${x + 124}`} stroke="var(--color-scene-dark)" strokeWidth="1.2" opacity="0.35" />
      <rect x={x + 20} y={y + 5} width="52" height="24" rx="5" fill="var(--color-scene-reformer)" />
      <path d={`M${x + 116} ${y + 4} V${y + 30}`} stroke="var(--color-scene-dark)" strokeWidth="3.5" strokeLinecap="round" />
      {/* Client: head on the headrest, body along the carriage, feet on the footbar */}
      <circle cx={x + 28} cy={y + 17} r="6" fill={client} stroke={LINE} strokeWidth="1.8" />
      <rect x={x + 35} y={y + 11} width="40" height="12" rx="6" fill={client} opacity="0.9" />
      <path d={`M${x + 75} ${y + 14} L${x + 113} ${y + 12} M${x + 75} ${y + 20} L${x + 113} ${y + 22}`} stroke={client} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Pilates() {
  return (
    <>
      <rect width="400" height="225" fill="var(--color-scene-studio)" />
      <g stroke="var(--color-scene-wood)" strokeWidth="1" opacity="0.35">
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M0 ${i * 22 + 6} H400`} />
        ))}
      </g>
      {/* Light from the windows */}
      <path d="M180 0 H250 L300 225 H220 Z" fill={LINE} opacity="0.35" />
      <path d="M300 0 H350 L400 160 V225 H360 Z" fill={LINE} opacity="0.25" />
      <Reformer x={30} y={30} client="var(--color-scene-kit-2)" />
      <Reformer x={30} y={95} client="var(--color-scene-kit-3)" />
      <Reformer x={30} y={160} client="var(--color-scene-reformer)" />
      {/* Mats with small props */}
      <rect x="240" y="48" width="92" height="30" rx="7" fill="var(--color-scene-kit-3)" opacity="0.35" />
      <rect x="240" y="146" width="92" height="30" rx="7" fill="var(--color-brand)" opacity="0.3" />
      <circle cx="350" cy="63" r="8" fill="none" stroke="var(--color-scene-dark)" strokeWidth="2.5" opacity="0.6" />
      <circle cx="350" cy="161" r="7" fill="var(--color-scene-cone)" opacity="0.8" />
      <Player x={258} y={63} r={6.5} fill="var(--color-scene-kit-3)" />
      <Player x={258} y={161} r={6.5} fill="var(--color-scene-kit-2)" />
      <Coach x={198} y={112} />
    </>
  );
}

/** Which part of the drawing to keep when it is cropped to a narrower box (the welcome cards on phones). */
const focus: Record<ScenarioId, string> = {
  tennis: "xMinYMid",
  football: "xMinYMid",
  basketball: "xMaxYMid",
  pilates: "xMinYMid",
};

const scenes: Record<ScenarioId, () => React.ReactElement> = {
  tennis: Tennis,
  football: Football,
  basketball: Basketball,
  pilates: Pilates,
};

/** A 16:9 cover illustration for a scenario. Pass `alt` to describe it; omit it when decorative. */
/** The original tactics-board illustration of a scenario, kept for illustrated empty states (D-074). */
export function ScenarioIllustration({ scenario, alt, className = "" }: { scenario: ScenarioId; alt?: string; className?: string }) {
  const Scene = scenes[scenario];
  return (
    <svg
      viewBox="0 0 400 225"
      className={`block h-auto w-full ${className}`}
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
      preserveAspectRatio={`${focus[scenario]} slice`}
    >
      <Scene />
    </svg>
  );
}

const discipline: Record<ScenarioId, "Tennis" | "Football" | "Basketball" | "Pilates"> = {
  tennis: "Tennis",
  football: "Football",
  basketball: "Basketball",
  pilates: "Pilates",
};

/** A scenario's cover: the sport's cover photo since D-074 (Pexels licence, see DEMO_CONTENT_SOURCES.md). */
export default function ScenarioCover({ scenario, alt, className = "" }: { scenario: ScenarioId; alt?: string; className?: string }) {
  return <Photo name={SPORT_PHOTOS[discipline[scenario]].cover} alt={alt ?? ""} className={className} />;
}
