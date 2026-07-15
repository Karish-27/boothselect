import { AnimatePresence, motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { StatusBadge } from "./StatusBadge";
import { STATUS_STYLES } from "./statusStyles";

interface Props {
  booth: Booth;
  selected: boolean;
  onSelect: (id: string) => void;
  /** Roving-tabindex value set by the grid for keyboard navigation. */
  tabIndex?: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

const REST_SHADOW = "0 1px 2px rgba(15,23,42,0.05), 0 10px 20px -14px rgba(15,23,42,0.15)";
const HOVER_SHADOW = "0 1px 2px rgba(15,23,42,0.05), 0 18px 34px -16px rgba(15,23,42,0.28)";
// Selected reads as a physically lit stall: an emerald rim + soft green glow,
// not a heavy border.
const SELECTED_SHADOW = "0 0 0 2px rgba(16,185,129,0.55), 0 16px 34px -12px rgba(16,185,129,0.38)";

// Metallic look for the vertical frame rails — a bright center highlight
// between two darker edges fakes a rounded chrome pole.
const RAIL = "bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300";

// Open-front interior with depth: side-wall shading, a ceiling spotlight
// washing the back wall, and a floor gradient — layered in one paint.
const INTERIOR_BG = {
  background: [
    "linear-gradient(90deg, rgba(15,23,42,0.06), transparent 16%, transparent 84%, rgba(15,23,42,0.06))",
    "radial-gradient(72% 88% at 50% -6%, rgba(255,255,255,0.95), transparent 70%)",
    "linear-gradient(180deg, #f8fafc, #ffffff 62%)",
  ].join(","),
};

export function BoothCard({ booth, selected, onSelect, tabIndex, buttonRef }: Props) {
  const style = STATUS_STYLES[booth.status];
  const interactive = style.interactive;
  const isSold = booth.status === "sold";

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      layout
      tabIndex={tabIndex}
      onClick={() => interactive && onSelect(booth.id)}
      whileHover={
        interactive ? { y: -4, boxShadow: selected ? SELECTED_SHADOW : HOVER_SHADOW } : undefined
      }
      whileTap={interactive ? { scale: 0.985 } : undefined}
      animate={{
        scale: selected ? 1.01 : 1,
        boxShadow: selected ? SELECTED_SHADOW : REST_SHADOW,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={`group relative flex min-h-[10.5rem] w-full flex-col overflow-hidden rounded-2xl bg-white text-start sm:min-h-[13rem] ${
        interactive ? "cursor-pointer" : "cursor-not-allowed"
      }`}
      aria-pressed={selected}
      aria-disabled={!interactive}
      aria-label={`Booth ${booth.id}, ${style.label}, $${booth.price.toLocaleString()}`}
    >
      {/* Canopy / top fascia — status-colored, carries the booth ID */}
      <div className={`relative bg-gradient-to-b ${style.canopy} px-4 py-2 text-center sm:py-2.5`}>
        <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
        <span className="relative text-lg font-bold tracking-wide text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]">
          {booth.id}
        </span>

        {/* Selected stamp — a check badge on the fascia, clear of the price */}
        <AnimatePresence>
          {selected && (
            <motion.span
              key="selected-badge"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="absolute end-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-white text-emerald-600 shadow-sm"
              aria-hidden="true"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: 0.08 }}
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </motion.svg>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Open interior — lit back wall, frame rails, status sign */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 py-4 sm:py-6"
        style={INTERIOR_BG}
      >
        {/* Shadow cast by the canopy overhang */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/10 to-transparent" />
        {/* Ceiling light fixture */}
        <div className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-9 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.9)]" />
        {/* Vertical frame rails */}
        <div className={`absolute bottom-0 left-1.5 top-0 w-[3px] ${RAIL}`} />
        <div className={`absolute bottom-0 right-1.5 top-0 w-[3px] ${RAIL}`} />
        {/* Lower cross truss */}
        <div className="absolute inset-x-1.5 bottom-4 h-[3px] rounded-full bg-gradient-to-b from-slate-200 to-slate-300" />

        <div className="relative">
          <StatusBadge status={booth.status} />
        </div>
      </div>

      {/* Base / floor platform — carries the price */}
      <div className="relative bg-white px-4 py-2.5 text-center shadow-[inset_0_1px_0_rgba(15,23,42,0.08)] sm:py-3">
        <span
          className={`text-base font-bold ${
            isSold ? "text-rose-400 line-through decoration-rose-300" : "text-slate-900"
          }`}
        >
          ${booth.price.toLocaleString()}
        </span>
      </div>
    </motion.button>
  );
}
