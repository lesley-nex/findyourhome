import type { Listing } from "./types";

const hkd = new Intl.NumberFormat("en-HK", { maximumFractionDigits: 0 });

export function formatPrice(n: number) {
  return `HK$${hkd.format(n)}`;
}

export function formatShortPrice(n: number) {
  if (n >= 100_000) return `$${Math.round(n / 1000)}k`;
  if (n >= 10_000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${(n / 1000).toFixed(1)}k`;
}

export function formatNumber(n: number) {
  return hkd.format(n);
}

export function bedroomLabel(beds: number, short = false) {
  if (beds === 0) return "Studio";
  return short ? `${beds} bd` : `${beds} bedroom${beds === 1 ? "" : "s"}`;
}

export function listingTitle(l: Listing) {
  const kind = l.type === "Apartment" ? "flat" : l.type.toLowerCase();
  return l.bedrooms === 0 ? `Studio ${kind} at ${l.estate}` : `${l.bedrooms}-bed ${kind} at ${l.estate}`;
}

export function relativeDays(iso: string, now = Date.now()) {
  const days = Math.floor((now - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-HK", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Typical up-front cost of signing a 2-year residential lease in Hong Kong:
 * 2 months' deposit, 1 month's rent in advance, half a month's agency commission,
 * and the tenant's half of stamp duty (0.5% of average yearly rent for 1–3 year terms).
 */
export function moveInCost(price: number, commissionFree: boolean) {
  const deposit = price * 2;
  const advance = price;
  const commission = commissionFree ? 0 : price / 2;
  const stampDuty = Math.round((price * 12 * 0.005) / 2);
  return { deposit, advance, commission, stampDuty, total: deposit + advance + commission + stampDuty };
}
