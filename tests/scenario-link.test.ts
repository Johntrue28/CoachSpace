// Direct links to one demo example (audit R-08): `/demo?sport=<id>` accepts only the four scenario ids.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCENARIO_LINK_PARAM, scenarioFromLink } from "@/data/scenario-link";
import { SCENARIO_IDS } from "@/data/scenarios/types";
import { scenarioBootScript } from "@/data/persistence";

test("each of the four scenarios can be linked directly", () => {
  assert.equal(SCENARIO_LINK_PARAM, "sport");
  for (const id of SCENARIO_IDS) assert.equal(scenarioFromLink(`?sport=${id}`), id);
  assert.equal(scenarioFromLink("?utm=x&sport=pilates"), "pilates", "other parameters are ignored");
});

test("anything else falls back to the welcome screen", () => {
  for (const search of ["", "?", "?sport=", "?sport=golf", "?sport=Tennis", "?sport=tennis%20", "?sport=__proto__", "?sports=tennis", "?sport=<script>"]) {
    assert.equal(scenarioFromLink(search), null, search);
  }
});

test("the boot script hides the cards only for a valid direct link on the welcome screen", () => {
  assert.match(scenarioBootScript, /location\.pathname==="\/demo"&&\/\[\?&\]sport=\(tennis\|football\|basketball\|pilates\)\(&\|\$\)\/\.test\(location\.search\)/);
  const pattern = /[?&]sport=(tennis|football|basketball|pilates)(&|$)/;
  assert.ok(pattern.test("?sport=tennis") && pattern.test("?a=1&sport=pilates&b=2"));
  assert.ok(!pattern.test("?sport=tennisx") && !pattern.test("?sport=golf") && !pattern.test("?xsport=tennis"));
});
