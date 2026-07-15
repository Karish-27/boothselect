import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { Booth } from "@/types/booth";
import { BoothCard } from "./BoothCard";

interface Props {
  booths: Booth[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BoothGrid({ booths, selectedId, onSelect }: Props) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Roving tabindex: only one card is in the tab order at a time; arrow keys
  // move focus across the floor plan (including sold/blocked booths).
  const [activeIndex, setActiveIndex] = useState(0);

  const focusAt = (index: number) => {
    const clamped = (index + booths.length) % booths.length;
    setActiveIndex(clamped);
    btnRefs.current[clamped]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtl = (e.currentTarget.closest("[dir]") as HTMLElement | null)?.dir === "rtl";
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusAt(activeIndex + (rtl ? -1 : 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusAt(activeIndex + (rtl ? 1 : -1));
        break;
      case "ArrowDown":
        e.preventDefault();
        focusAt(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(booths.length - 1);
        break;
    }
  };

  return (
    <motion.div
      layout
      role="listbox"
      aria-label="Available booths"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3"
    >
      {booths.map((booth, i) => (
        <motion.div
          key={booth.id}
          role="option"
          aria-selected={selectedId === booth.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35, ease: "easeOut" }}
        >
          <BoothCard
            booth={booth}
            selected={selectedId === booth.id}
            onSelect={onSelect}
            tabIndex={i === activeIndex ? 0 : -1}
            buttonRef={(el) => {
              btnRefs.current[i] = el;
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
