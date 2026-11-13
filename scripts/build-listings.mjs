// Builds src/data/listings.json from every registered source adapter.
//
// Each adapter exports `fetchListings()` resolving to RawListing[]:
//   { externalId, estate, block, district, lat, lng, type, bedrooms, bathrooms,
//     saleableArea, floorZone, view, furnished, petFriendly, balcony, clubhouse,
//     parking, mtrStation, mtrWalkMins, listedAt, availableFrom, description,
//     offers: [{ source, sourceType, price, commissionFree }] }
//
// The same flat advertised by several sources is merged into one listing so
// renters see it once, with every offer and the lowest price.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sample from "./sources/sample.mjs";

const SOURCES = [sample];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = join(root, "src", "data", "listings.json");

function fingerprint(l) {
  const area = Math.round(l.saleableArea / 10) * 10;
  return [l.estate, l.block ?? "", l.floorZone, l.bedrooms, area].join("|").toLowerCase();
}

function slugify(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const raw = (await Promise.all(SOURCES.map((s) => s.fetchListings()))).flat();

const merged = new Map();
for (const l of raw) {
  const key = fingerprint(l);
  const existing = merged.get(key);
  if (existing) {
    existing.offers.push(...l.offers);
    if (l.listedAt > existing.listedAt) existing.listedAt = l.listedAt;
  } else {
    merged.set(key, { ...l, offers: [...l.offers] });
  }
}

const listings = [...merged.values()].map((l, i) => {
  const offers = [...l.offers].sort((a, b) => a.price - b.price);
  const price = offers[0].price;
  return {
    id: `${slugify(l.estate)}-${(i + 1).toString(36)}`,
    estate: l.estate,
    block: l.block,
    district: l.district,
    lat: Number(l.lat.toFixed(5)),
    lng: Number(l.lng.toFixed(5)),
    type: l.type,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    saleableArea: l.saleableArea,
    price,
    pricePerSqft: Math.round(price / l.saleableArea),
    floorZone: l.floorZone,
    view: l.view,
    furnished: l.furnished,
    petFriendly: l.petFriendly,
    balcony: l.balcony,
    clubhouse: l.clubhouse,
    parking: l.parking,
    commissionFree: offers.some((o) => o.commissionFree),
    mtrStation: l.mtrStation,
    mtrWalkMins: l.mtrWalkMins,
    listedAt: l.listedAt,
    availableFrom: l.availableFrom,
    description: l.description,
    offers,
  };
});

const byDistrict = Object.groupBy(listings, (l) => l.district);
const districtMedian = Object.fromEntries(
  Object.entries(byDistrict).map(([d, ls]) => [d, median(ls.map((l) => l.pricePerSqft))]),
);
for (const l of listings) {
  const ratio = l.pricePerSqft / districtMedian[l.district];
  l.priceRating = ratio <= 0.92 ? "great" : ratio <= 1.06 ? "fair" : "high";
  l.districtMedianPerSqft = Math.round(districtMedian[l.district]);
}

listings.sort((a, b) => b.listedAt.localeCompare(a.listedAt));

await mkdir(dirname(outFile), { recursive: true });
await writeFile(
  outFile,
  JSON.stringify({ generatedAt: new Date().toISOString(), sources: SOURCES.length, listings }, null, 0),
);
console.log(`Wrote ${listings.length} listings (${raw.length} raw) to ${outFile}`);
