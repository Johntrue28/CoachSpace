"use client";

import { useState } from "react";
import type { Session } from "@/data/types";
import { coach, participantById } from "@/data/groups";
import { COACH_SENDER_ID } from "@/data/messages";
import { newId, useDemoStore } from "@/data/store";
import {
  MAX_SEATS,
  NOTE_MAX,
  cancelRequest,
  joinLift,
  leaveLift,
  liftsFor,
  offerLift,
  removeOffer,
  requestLift,
  roleIn,
  seatsLeft,
  takeRequest,
  validateOffer,
  type OfferErrors,
} from "@/data/lifts";
import { inputClass } from "@/components/Form";
import { CarIcon } from "@/components/Icons";
import { buttonClass } from "@/components/ui/Button";
import { cardClass } from "@/components/ui/Card";

const nameOf = (id: string) => (id === COACH_SENDER_ID ? coach.name : (participantById(id)?.name ?? "Someone"));
const firstName = (id: string) => nameOf(id).split(" ")[0];
const small = "inline-flex min-h-11 items-center justify-center rounded-control px-3 text-sm font-semibold";

/** Thirty minutes before the session, as a starting departure time. */
function defaultDeparture(time: string) {
  const [h, m] = time.split(":").map(Number);
  const t = Math.max(0, h * 60 + m - 30);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * Lifts (carpool) at the bottom of a session, for the coach and the players (D-076): offer seats, join or leave a
 * car, ask for a lift, and "I can take you". Simulated: saved in this browser only, nobody is notified.
 */
export default function LiftsSection({ session, viewerId }: { session: Session; viewerId: string }) {
  const { lifts, ready, updateLifts } = useDemoStore();
  const [form, setForm] = useState<"offer" | "ask" | null>(null);
  const [seats, setSeats] = useState(3);
  const [departure, setDeparture] = useState(() => defaultDeparture(session.time));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<OfferErrors>({});
  if (!ready) return null;

  const { offers, requests } = liftsFor(lifts, session.id);
  const me = roleIn(lifts, session.id, viewerId);
  const empty = offers.length === 0 && requests.length === 0;
  const close = () => {
    setForm(null);
    setNote("");
    setErrors({});
  };

  return (
    <section aria-labelledby="lifts-heading" className={cardClass({ className: "mt-4" })}>
      <h2 id="lifts-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
        <CarIcon className="h-5 w-5 text-ink-soft" /> Lifts
      </h2>
      <p className="mt-0.5 text-xs text-ink-soft">Demo: saved in this browser only — nobody is notified.</p>

      {empty && <p className="mt-3 text-sm text-ink-soft">No lifts yet.</p>}

      {offers.length > 0 && (
        <ul className="mt-3 space-y-3" aria-label="Cars">
          {offers.map((o) => {
            const left = seatsLeft(o);
            const mine = o.driverId === viewerId;
            const inside = o.passengerIds.includes(viewerId);
            return (
              <li key={o.id} className="rounded-control bg-surface p-3 ring-1 ring-line">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{mine ? "Your car" : nameOf(o.driverId)}</p>
                    <p className="text-sm text-ink">
                      <span className="text-lg font-bold tabular-nums">{left}</span> seat{left === 1 ? "" : "s"} left · leaves{" "}
                      <span className="font-semibold tabular-nums">{o.departure}</span>
                    </p>
                    {o.note && <p className="mt-0.5 text-sm text-ink-soft">{o.note}</p>}
                    {o.passengerIds.length > 0 && (
                      <p className="mt-1 text-xs text-ink-soft">With {o.passengerIds.map((p) => (p === viewerId ? "you" : firstName(p))).join(", ")}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {mine ? (
                      <button type="button" onClick={() => updateLifts((l) => removeOffer(l, o.id, viewerId))} className={`${small} text-danger hover:bg-card`}>
                        Remove offer
                      </button>
                    ) : inside ? (
                      <button type="button" onClick={() => updateLifts((l) => leaveLift(l, o.id, viewerId))} className={`${small} text-brand-strong ring-1 ring-line hover:bg-card`}>
                        Leave
                      </button>
                    ) : left === 0 ? (
                      <span className={`${small} text-ink-soft`}>Full</span>
                    ) : (
                      !me.driving && (
                        <button type="button" onClick={() => updateLifts((l) => joinLift(l, o.id, viewerId))} className={buttonClass({ size: "sm", className: "min-h-11" })}>
                          Join
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {requests.length > 0 && (
        <ul className="mt-3 divide-y divide-line" aria-label="Need a lift">
          {requests.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <p className="min-w-0 text-sm text-ink">
                <span className="font-semibold">{r.personId === viewerId ? "You" : nameOf(r.personId)}</span> need{r.personId === viewerId ? "" : "s"} a lift
                {r.note && <span className="text-ink-soft"> · {r.note}</span>}
              </p>
              {r.personId === viewerId ? (
                <button type="button" onClick={() => updateLifts((l) => cancelRequest(l, r.id, viewerId))} className={`${small} shrink-0 text-brand-strong hover:bg-surface`}>
                  Withdraw
                </button>
              ) : (
                me.driving &&
                seatsLeft(me.driving) > 0 && (
                  <button
                    type="button"
                    onClick={() => updateLifts((l) => takeRequest(l, me.driving!.id, r.id, viewerId))}
                    className={`${small} shrink-0 text-brand-strong ring-1 ring-line hover:bg-surface`}
                  >
                    I can take you
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}

      {form === "offer" ? (
        <form
          className="mt-4 space-y-3 border-t border-line pt-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const input = { seats, departure, note };
            const next = validateOffer(input);
            setErrors(next);
            if (Object.keys(next).length > 0) return;
            updateLifts((l) => offerLift(l, session.id, viewerId, input, newId("lift")));
            close();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">
              Free seats
              <select value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={`${inputClass} mt-1.5 font-normal`}>
                {Array.from({ length: MAX_SEATS }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Leaves at
              <input type="time" value={departure} onChange={(e) => setDeparture(e.target.value)} className={`${inputClass} mt-1.5 font-normal`} />
            </label>
          </div>
          {errors.seats && (
            <p role="alert" className="text-sm text-danger">
              {errors.seats}
            </p>
          )}
          {errors.departure && (
            <p role="alert" className="text-sm text-danger">
              {errors.departure}
            </p>
          )}
          <label className="block text-sm font-semibold">
            Note (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} placeholder="e.g. leaving from the school" className={`${inputClass} mt-1.5 font-normal`} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className={buttonClass({ variant: "secondary" })}>
              Cancel
            </button>
            <button type="submit" className={buttonClass()}>
              Offer seats
            </button>
          </div>
        </form>
      ) : form === "ask" ? (
        <form
          className="mt-4 space-y-3 border-t border-line pt-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            updateLifts((l) => requestLift(l, session.id, viewerId, note, newId("ask")));
            close();
          }}
        >
          <label className="block text-sm font-semibold">
            Where from? (optional)
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} placeholder="e.g. from Son Ferrer" className={`${inputClass} mt-1.5 font-normal`} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className={buttonClass({ variant: "secondary" })}>
              Cancel
            </button>
            <button type="submit" className={buttonClass()}>
              Ask for a lift
            </button>
          </div>
        </form>
      ) : (
        !me.driving &&
        !me.riding && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setForm("offer")} className={buttonClass({ variant: "secondary" })}>
              Offer a lift
            </button>
            {!me.asking && (
              <button type="button" onClick={() => setForm("ask")} className={buttonClass({ variant: "secondary" })}>
                Need a lift
              </button>
            )}
          </div>
        )
      )}
    </section>
  );
}
