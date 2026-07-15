import { motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { StatusBadge } from "./StatusBadge";

interface Props {
  booth: Booth;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function BoothCard({ booth, selected, onSelect }: Props) {
  const disabled = booth.status !== "available";

  return (
    <motion.button
      type="button"
      layout
      onClick={() => !disabled && onSelect(booth.id)}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      animate={{ scale: selected ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={[
        "group relative flex w-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-start transition-colors",
        "shadow-sm",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-slate-300",
        selected
          ? "border-slate-900 shadow-[0_0_0_4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900"
          : "border-slate-200",
      ].join(" ")}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Booth
        </span>
        <StatusBadge status={booth.status} />
      </div>

      <div className="text-2xl font-semibold tracking-tight text-foreground">
        {booth.id}
      </div>

      <div className="flex w-full items-end justify-between pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Price
          </div>
          <div className="text-base font-semibold text-foreground">
            ${booth.price.toLocaleString()}
          </div>
        </div>
        {selected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white"
          >
            Selected
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}