import { motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { BoothCard } from "./BoothCard";

interface Props {
  booths: Booth[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BoothGrid({ booths, selectedId, onSelect }: Props) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {booths.map((booth, i) => (
        <motion.div
          key={booth.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
        >
          <BoothCard
            booth={booth}
            selected={selectedId === booth.id}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}