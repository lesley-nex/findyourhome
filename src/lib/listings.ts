import data from "@/data/listings.json";
import type { Listing } from "./types";

export const LISTINGS = data.listings as Listing[];
export const DATA_GENERATED_AT = data.generatedAt;

const BY_ID = new Map(LISTINGS.map((l) => [l.id, l]));

export function getListing(id: string) {
  return BY_ID.get(id);
}

export function similarListings(listing: Listing, limit = 4) {
  return LISTINGS.filter((l) => l.id !== listing.id)
    .map((l) => {
      let score = 0;
      if (l.district === listing.district) score += 3;
      if (l.bedrooms === listing.bedrooms) score += 2;
      score -= Math.abs(l.price - listing.price) / listing.price * 4;
      return { l, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}
