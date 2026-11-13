import { DISTRICT_BY_ID } from "./hk";
import type { Listing } from "./types";

export const FEATURES = [
  { id: "pets", label: "Pet friendly", test: (l: Listing) => l.petFriendly },
  { id: "nocomm", label: "No commission", test: (l: Listing) => l.commissionFree },
  { id: "deal", label: "Great price", test: (l: Listing) => l.priceRating === "great" },
  { id: "balcony", label: "Balcony", test: (l: Listing) => l.balcony },
  { id: "club", label: "Clubhouse", test: (l: Listing) => l.clubhouse },
  { id: "parking", label: "Parking", test: (l: Listing) => l.parking },
  { id: "seaview", label: "Sea view", test: (l: Listing) => l.view === "Sea" },
  { id: "highfloor", label: "High floor", test: (l: Listing) => l.floorZone === "High" },
] as const;

export type FeatureId = (typeof FEATURES)[number]["id"];

export const PROPERTY_TYPES = ["Apartment", "Serviced Apartment", "Village House"];
export const FURNISHING = ["Unfurnished", "Partially furnished", "Fully furnished"];

export const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "psf-asc", label: "Best value ($/sq ft)" },
  { id: "area-desc", label: "Largest first" },
  { id: "mtr", label: "Closest to MTR" },
] as const;

export type SortId = (typeof SORTS)[number]["id"];

export const PRICE_STEPS = [5000, 8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000, 40000, 50000, 70000, 100000];
export const AREA_STEPS = [200, 300, 400, 500, 600, 800, 1000, 1500];
export const MTR_STEPS = [5, 10, 15];

export type Filters = {
  q: string;
  districts: string[];
  minPrice: number | null;
  maxPrice: number | null;
  beds: number[];
  minArea: number | null;
  maxArea: number | null;
  types: string[];
  furnishing: string[];
  features: FeatureId[];
  mtr: number | null;
  sort: SortId;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  districts: [],
  minPrice: null,
  maxPrice: null,
  beds: [],
  minArea: null,
  maxArea: null,
  types: [],
  furnishing: [],
  features: [],
  mtr: null,
  sort: "newest",
};

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => (v && !Number.isNaN(Number(v)) ? Number(v) : null);

export function parseFilters(params: URLSearchParams): Filters {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    districts: list(params.get("d")).filter((d) => d in DISTRICT_BY_ID),
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    beds: list(params.get("beds")).map(Number).filter((n) => n >= 0 && n <= 4),
    minArea: num(params.get("amin")),
    maxArea: num(params.get("amax")),
    types: list(params.get("type")),
    furnishing: list(params.get("furn")),
    features: list(params.get("f")).filter((f): f is FeatureId => FEATURES.some((x) => x.id === f)),
    mtr: num(params.get("mtr")),
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "newest",
  };
}

export function serializeFilters(f: Filters) {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.districts.length) p.set("d", f.districts.join(","));
  if (f.minPrice != null) p.set("min", String(f.minPrice));
  if (f.maxPrice != null) p.set("max", String(f.maxPrice));
  if (f.beds.length) p.set("beds", [...f.beds].sort().join(","));
  if (f.minArea != null) p.set("amin", String(f.minArea));
  if (f.maxArea != null) p.set("amax", String(f.maxArea));
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.furnishing.length) p.set("furn", f.furnishing.join(","));
  if (f.features.length) p.set("f", f.features.join(","));
  if (f.mtr != null) p.set("mtr", String(f.mtr));
  if (f.sort !== "newest") p.set("sort", f.sort);
  return p.toString();
}

function matchesQuery(l: Listing, q: string) {
  const district = DISTRICT_BY_ID[l.district];
  const haystack = [l.estate, l.mtrStation ?? "", district?.name ?? "", district?.areas ?? "", l.type]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function applyFilters(listings: Listing[], f: Filters) {
  const featureTests = FEATURES.filter((x) => f.features.includes(x.id)).map((x) => x.test);
  const result = listings.filter(
    (l) =>
      (!f.q || matchesQuery(l, f.q)) &&
      (!f.districts.length || f.districts.includes(l.district)) &&
      (f.minPrice == null || l.price >= f.minPrice) &&
      (f.maxPrice == null || l.price <= f.maxPrice) &&
      (!f.beds.length || f.beds.includes(Math.min(l.bedrooms, 4))) &&
      (f.minArea == null || l.saleableArea >= f.minArea) &&
      (f.maxArea == null || l.saleableArea <= f.maxArea) &&
      (!f.types.length || f.types.includes(l.type)) &&
      (!f.furnishing.length || f.furnishing.includes(l.furnished)) &&
      (f.mtr == null || (l.mtrWalkMins != null && l.mtrWalkMins <= f.mtr)) &&
      featureTests.every((t) => t(l)),
  );
  return sortListings(result, f.sort);
}

export function sortListings(listings: Listing[], sort: SortId) {
  const sorted = [...listings];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "psf-asc":
      return sorted.sort((a, b) => a.pricePerSqft - b.pricePerSqft);
    case "area-desc":
      return sorted.sort((a, b) => b.saleableArea - a.saleableArea);
    case "mtr":
      return sorted.sort((a, b) => (a.mtrWalkMins ?? 99) - (b.mtrWalkMins ?? 99));
    default:
      return sorted.sort((a, b) => b.listedAt.localeCompare(a.listedAt));
  }
}

export function activeFilterCount(f: Filters) {
  return (
    (f.districts.length ? 1 : 0) +
    (f.minPrice != null || f.maxPrice != null ? 1 : 0) +
    (f.beds.length ? 1 : 0) +
    (f.minArea != null || f.maxArea != null ? 1 : 0) +
    (f.types.length ? 1 : 0) +
    (f.furnishing.length ? 1 : 0) +
    (f.mtr != null ? 1 : 0) +
    f.features.length
  );
}
