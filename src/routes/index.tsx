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
    setBooths((prev) =>
      prev.map((b) => (ids.has(b.id) ? { ...b, status: "available" } : b)),
    );
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

  const handleSelect = (id: string) => {
    const booth = booths.find((b) => b.id === id);
    if (!booth || booth.status !== "available") return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleReserve = () => {
    if (!selectedBooth || selectedBooth.status !== "available") return;
    const id = selectedBooth.id;
    const end = Date.now() + selectedBooth.holdDuration * 1000;
    setBooths((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "reserved" } : b)),
    );
    setReservations((prev) => ({ ...prev, [id]: end }));
  };

  const handleClear = () => setSelectedId(null);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-foreground"
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-slate-200/70 bg-white/70 backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
              <span className="text-sm font-bold">B</span>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight tracking-tight">
                Booth Selector
              </h1>
              <p className="text-xs text-muted-foreground">
                Reserve your spot in seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {(["ltr", "rtl"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDir(d)}
                className={`relative rounded-full px-3 py-1 text-xs font-medium transition ${
                  dir === d ? "text-white" : "text-slate-600 hover:text-slate-900"
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

      <main className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick a booth
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Available booths are selectable. Reserve one to hold it for 30 seconds
            before it becomes available again.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <BoothGrid
            booths={booths}
            selectedId={selectedId}
            onSelect={handleSelect}
          />

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <SelectionPanel
                booth={selectedBooth}
                remainingSeconds={remainingSeconds}
                onReserve={handleReserve}
                onClear={handleClear}
              />
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {selectedBooth && (
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 shadow-2xl lg:hidden"
            >
              <div className="mx-auto max-w-lg">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200" />
                <SelectionPanel
                  booth={selectedBooth}
                  remainingSeconds={remainingSeconds}
                  onReserve={handleReserve}
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