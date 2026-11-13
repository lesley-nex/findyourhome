export type Offer = {
  source: string;
  sourceType: "agency" | "landlord" | "platform";
  price: number;
  commissionFree: boolean;
};

export type PriceRating = "great" | "fair" | "high";

export type Listing = {
  id: string;
  estate: string;
  block: string | null;
  district: string;
  lat: number;
  lng: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  saleableArea: number;
  price: number;
  pricePerSqft: number;
  floorZone: "Low" | "Mid" | "High";
  view: string;
  furnished: string;
  petFriendly: boolean;
  balcony: boolean;
  clubhouse: boolean;
  parking: boolean;
  commissionFree: boolean;
  mtrStation: string | null;
  mtrWalkMins: number | null;
  listedAt: string;
  availableFrom: string;
  description: string;
  offers: Offer[];
  priceRating: PriceRating;
  districtMedianPerSqft: number;
};
