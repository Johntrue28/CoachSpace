// Interface language (D-083): British English by default, Spanish (es-ES) selectable in Settings.
// No library: two typed message files and a tiny `t()`. Like the demo scenario (D-053), the active language is a
// module binding that the provider sets before the app is mounted again, so components and the pure data rules
// read their words the same way. The server and the first render are always English.
import { en, type Messages } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";
export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

const catalogues: Record<Locale, Messages> = { en, es };
let active: Locale = DEFAULT_LOCALE;

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

/** Makes `locale` the language of every `t()` call. Called by the language provider (and tests) only. */
export function setLocale(locale: Locale) {
  active = locale;
}

export function getLocale(): Locale {
  return active;
}

/** The BCP 47 tag for dates and numbers: "en-GB" or "es-ES". */
export function intlLocale(locale: Locale = active) {
  return locale === "es" ? "es-ES" : "en-GB";
}

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Every message key, e.g. "home.title". */
export type MessageKey = Leaves<Messages>;
type PluralBase<K> = K extends `${infer B}_one` ? B : never;
/** Keys that have a "_one" and an "_other" form, without the suffix. */
export type PluralKey = PluralBase<MessageKey>;
export type Params = Record<string, string | number>;

function lookup(locale: Locale, key: string): string | undefined {
  let node: unknown = catalogues[locale];
  for (const part of key.split(".")) node = (node as Record<string, unknown> | undefined)?.[part];
  return typeof node === "string" ? node : undefined;
}

function fill(text: string, params?: Params) {
  return params ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m)) : text;
}

/** The text of `key` in the active language, with `{name}` placeholders filled from `params`. */
export function t(key: MessageKey, params?: Params): string {
  return fill(lookup(active, key) ?? lookup(DEFAULT_LOCALE, key) ?? key, params);
}

/** A counted text: `key_one` for 1, `key_other` otherwise; `{count}` is filled in. */
export function tn(key: PluralKey, count: number, params?: Params): string {
  return t(`${key}_${count === 1 ? "one" : "other"}` as MessageKey, { count, ...params });
}

/** Every key of a message file, for the test that both languages have the same keys. */
export function keysOf(messages: object, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([k, v]) => (typeof v === "string" ? [`${prefix}${k}`] : keysOf(v as object, `${prefix}${k}.`)));
}

/** An exercise category as shown in the interface ("Warm-up" → "Calentamiento"). */
export function categoryLabel(category: string) {
  return t(`category.${category}` as MessageKey);
}

/** A sport as shown in the interface ("Tennis" → "Tenis"). */
export function sportLabel(sport: string) {
  return t(`sport.${sport}` as MessageKey);
}
