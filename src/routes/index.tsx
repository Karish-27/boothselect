import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { INITIAL_BOOTHS } from "@/data/booths";
import type { Booth } from "@/types/booth";
import { BoothGrid } from "@/components/booth/BoothGrid";
import { SelectionPanel } from "@/components/booth/SelectionPanel";
import { useNow } from "@/hooks/useNow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booth Selector — Reserve Your Spot" },
      {
        name: "description",
        content:
          "Interactive booth selector with real-time reservations, live countdowns, and RTL support.",
      },
      { property: "og:title", content: "Booth Selector" },
      {
        property: "og:description",
        content: "Pick and reserve a booth with a 30-second hold.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [booths, setBooths] = useState<Booth[]>(INITIAL_BOOTHS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Record<string, number>>({});
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  const hasActiveReservations = Object.keys(reservations).length > 0;
  const now = useNow(500, hasActiveReservations);

  useEffect(() => {
    if (!hasActiveReservations) return;
    const expired = Object.entries(reservations).filter(([, end]) => end <= now);
    if (expired.length === 0) return;
    const ids = new Set(expired.map(([id]) => id));
    setBooths((prev) => prev.map((b) => (ids.has(b.id) ? { ...b, status: "available" } : b)));
    setReservations((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  }, [now, reservations, hasActiveReservations]);

  const selectedBooth = useMemo(
    () => booths.find((b) => b.id === selectedId) ?? null,
    [booths, selectedId],
  );

  const remainingSeconds = useMemo(() => {
    if (!selectedBooth) return 0;
    const end = reservations[selectedBooth.id];
    if (!end) return selectedBooth.holdDuration;
    return Math.max(0, Math.ceil((end - now) / 1000));
  }, [selectedBooth, reservations, now]);

  // True while a reserved booth's hold is still counting down and unconfirmed.
  // Confirming removes the reservation entry so the expiry effect leaves the
  // booth's "reserved" status alone permanently.
  const isHolding = !!selectedBooth && selectedBooth.id in reservations;

  const handleSelect = (id: string) => {
    const booth = booths.find((b) => b.id === id);
    if (!booth || booth.status !== "available") return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleReserve = () => {
    if (!selectedBooth || selectedBooth.status !== "available") return;
    const id = selectedBooth.id;
    const end = Date.now() + selectedBooth.holdDuration * 1000;
    setBooths((prev) => prev.map((b) => (b.id === id ? { ...b, status: "reserved" } : b)));
    setReservations((prev) => ({ ...prev, [id]: end }));
  };

  const handleConfirm = () => {
    if (!selectedBooth || !isHolding) return;
    const id = selectedBooth.id;
    setReservations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleClear = () => setSelectedId(null);

  return (
    <div dir={dir} className="min-h-screen bg-slate-100 text-slate-900">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-30 border-b border-slate-200 bg-white"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
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
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight tracking-tight">Booth Selector</h1>
              <p className="text-xs text-slate-500">Reserve your spot in seconds</p>
            </div>
          </div>
          <div
            role="group"
            aria-label="Text direction"
            className="flex items-center gap-0.5 rounded-full bg-slate-100 p-0.5"
          >
            {(["ltr", "rtl"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDir(d)}
                aria-pressed={dir === d}
                aria-label={d === "ltr" ? "Left to right" : "Right to left"}
                className={`relative rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors ${
                  dir === d ? "text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {dir === d && (
                  <motion.span
                    layoutId="dir-pill"
                    className="absolute inset-0 rounded-full bg-slate-900"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{d.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 max-w-2xl"
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pick a booth</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Available booths are selectable. Reserve one to hold it for 30 seconds before it returns
            to the floor.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-10">
          {/* The booth floor scrolls within the viewport; a taller panel (e.g.
              the confirmed receipt) instead grows the page so it can be fully
              scrolled to, with the sticky panel following along. */}
          <div className="no-scrollbar lg:max-h-[calc(100vh-13rem)] lg:overflow-y-auto lg:px-1 lg:pb-2">
            <BoothGrid booths={booths} selectedId={selectedId} onSelect={handleSelect} />
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <SelectionPanel
              booth={selectedBooth}
              remainingSeconds={remainingSeconds}
              isHolding={isHolding}
              onReserve={handleReserve}
              onConfirm={handleConfirm}
              onClear={handleClear}
            />
          </aside>
        </div>

        <AnimatePresence>
          {selectedBooth && (
            <motion.div
              key="sheet"
              // Draggable bottom sheet: follows the finger on the y-axis and
              // springs back to rest, or dismisses if flicked/dragged down far
              // enough. dragMomentum off keeps the release from overshooting.
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.5 }}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) handleClear();
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-40 touch-none rounded-t-3xl border-t border-slate-200 bg-slate-100 p-5 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.2)] lg:hidden"
            >
              <div className="mx-auto max-w-lg">
                <div className="mx-auto mb-4 h-1.5 w-12 cursor-grab rounded-full bg-slate-300 active:cursor-grabbing" />
                <SelectionPanel
                  booth={selectedBooth}
                  remainingSeconds={remainingSeconds}
                  isHolding={isHolding}
                  onReserve={handleReserve}
                  onConfirm={handleConfirm}
                  onClear={handleClear}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedBooth && <div className="h-64 lg:hidden" />}
      </main>
    </div>
  );
}
