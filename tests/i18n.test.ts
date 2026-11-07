// Interface language (D-083): every key in both languages, the same placeholders, plurals and the switch.
import { afterEach, describe, test } from "node:test";
import assert from "node:assert/strict";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";
import { keysOf, setLocale, t, tn, intlLocale, categoryLabel } from "@/i18n";
import { summaryText } from "@/data/rsvp";
import { countdown } from "@/data/look";
import { formatDateKey } from "@/components/format";

afterEach(() => setLocale("en"));

function lookup(messages: object, key: string) {
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) as string;
}
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("translation files", () => {
  test("English and Spanish have exactly the same keys", () => {
    assert.deepEqual(keysOf(es).sort(), keysOf(en).sort());
  });
  test("every text is filled in and keeps the same placeholders", () => {
    for (const key of keysOf(en)) {
      const english = lookup(en, key);
      const spanish = lookup(es, key);
      assert.ok(english.length > 0 && spanish.length > 0, key);
      assert.deepEqual(placeholders(spanish), placeholders(english), key);
    }
  });
  test("plurals come in pairs", () => {
    const keys = keysOf(en);
    for (const key of keys.filter((k) => k.endsWith("_one"))) assert.ok(keys.includes(key.replace(/_one$/, "_other")), key);
    for (const key of keys.filter((k) => k.endsWith("_other"))) assert.ok(keys.includes(key.replace(/_other$/, "_one")), key);
  });
});

describe("t and tn", () => {
  test("British English by default, Spanish when chosen", () => {
    assert.equal(t("nav.home"), "Home");
    assert.equal(intlLocale(), "en-GB");
    setLocale("es");
    assert.equal(t("nav.home"), "Inicio");
    assert.equal(intlLocale(), "es-ES");
  });
  test("placeholders and plurals", () => {
    assert.equal(tn("home.registers", 1), "1 register to take");
    assert.equal(tn("home.registers", 3), "3 registers to take");
    setLocale("es");
    assert.equal(tn("home.registers", 3), "3 registros por pasar");
    assert.equal(t("filter.hide", { name: "U16" }), "Ocultar U16");
  });
  test("the pure rules and dates follow the language", () => {
    const summary = { going: 6, maybe: 0, notGoing: 1, noReply: 2, total: 9 };
    assert.equal(summaryText(summary), "6 going · 1 not going · 2 no reply");
    assert.equal(countdown(new Date(2026, 9, 14, 12), new Date(2026, 9, 14, 17)), "in 5 h");
    assert.equal(formatDateKey("2026-10-14"), "Wednesday 14 Oct");
    assert.equal(categoryLabel("Warm-up"), "Warm-up");
    setLocale("es");
    assert.equal(summaryText(summary), "6 van · 1 no van · 2 sin respuesta");
    assert.equal(countdown(new Date(2026, 9, 14, 12), new Date(2026, 9, 14, 17)), "en 5 h");
    assert.match(formatDateKey("2026-10-14"), /miércoles/);
    assert.equal(categoryLabel("Warm-up"), "Calentamiento");
  });
});
