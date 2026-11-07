import type { ScenarioId } from "@/data/scenarios/types";
import type { Discipline } from "@/data/types";
import { SPORT_PHOTOS } from "@/data/look";
import Photo from "@/components/ui/Photo";

const discipline: Record<ScenarioId, Discipline> = {
  tennis: "Tennis",
  football: "Football",
  basketball: "Basketball",
};

/** A scenario's cover: the sport's cover photo (D-074, Pexels licence, see docs/DEMO_CONTENT_SOURCES.md). */
export default function ScenarioCover({ scenario, alt, className = "" }: { scenario: ScenarioId; alt?: string; className?: string }) {
  return <Photo name={SPORT_PHOTOS[discipline[scenario]].cover} alt={alt ?? ""} className={className} />;
}
