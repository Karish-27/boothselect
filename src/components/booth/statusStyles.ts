import type { BoothStatus } from "@/types/booth";

/**
 * Single source of truth for how each booth status looks.
 *
 * Keeping label, card tint, and tag together here guarantees the badge, the
 * booth card, and the reservation panel stay visually in sync — the whole
 * status system can be reasoned about (and restyled) in one place.
 *
 * Deliberately one signal per status (a single muted color on a small label),
 * not a dot + colored background + colored text all repeating the same hue —
 * that triple-redundant "pill with dot" is the default every page-builder
 * reaches for, and it reads as templated rather than designed.
 */
export interface StatusStyle {
  label: string;
  /** Status-colored gradient for the booth's canopy/top fascia. */
  canopy: string;
  /** Small muted-color label — background + text, no dot, no ring. */
  tag: string;
  /** Available booths are selectable; the rest are quieted. */
  interactive: boolean;
}

export const STATUS_STYLES: Record<BoothStatus, StatusStyle> = {
  available: {
    label: "Available",
    canopy: "from-emerald-500 to-emerald-600",
    tag: "bg-emerald-50 text-emerald-700",
    interactive: true,
  },
  reserved: {
    label: "Reserved",
    canopy: "from-amber-500 to-amber-600",
    tag: "bg-amber-50 text-amber-700",
    interactive: false,
  },
  sold: {
    label: "Sold",
    canopy: "from-rose-500 to-rose-600",
    tag: "bg-rose-50 text-rose-500",
    interactive: false,
  },
  blocked: {
    label: "Blocked",
    canopy: "from-slate-400 to-slate-500",
    tag: "bg-slate-100 text-slate-500",
    interactive: false,
  },
};
