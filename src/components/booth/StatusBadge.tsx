import type { BoothStatus } from "@/types/booth";

const STYLES: Record<BoothStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  reserved: "bg-amber-50 text-amber-700 ring-amber-200",
  sold: "bg-slate-100 text-slate-600 ring-slate-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
};

const LABELS: Record<BoothStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  blocked: "Blocked",
};

export function StatusBadge({ status }: { status: BoothStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {LABELS[status]}
    </span>
  );
}