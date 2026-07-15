import { AnimatePresence, motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { StatusBadge } from "./StatusBadge";

interface Props {
  booth: Booth | null;
  remainingSeconds: number;
  onReserve: () => void;
  onClear: () => void;
}

function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center"
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <div className="h-3 w-3 rounded-sm bg-slate-300" />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">No booth selected</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap an available booth to see details and reserve it.
        </p>
      </div>
    </motion.div>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SelectionPanel({ booth, remainingSeconds, onReserve, onClear }: Props) {
  const isReserved = booth?.status === "reserved";

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Selection
        </h2>
        {booth && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!booth ? (
          <EmptyState />
        ) : (
          <motion.div
            key={booth.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm"
          >
            <div className="bg-gradient-to-br from-slate-50 to-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Booth
                </span>
                <StatusBadge status={booth.status} />
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">{booth.id}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 p-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Price
                </div>
                <div className="mt-1 text-lg font-semibold">
                  ${booth.price.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Hold
                </div>
                <div className="mt-1 text-lg font-semibold">{booth.holdDuration}s</div>
              </div>
            </div>

            <AnimatePresence>
              {isReserved && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-100 bg-amber-50/60 px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-800">
                      Reservation expires in
                    </span>
                    <motion.span
                      key={remainingSeconds}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-lg font-semibold text-amber-900"
                    >
                      {fmt(remainingSeconds)}
                    </motion.span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/60">
                    <motion.div
                      className="h-full bg-amber-500"
                      initial={false}
                      animate={{
                        width: `${(remainingSeconds / booth.holdDuration) * 100}%`,
                      }}
                      transition={{ ease: "linear", duration: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-slate-100 p-5">
              <button
                onClick={onReserve}
                disabled={isReserved}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isReserved ? "Reserved" : "Reserve Booth"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}