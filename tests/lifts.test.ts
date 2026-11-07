// Lifts (carpool) per session (src/data/lifts.ts), D-076.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  NO_LIFTS,
  cancelRequest,
  joinLift,
  leaveLift,
  liftsFor,
  normaliseLifts,
  offerLift,
  removeOffer,
  requestLift,
  roleIn,
  seatsLeft,
  seedLifts,
  takeRequest,
  validateOffer,
} from "@/data/lifts";

const S = "g1-2026-10-14";
const offer = (seats = 2) => ({ seats, departure: "17:15", note: " From the school " });
const withOffer = (seats = 2) => offerLift(NO_LIFTS, S, "ana", offer(seats), "o1");

describe("offering a lift", () => {
  test("checks seats (1–8), the departure time and the note", () => {
    assert.deepEqual(validateOffer(offer()), {});
    assert.ok(validateOffer({ ...offer(), seats: 0 }).seats);
    assert.ok(validateOffer({ ...offer(), seats: 9 }).seats);
    assert.ok(validateOffer({ ...offer(), departure: "7pm" }).departure);
    assert.ok(validateOffer({ ...offer(), note: "x".repeat(121) }).note);
    assert.equal(offerLift(NO_LIFTS, S, "ana", { ...offer(), seats: 0 }, "o1"), NO_LIFTS, "invalid input changes nothing");
  });
  test("an offer shows the seats left; the note is trimmed", () => {
    const lifts = withOffer(3);
    const [o] = liftsFor(lifts, S).offers;
    assert.deepEqual([o.driverId, o.seats, o.departure, o.note, seatsLeft(o)], ["ana", 3, "17:15", "From the school", 3]);
    assert.deepEqual(liftsFor(lifts, "other").offers, []);
  });
  test("offering again replaces the driver's offer and keeps passengers that still fit", () => {
    let lifts = joinLift(joinLift(withOffer(3), "o1", "ben"), "o1", "cleo");
    lifts = offerLift(lifts, S, "ana", { ...offer(1), departure: "17:30" }, "o2");
    assert.equal(lifts.offers.length, 1);
    assert.deepEqual([lifts.offers[0].id, lifts.offers[0].departure, lifts.offers[0].passengerIds], ["o1", "17:30", ["ben"]]);
  });
  test("a driver stops asking for a lift or riding with someone else", () => {
    let lifts = requestLift(withOffer(), S, "ben", "From town", "r1");
    lifts = offerLift(lifts, S, "ben", offer(), "o2");
    assert.equal(roleIn(lifts, S, "ben").asking, undefined);
    assert.equal(roleIn(lifts, S, "ben").driving?.id, "o2");
  });
  test("only the driver removes an offer", () => {
    assert.equal(removeOffer(withOffer(), "o1", "ben").offers.length, 1);
    assert.equal(removeOffer(withOffer(), "o1", "ana").offers.length, 0);
  });
});

describe("joining and leaving", () => {
  test("joining takes one seat; a full offer takes nobody else", () => {
    let lifts = joinLift(withOffer(1), "o1", "ben");
    assert.equal(seatsLeft(lifts.offers[0]), 0);
    assert.equal(joinLift(lifts, "o1", "cleo"), lifts, "full");
    lifts = leaveLift(lifts, "o1", "ben");
    assert.equal(seatsLeft(lifts.offers[0]), 1);
  });
  test("nobody joins their own car or two cars; joining ends the person's request", () => {
    let lifts = offerLift(withOffer(2), S, "dan", offer(2), "o2");
    assert.equal(joinLift(lifts, "o1", "ana"), lifts, "own car");
    assert.equal(joinLift(lifts, "o1", "dan"), lifts, "a driver does not ride");
    lifts = requestLift(lifts, S, "ben", "", "r1");
    lifts = joinLift(lifts, "o1", "ben");
    assert.equal(roleIn(lifts, S, "ben").asking, undefined);
    lifts = joinLift(lifts, "o2", "ben");
    assert.deepEqual(lifts.offers.map((o) => o.passengerIds), [[], ["ben"]], "moved to the other car");
  });
});

describe("needing a lift", () => {
  test("one request per person; not for drivers or passengers; can be withdrawn", () => {
    let lifts = requestLift(withOffer(), S, "ben", " From Son Ferrer ", "r1");
    lifts = requestLift(lifts, S, "ben", "From the beach", "r2");
    assert.deepEqual(lifts.requests.map((r) => [r.id, r.note]), [["r1", "From the beach"]]);
    assert.equal(requestLift(lifts, S, "ana", "", "r3"), lifts, "the driver does not ask");
    assert.equal(cancelRequest(lifts, "r1", "cleo").requests.length, 1, "only the person who asked withdraws");
    assert.equal(cancelRequest(lifts, "r1", "ben").requests.length, 0);
  });
  test("I can take you: the driver moves the person who asked into the car", () => {
    let lifts = requestLift(withOffer(1), S, "ben", "", "r1");
    assert.equal(takeRequest(lifts, "o1", "r1", "cleo"), lifts, "only the driver");
    lifts = takeRequest(lifts, "o1", "r1", "ana");
    assert.deepEqual([lifts.offers[0].passengerIds, lifts.requests.length], [["ben"], 0]);
    const more = requestLift(lifts, S, "cleo", "", "r2");
    assert.equal(takeRequest(more, "o1", "r2", "ana"), more, "no seat left");
  });
});

describe("seed and saved data", () => {
  test("example lifts: an offer with one passenger leaving 30 minutes before, and a request", () => {
    const lifts = seedLifts([{ id: S, time: "17:00", memberIds: ["a", "b", "c", "d"] }, { id: "x", time: "08:00", memberIds: ["a"] }]);
    assert.deepEqual(lifts.offers.map((o) => [o.sessionId, o.driverId, o.departure, o.passengerIds, seatsLeft(o)]), [[S, "a", "16:30", ["b"], 2]]);
    assert.deepEqual(lifts.requests.map((r) => [r.sessionId, r.personId]), [[S, "c"]]);
  });
  test("malformed saved lifts are left out", () => {
    const good = withOffer();
    assert.deepEqual(normaliseLifts(good), good);
    assert.deepEqual(normaliseLifts({ offers: [{ id: 1 }, { ...good.offers[0], seats: 12 }], requests: "x" }), NO_LIFTS);
    assert.deepEqual(normaliseLifts(null), NO_LIFTS);
  });
});
