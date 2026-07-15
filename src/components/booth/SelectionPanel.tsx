import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { StatusBadge } from "./StatusBadge";

interface Props {
  booth: Booth | null;
  remainingSeconds: number;
  /** True while a reserved booth's hold is still counting down, unconfirmed. */
  isHolding: boolean;
  onReserve: () => void;
  onConfirm: () => void;
  onClear: () => void;
}

/** Minimal exhibition-booth glyph, reused for the empty state and the ticket. */
function BoothGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9h18l-2-4H5L3 9z" />
      <line x1="5" y1="9" x2="5" y2="19" />
      <line x1="19" y1="9" x2="19" y2="19" />
      <path d="M5 14h14" />
      <path d="M3 19h18" />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ClockGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShieldCheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CircleCheckGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-4.5" />
    </svg>
  );
}

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <BoothGlyph className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">No booth selected</p>
        <p className="mx-auto max-w-[16rem] text-sm leading-relaxed text-slate-500">
          Pick an available booth from the floor plan to review it and hold your spot.
        </p>
      </div>
    </motion.div>
  );
}

function formatDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} • ${time}`;
}

/** Stable 13-digit reference number derived from the booth — display only. */
function ticketIdFor(booth: Booth) {
  const seed = `${booth.id}-${booth.price}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash.toString().padStart(13, "0").slice(0, 13);
}

/** Decorative barcode — bar widths derived from the ticket code's digits. */
function BarcodeBars({ code }: { code: string }) {
  return (
    <div className="flex h-10 items-stretch justify-center gap-[3px]" aria-hidden="true">
      {code.split("").map((digit, i) => (
        <div key={i} className="bg-slate-900" style={{ width: `${1 + (Number(digit) % 3)}px` }} />
      ))}
    </div>
  );
}

// Fixed ticket proportions (px). Real tickets are a deliberate, fixed
// template rather than fluid text — that's what lets the die-cut outline
// below be a single static geometry instead of something recomputed from
// measured layout.
const TICKET_WIDTH = 300;
const TICKET_HEADER_HEIGHT = 196;
const TICKET_DETAILS_HEIGHT = 224;
const TICKET_BARCODE_HEIGHT = 112;
const TICKET_HEIGHT = TICKET_HEADER_HEIGHT + TICKET_DETAILS_HEIGHT + TICKET_BARCODE_HEIGHT;
const TICKET_CORNER_RADIUS = 20;
const TICKET_NOTCH_RADIUS = 10;
// Y-offset of each tear line, i.e. the boundary between stacked sections.
const TICKET_NOTCH_Y = [TICKET_HEADER_HEIGHT, TICKET_HEADER_HEIGHT + TICKET_DETAILS_HEIGHT];

/**
 * Builds a `clip-path: path(...)` value tracing a real die-cut ticket
 * silhouette: a rounded rectangle with a semicircular notch punched inward
 * at each tear line, on both the left and right edges. The path is
 * traversed clockwise, which is why the four corners use sweep-flag 1
 * (they curve outward/convex) while the notches use sweep-flag 0 (they
 * curve inward/concave) — that sign flip is what makes a notch read as
 * physically removed from the shape rather than a circle drawn on top.
 */
function ticketClipPath({
  width: w,
  height: h,
  cornerRadius: r,
  notchRadius: n,
  notchYs,
}: {
  width: number;
  height: number;
  cornerRadius: number;
  notchRadius: number;
  notchYs: number[];
}) {
  const rightNotches = notchYs
    .map((y) => `L ${w} ${y - n} A ${n} ${n} 0 0 0 ${w} ${y + n}`)
    .join(" ");
  const leftNotches = [...notchYs]
    .reverse()
    .map((y) => `L 0 ${y + n} A ${n} ${n} 0 0 0 0 ${y - n}`)
    .join(" ");

  return (
    `path("M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w} ${r} ${rightNotches} ` +
    `L ${w} ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} ` +
    `A ${r} ${r} 0 0 1 0 ${h - r} ${leftNotches} ` +
    `L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 Z")`
  );
}

const TICKET_CLIP_PATH = ticketClipPath({
  width: TICKET_WIDTH,
  height: TICKET_HEIGHT,
  cornerRadius: TICKET_CORNER_RADIUS,
  notchRadius: TICKET_NOTCH_RADIUS,
  notchYs: TICKET_NOTCH_Y,
});

/** Ticket-style confirmation receipt shown once a hold is finalized. */
function ConfirmedTicket({ booth }: { booth: Booth }) {
  const [confirmedAt] = useState(() => Date.now());
  const ticketId = ticketIdFor(booth);

  return (
    <motion.div
      key={`ticket-${booth.id}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      // A plain `border` would ignore the clip-path and draw a rectangle
      // straight across the notches, so the outline and both elevation
      // shadows are all done as drop-shadow layers instead — drop-shadow
      // follows the element's real clipped alpha shape, border does not.
      // The outline is a slate-400 stroke stacked twice at a small blur to
      // read as a crisp line rather than a soft glow — strong enough to keep
      // the ticket from merging into the page / bottom-sheet background.
      className="mx-auto bg-gradient-to-b from-white to-slate-50 drop-shadow-[0_0_0.5px_#94a3b8] drop-shadow-[0_0_0.5px_#94a3b8] drop-shadow-[0_1px_2px_rgba(15,23,42,0.06)] drop-shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
      style={{
        width: TICKET_WIDTH,
        height: TICKET_HEIGHT,
        clipPath: TICKET_CLIP_PATH,
        WebkitClipPath: TICKET_CLIP_PATH,
      }}
    >
      <div
        className="flex flex-col items-center justify-center px-7 text-center"
        style={{ height: TICKET_HEADER_HEIGHT }}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckGlyph className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
          Reservation confirmed
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Booth {booth.id} has been reserved successfully
        </p>
      </div>

      {/* Tear line — sits exactly at the notch's Y offset since it has no
          padding/content of its own (only its border), so it can't push
          the section below out of alignment with the die-cut geometry. */}
      <div className="mx-7 border-t border-dotted border-slate-300" />

      <div
        className="flex flex-col justify-center gap-4 px-7 text-left"
        style={{ height: TICKET_DETAILS_HEIGHT }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Ticket ID</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{ticketId}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Amount</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              ${booth.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Date &amp; time
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {formatDateTime(confirmedAt)}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-100/70 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-slate-500 shadow-sm">
            <BoothGlyph className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Booth {booth.id}</div>
            <div className="text-xs text-slate-500">{booth.holdDuration}s hold, confirmed</div>
          </div>
        </div>
      </div>

      <div className="mx-7 border-t border-dotted border-slate-300" />

      <div
        className="flex flex-col items-center justify-center bg-slate-50/70"
        style={{ height: TICKET_BARCODE_HEIGHT }}
      >
        <BarcodeBars code={ticketId} />
        <div className="mt-2 font-mono text-xs tracking-[0.3em] text-slate-400">
          {ticketId.slice(0, 6)} {ticketId.slice(6)}
        </div>
      </div>
    </motion.div>
  );
}

export function SelectionPanel({
  booth,
  remainingSeconds,
  isHolding,
  onReserve,
  onConfirm,
  onClear,
}: Props) {
  const isReserved = booth?.status === "reserved";
  const isUrgent = isReserved && isHolding && remainingSeconds <= 10;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Your selection
        </h2>
        {booth && (
          <button
            onClick={onClear}
            className="rounded-md text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!booth ? (
          <EmptyState />
        ) : isReserved && !isHolding ? (
          <ConfirmedTicket booth={booth} />
        ) : (
          <motion.div
            key={booth.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between p-5">
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Booth
                </span>
                <div className="text-3xl font-semibold leading-none tracking-tight text-slate-900">
                  {booth.id}
                </div>
              </div>
              <StatusBadge status={booth.status} />
            </div>

            <div className="grid grid-cols-2 border-t border-slate-100">
              <div className="p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Price
                </div>
                <div className="mt-1.5 text-lg font-semibold text-slate-900">
                  ${booth.price.toLocaleString()}
                </div>
              </div>
              <div className="border-l border-slate-100 p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Hold time
                </div>
                <div className="mt-1.5 text-lg font-semibold text-slate-900">
                  {booth.holdDuration}s
                </div>
              </div>
            </div>

            {/* Reservation hints — shown before reserving; once held, the
                "Held for you" block below covers the same ground. Animated
                height so it collapses in sync with the hold block expanding,
                which keeps the mobile bottom sheet from snapping/jittering. */}
            <AnimatePresence initial={false}>
              {!isReserved && (
                <motion.ul
                  key="hints"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 overflow-hidden border-t border-slate-100 px-5 py-5 text-sm text-slate-500"
                >
                  <li className="flex items-start gap-3">
                    <ClockGlyph className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>You have {booth.holdDuration} seconds to confirm your reservation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheckGlyph className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>Your booth is released automatically once the timer ends.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CircleCheckGlyph className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>Only one booth can be reserved at a time.</span>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isReserved && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-100 p-5"
                >
                  <div
                    className={`rounded-xl p-4 ring-1 transition-colors ${
                      isUrgent ? "bg-rose-50 ring-rose-100" : "bg-amber-50 ring-amber-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white shadow-sm ${
                            isUrgent ? "text-rose-600" : "text-amber-600"
                          }`}
                        >
                          <LockGlyph className="h-4 w-4" />
                        </div>
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              isUrgent ? "text-rose-900" : "text-amber-900"
                            }`}
                          >
                            Held for you
                          </div>
                          <div
                            className={`text-xs ${
                              isUrgent ? "text-rose-700/70" : "text-amber-700/70"
                            }`}
                          >
                            Confirm before the hold expires
                          </div>
                        </div>
                      </div>

                      {/* Only the seconds animate on each tick; the minutes and
                          colon stay put so the whole clock doesn't slide. */}
                      <div
                        className={`flex h-8 shrink-0 items-center justify-end font-mono text-2xl font-semibold tabular-nums ${
                          isUrgent ? "animate-urgency-pulse text-rose-600" : "text-amber-800"
                        }`}
                      >
                        <span>{Math.floor(remainingSeconds / 60)}:</span>
                        <div className="relative h-8 w-[2ch] overflow-hidden">
                          <AnimatePresence initial={false}>
                            <motion.span
                              key={remainingSeconds % 60}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute inset-0 flex items-center justify-start"
                            >
                              {(remainingSeconds % 60).toString().padStart(2, "0")}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mt-3 h-1.5 overflow-hidden rounded-full ${
                        isUrgent ? "bg-rose-100" : "bg-amber-100"
                      }`}
                    >
                      <motion.div
                        className={`h-full rounded-full ${
                          isUrgent ? "bg-rose-500" : "bg-amber-500"
                        }`}
                        initial={false}
                        animate={{
                          width: `${(remainingSeconds / booth.holdDuration) * 100}%`,
                        }}
                        transition={{ ease: "linear", duration: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-slate-100 p-5">
              <AnimatePresence mode="wait" initial={false}>
                {!isReserved ? (
                  <motion.button
                    key="reserve"
                    onClick={onReserve}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Reserve booth
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">
                      →
                    </span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="confirm"
                    onClick={onConfirm}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${
                      isUrgent ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    <CheckGlyph className="h-4 w-4" />
                    Confirm reservation
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
