// Importing this module makes the original mixed-sport fixture the active demo data for the
// rest of the test file (see harbour.ts).
import { applyScenario } from "@/data/scenario";
import { harbourFixture } from "./harbour";

applyScenario(harbourFixture);
