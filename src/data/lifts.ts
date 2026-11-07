// Lifts (carpool) for a session (D-076): offer seats, join or leave an offer, ask for a lift, and a driver
// taking someone who asked. Pure functions, no React (unit tested). The demo store keeps the result in this
// browser only; nobody is notified.

import { t } from "@/i18n";
export const MAX_SEATS = 8;
export const NOTE_MAX = 120;

/** A car going to a session: who drives, how many free seats, when it leaves, a note and who is in it. */
export type LiftOffer = {
  id: string;
  sessionId: string;
  driverId: string;
  /** Free seats offered, 1–8 (passengers included). */
  seats: number;
  /** "HH:MM", 24-hour. */
  departure: string;
  note: string;
  passengerIds: string[];
};

/** Someone who needs a lift to a session, with a short note ("from Son Ferrer"). */
export type LiftRequest = { id: string; sessionId: string; personId: string; note: string };

export type Lifts = { offers: LiftOffer[]; requests: LiftRequest[] };

export const NO_LIFTS: Lifts = { offers: [], requests: [] };

export type OfferInput = { seats: number; departure: string; note: string };
export type OfferErrors = { seats?: string; departure?: string; note?: string };

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateOffer(input: OfferInput): OfferErrors {
  const errors: OfferErrors = {};
  if (!Number.isInteger(input.seats) || input.seats < 1 || input.seats > MAX_SEATS) errors.seats = t("lifts.errorSeats", { max: MAX_SEATS });
  if (!TIME.test(input.departure)) errors.departure = t("lifts.errorDeparture");
  if (input.note.trim().length > NOTE_MAX) errors.note = t("lifts.errorNote", { max: NOTE_MAX });
  return errors;
}

/** The free seats left in an offer. */
export function seatsLeft(offer: LiftOffer) {
  return Math.max(0, offer.seats - offer.passengerIds.length);
}

/** The offers and requests of one session, offers by departure time. */
export function liftsFor(lifts: Lifts, sessionId: string) {
  return {
    offers: lifts.offers.filter((o) => o.sessionId === sessionId).sort((a, b) => a.departure.localeCompare(b.departure)),
    requests: lifts.requests.filter((r) => r.sessionId === sessionId),
  };
}

/** Whether a person already drives, rides or asked for a lift to a session. */
export function roleIn(lifts: Lifts, sessionId: string, personId: string) {
  const { offers, requests } = liftsFor(lifts, sessionId);
  return {
    driving: offers.find((o) => o.driverId === personId),
    riding: offers.find((o) => o.passengerIds.includes(personId)),
    asking: requests.find((r) => r.personId === personId),
  };
}

const withoutPerson = (lifts: Lifts, sessionId: string, personId: string): Lifts => ({
  offers: lifts.offers.map((o) => (o.sessionId === sessionId && o.passengerIds.includes(personId) ? { ...o, passengerIds: o.passengerIds.filter((p) => p !== personId) } : o)),
  requests: lifts.requests.filter((r) => !(r.sessionId === sessionId && r.personId === personId)),
});

/**
 * Offers a lift. One offer per driver and session (a second one replaces the first, keeping its passengers
 * that still fit); the driver stops riding with or asking someone else. Invalid input changes nothing.
 */
export function offerLift(lifts: Lifts, sessionId: string, driverId: string, input: OfferInput, id: string): Lifts {
  if (Object.keys(validateOffer(input)).length > 0) return lifts;
  const existing = roleIn(lifts, sessionId, driverId).driving;
  const base = withoutPerson(lifts, sessionId, driverId);
  const offer: LiftOffer = {
    id: existing?.id ?? id,
    sessionId,
    driverId,
    seats: input.seats,
    departure: input.departure,
    note: input.note.trim(),
    passengerIds: (existing?.passengerIds ?? []).slice(0, input.seats),
  };
  return { ...base, offers: [...base.offers.filter((o) => o.id !== offer.id), offer] };
}

/** Joins an offer (one seat). Nothing changes when it is full, it is the person's own car, or the offer is gone. */
export function joinLift(lifts: Lifts, offerId: string, personId: string): Lifts {
  const offer = lifts.offers.find((o) => o.id === offerId);
  if (!offer || offer.driverId === personId || offer.passengerIds.includes(personId) || seatsLeft(offer) === 0) return lifts;
  if (roleIn(lifts, offer.sessionId, personId).driving) return lifts;
  const base = withoutPerson(lifts, offer.sessionId, personId);
  return { ...base, offers: base.offers.map((o) => (o.id === offerId ? { ...o, passengerIds: [...o.passengerIds, personId] } : o)) };
}

/** Leaves an offer again. */
export function leaveLift(lifts: Lifts, offerId: string, personId: string): Lifts {
  return { ...lifts, offers: lifts.offers.map((o) => (o.id === offerId ? { ...o, passengerIds: o.passengerIds.filter((p) => p !== personId) } : o)) };
}

/** The driver removes their offer. Only the driver can. */
export function removeOffer(lifts: Lifts, offerId: string, byId: string): Lifts {
  const offer = lifts.offers.find((o) => o.id === offerId);
  if (!offer || offer.driverId !== byId) return lifts;
  return { ...lifts, offers: lifts.offers.filter((o) => o.id !== offerId) };
}

/** "Need a lift": one request per person and session; not for someone who already drives or rides. */
export function requestLift(lifts: Lifts, sessionId: string, personId: string, note: string, id: string): Lifts {
  const role = roleIn(lifts, sessionId, personId);
  if (role.driving || role.riding || note.trim().length > NOTE_MAX) return lifts;
  const request: LiftRequest = { id: role.asking?.id ?? id, sessionId, personId, note: note.trim() };
  return { ...lifts, requests: [...lifts.requests.filter((r) => r.id !== request.id), request] };
}

/** Withdraws a request. */
export function cancelRequest(lifts: Lifts, requestId: string, byId: string): Lifts {
  return { ...lifts, requests: lifts.requests.filter((r) => !(r.id === requestId && r.personId === byId)) };
}

/** "I can take you": the driver moves the person who asked into their car, if a seat is free. */
export function takeRequest(lifts: Lifts, offerId: string, requestId: string, byId: string): Lifts {
  const offer = lifts.offers.find((o) => o.id === offerId);
  const request = lifts.requests.find((r) => r.id === requestId);
  if (!offer || !request || offer.driverId !== byId || offer.sessionId !== request.sessionId) return lifts;
  return joinLift(lifts, offerId, request.personId);
}

/**
 * Example lifts for the demo (D-076): on each given session, one member offers three seats with one passenger
 * already in, and another member asks for a lift. Ids come from the session, so the result is stable.
 */
export function seedLifts(sessions: { id: string; time: string; memberIds: string[] }[]): Lifts {
  const offers: LiftOffer[] = [];
  const requests: LiftRequest[] = [];
  for (const s of sessions) {
    const [driver, passenger, asking] = s.memberIds;
    if (!driver || !passenger || !asking) continue;
    const [h, m] = s.time.split(":").map(Number);
    const leave = Math.max(0, h * 60 + m - 30);
    const departure = `${String(Math.floor(leave / 60)).padStart(2, "0")}:${String(leave % 60).padStart(2, "0")}`;
    offers.push({ id: `lift-${s.id}`, sessionId: s.id, driverId: driver, seats: 3, departure, note: "Leaving from the club car park.", passengerIds: [passenger] });
    requests.push({ id: `ask-${s.id}`, sessionId: s.id, personId: asking, note: "From the town centre, if anyone passes by." });
  }
  return { offers, requests };
}

const isString = (v: unknown): v is string => typeof v === "string";

/** Lifts read back from this browser: anything malformed is left out (D-069). */
export function normaliseLifts(value: unknown): Lifts {
  if (typeof value !== "object" || value === null) return NO_LIFTS;
  const v = value as Partial<Record<keyof Lifts, unknown>>;
  const offers = Array.isArray(v.offers)
    ? v.offers.filter(
        (o): o is LiftOffer =>
          typeof o === "object" && o !== null &&
          isString(o.id) && isString(o.sessionId) && isString(o.driverId) && isString(o.note) &&
          Number.isInteger(o.seats) && o.seats >= 1 && o.seats <= MAX_SEATS && TIME.test(o.departure) &&
          Array.isArray(o.passengerIds) && o.passengerIds.every(isString),
      )
    : [];
  const requests = Array.isArray(v.requests)
    ? v.requests.filter((r): r is LiftRequest => typeof r === "object" && r !== null && isString(r.id) && isString(r.sessionId) && isString(r.personId) && isString(r.note))
    : [];
  return { offers, requests };
}
