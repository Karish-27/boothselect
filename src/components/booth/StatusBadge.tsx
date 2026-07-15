import { motion } from "motion/react";
import type { BoothStatus } from "@/types/booth";
import { STATUS_STYLES } from "./statusStyles";

export function StatusBadge({ status }: { status: BoothStatus }) {
  const s = STATUS_STYLES[status];

  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-label={`Status: ${s.label}`}
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${s.tag}`}
    >
      {s.label}
    </motion.span>
  );
}
