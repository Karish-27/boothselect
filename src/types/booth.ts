export type BoothStatus = "available" | "reserved" | "sold" | "blocked";

export interface Booth {
  id: string;
  status: BoothStatus;
  price: number;
  holdDuration: number;
}