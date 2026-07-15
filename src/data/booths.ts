import type { Booth } from "@/types/booth";

export const INITIAL_BOOTHS: Booth[] = [
  { id: "A-01", status: "available", price: 1200, holdDuration: 30 },
  { id: "A-02", status: "reserved", price: 1500, holdDuration: 30 },
  { id: "A-03", status: "available", price: 1800, holdDuration: 30 },
  { id: "B-01", status: "sold", price: 2000, holdDuration: 30 },
  { id: "B-02", status: "available", price: 2200, holdDuration: 30 },
  { id: "B-03", status: "blocked", price: 2400, holdDuration: 30 },
  { id: "C-01", status: "available", price: 2600, holdDuration: 30 },
  { id: "C-02", status: "available", price: 3000, holdDuration: 30 },
];