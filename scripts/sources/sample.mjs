// Sample source adapter. Produces realistic but fictional listings for real
// Hong Kong estates so the product can be built and demoed end to end.
// A real adapter (licensed feed, agency API, partner CSV) must export the same
// `fetchListings()` signature and return objects in the `RawListing` shape
// documented in scripts/build-listings.mjs.

const ESTATES = [
  // Hong Kong Island
  { name: "Island Crest", district: "central-western", lat: 22.2862, lng: 114.1428, mtr: "Sai Ying Pun", walk: [2, 5], tier: 1.05, club: true },
  { name: "The Belcher's", district: "central-western", lat: 22.2843, lng: 114.1316, mtr: "HKU", walk: [3, 7], tier: 1.0, club: true },
  { name: "The Merton", district: "central-western", lat: 22.2836, lng: 114.1288, mtr: "Kennedy Town", walk: [2, 4], tier: 1.0, club: true, views: ["Sea", "City"] },
  { name: "SOHO 189", district: "central-western", lat: 22.2851, lng: 114.1481, mtr: "Sheung Wan", walk: [4, 7], tier: 1.0 },
  { name: "Robinson Place", district: "central-western", lat: 22.2806, lng: 114.1502, mtr: "Central", walk: [12, 16], tier: 1.15, club: true, beds: [2, 3, 3, 4] },
  { name: "The Zenith", district: "wan-chai", lat: 22.2758, lng: 114.1731, mtr: "Wan Chai", walk: [4, 7], tier: 1.0, club: true },
  { name: "Star Crest", district: "wan-chai", lat: 22.2771, lng: 114.1699, mtr: "Wan Chai", walk: [3, 6], tier: 1.1, club: true },
  { name: "Convention Plaza Apartments", district: "wan-chai", lat: 22.2818, lng: 114.1727, mtr: "Wan Chai", walk: [7, 10], tier: 1.15, type: "Serviced Apartment", views: ["Sea", "City"] },
  { name: "Illumination Terrace", district: "wan-chai", lat: 22.2781, lng: 114.1912, mtr: "Tin Hau", walk: [5, 8], tier: 0.95 },
  { name: "Leighton Hill", district: "wan-chai", lat: 22.2738, lng: 114.1838, mtr: "Causeway Bay", walk: [8, 12], tier: 1.2, club: true, beds: [2, 3, 3, 4] },
  { name: "Taikoo Shing", district: "eastern", lat: 22.2862, lng: 114.2168, mtr: "Tai Koo", walk: [2, 6], tier: 1.0, beds: [1, 2, 2, 3, 3] },
  { name: "Kornhill", district: "eastern", lat: 22.2838, lng: 114.2142, mtr: "Tai Koo", walk: [6, 10], tier: 0.9, beds: [2, 2, 3] },
  { name: "City Garden", district: "eastern", lat: 22.2912, lng: 114.1962, mtr: "Fortress Hill", walk: [3, 6], tier: 0.95, views: ["Sea", "City"] },
  { name: "Lei King Wan", district: "eastern", lat: 22.2851, lng: 114.2232, mtr: "Sai Wan Ho", walk: [4, 7], tier: 0.95, views: ["Sea", "City"] },
  { name: "Island Resort", district: "eastern", lat: 22.2641, lng: 114.2502, mtr: "Chai Wan", walk: [12, 15], tier: 0.85, club: true, views: ["Sea", "Mountain"] },
  { name: "South Horizons", district: "southern", lat: 22.2428, lng: 114.1492, mtr: "South Horizons", walk: [2, 8], tier: 0.95, views: ["Sea", "Mountain"] },
  { name: "Residence Bel-Air", district: "southern", lat: 22.2602, lng: 114.1401, mtr: null, tier: 1.0, club: true, views: ["Sea"], beds: [2, 3, 3, 4] },
  { name: "The Repulse Bay", district: "southern", lat: 22.2362, lng: 114.1962, mtr: null, tier: 1.5, club: true, views: ["Sea"], beds: [3, 3, 4, 4] },
  { name: "Marinella", district: "southern", lat: 22.2468, lng: 114.1610, mtr: "Wong Chuk Hang", walk: [6, 9], tier: 1.15, club: true, views: ["Sea"] },
  // Kowloon
  { name: "The Harbourside", district: "yau-tsim-mong", lat: 22.3043, lng: 114.1608, mtr: "Kowloon", walk: [3, 5], tier: 1.15, club: true, views: ["Sea", "City"] },
  { name: "Sorrento", district: "yau-tsim-mong", lat: 22.3052, lng: 114.1631, mtr: "Kowloon", walk: [3, 6], tier: 1.05, club: true, views: ["Sea", "City"] },
  { name: "The Victoria Towers", district: "yau-tsim-mong", lat: 22.3012, lng: 114.1698, mtr: "Tsim Sha Tsui", walk: [5, 8], tier: 1.05, club: true },
  { name: "Island Harbourview", district: "yau-tsim-mong", lat: 22.3181, lng: 114.1609, mtr: "Olympic", walk: [3, 6], tier: 0.9, club: true },
  { name: "Park Avenue", district: "yau-tsim-mong", lat: 22.3202, lng: 114.1628, mtr: "Olympic", walk: [5, 8], tier: 0.9, club: true },
  { name: "Banyan Garden", district: "sham-shui-po", lat: 22.3331, lng: 114.1502, mtr: "Lai Chi Kok", walk: [4, 7], tier: 0.95, club: true },
  { name: "Liberté", district: "sham-shui-po", lat: 22.3362, lng: 114.1471, mtr: "Lai Chi Kok", walk: [6, 9], tier: 0.9, club: true, views: ["Sea", "City"] },
  { name: "Mei Foo Sun Chuen", district: "sham-shui-po", lat: 22.3372, lng: 114.1402, mtr: "Mei Foo", walk: [2, 8], tier: 0.85, beds: [1, 2, 2, 3] },
  { name: "Whampoa Garden", district: "kowloon-city", lat: 22.3048, lng: 114.1892, mtr: "Whampoa", walk: [2, 7], tier: 0.95, beds: [2, 2, 3] },
  { name: "Laguna Verde", district: "kowloon-city", lat: 22.3039, lng: 114.1913, mtr: "Whampoa", walk: [5, 9], tier: 1.0, club: true, views: ["Sea", "City"] },
  { name: "Victoria Skye", district: "kowloon-city", lat: 22.3268, lng: 114.1992, mtr: "Kai Tak", walk: [6, 9], tier: 1.0, club: true },
  { name: "Grand Waterfront", district: "kowloon-city", lat: 22.3168, lng: 114.1893, mtr: "To Kwa Wan", walk: [3, 6], tier: 0.95, club: true, views: ["Sea", "City"] },
  { name: "Laguna City", district: "kwun-tong", lat: 22.3059, lng: 114.2302, mtr: "Lam Tin", walk: [8, 13], tier: 0.9, views: ["Sea", "City"] },
  { name: "Amoy Gardens", district: "kwun-tong", lat: 22.3242, lng: 114.2128, mtr: "Kowloon Bay", walk: [4, 8], tier: 0.85 },
  { name: "Galaxia", district: "wong-tai-sin", lat: 22.3402, lng: 114.2018, mtr: "Diamond Hill", walk: [2, 4], tier: 0.95, club: true },
  { name: "Rhythm Garden", district: "wong-tai-sin", lat: 22.3332, lng: 114.1981, mtr: "Diamond Hill", walk: [8, 11], tier: 0.85 },
  // New Territories
  { name: "City One Shatin", district: "sha-tin", lat: 22.3832, lng: 114.2041, mtr: "City One", walk: [2, 8], tier: 0.95, views: ["Mountain", "City"] },
  { name: "Festival City", district: "sha-tin", lat: 22.3721, lng: 114.1789, mtr: "Tai Wai", walk: [2, 5], tier: 1.0, club: true, views: ["Mountain", "City"] },
  { name: "Jubilee Garden", district: "sha-tin", lat: 22.3962, lng: 114.1961, mtr: "Fo Tan", walk: [3, 7], tier: 0.9 },
  { name: "Belvedere Garden", district: "tsuen-wan", lat: 22.3701, lng: 114.1059, mtr: "Tsuen Wan West", walk: [10, 14], tier: 0.9, club: true, views: ["Sea", "City"] },
  { name: "Riviera Gardens", district: "tsuen-wan", lat: 22.3612, lng: 114.1062, mtr: "Tsuen Wan West", walk: [8, 12], tier: 0.85, views: ["Sea"] },
  { name: "Discovery Park", district: "tsuen-wan", lat: 22.3731, lng: 114.1102, mtr: "Tsuen Wan", walk: [5, 8], tier: 0.9 },
  { name: "Tierra Verde", district: "kwai-tsing", lat: 22.3581, lng: 114.1081, mtr: "Tsing Yi", walk: [3, 6], tier: 0.9, club: true, views: ["Sea", "City"] },
  { name: "Mayfair Gardens", district: "kwai-tsing", lat: 22.3532, lng: 114.1049, mtr: "Tsing Yi", walk: [8, 12], tier: 0.8 },
  { name: "Tai Po Centre", district: "tai-po", lat: 22.4502, lng: 114.1661, mtr: "Tai Po Market", walk: [8, 12], tier: 0.85, views: ["Mountain", "Garden"] },
  { name: "Uptown Plaza", district: "tai-po", lat: 22.4481, lng: 114.1692, mtr: "Tai Po Market", walk: [6, 9], tier: 0.85 },
  { name: "LOHAS Park", district: "sai-kung", lat: 22.2952, lng: 114.2691, mtr: "LOHAS Park", walk: [2, 6], tier: 0.95, club: true, views: ["Sea", "Mountain"] },
  { name: "Metro Town", district: "sai-kung", lat: 22.3071, lng: 114.2601, mtr: "Tiu Keng Leng", walk: [1, 4], tier: 0.95, club: true },
  { name: "Park Central", district: "sai-kung", lat: 22.3072, lng: 114.2589, mtr: "Tseung Kwan O", walk: [2, 5], tier: 0.9 },
  { name: "Sai Kung Village Houses", district: "sai-kung", lat: 22.3832, lng: 114.2712, mtr: null, tier: 0.75, type: "Village House", views: ["Sea", "Mountain", "Garden"], beds: [2, 3, 3, 4], pets: 0.8 },
  { name: "Hanford Garden", district: "tuen-mun", lat: 22.3862, lng: 113.9739, mtr: "Tuen Mun", walk: [5, 9], tier: 0.85 },
  { name: "Kingswood Villas", district: "yuen-long", lat: 22.4591, lng: 114.0041, mtr: "Tin Shui Wai", walk: [4, 8], tier: 0.85, club: true },
  { name: "YOHO Town", district: "yuen-long", lat: 22.4452, lng: 114.0362, mtr: "Yuen Long", walk: [2, 5], tier: 0.95, club: true },
  { name: "Sheung Shui Centre", district: "north", lat: 22.5012, lng: 114.1281, mtr: "Sheung Shui", walk: [2, 4], tier: 0.85 },
  { name: "Wing Fai Centre", district: "north", lat: 22.4921, lng: 114.1418, mtr: "Fanling", walk: [3, 6], tier: 0.8 },
  // Islands
  { name: "Caribbean Coast", district: "islands", lat: 22.2881, lng: 113.9372, mtr: "Tung Chung", walk: [10, 14], tier: 0.9, club: true, views: ["Sea", "Mountain"] },
  { name: "Coastal Skyline", district: "islands", lat: 22.2892, lng: 113.9428, mtr: "Tung Chung", walk: [4, 8], tier: 0.95, club: true, views: ["Sea", "Mountain"] },
  { name: "Discovery Bay", district: "islands", lat: 22.2951, lng: 114.0171, mtr: null, tier: 0.95, club: true, views: ["Sea", "Mountain", "Garden"], beds: [1, 2, 2, 3, 3], pets: 0.7 },
];

// Monthly HK$ per sq ft of saleable area, before estate tier adjustment.
const DISTRICT_RATE = {
  "central-western": 52, "wan-chai": 50, eastern: 40, southern: 48,
  "yau-tsim-mong": 45, "sham-shui-po": 37, "kowloon-city": 38, "kwun-tong": 34, "wong-tai-sin": 34,
  "sha-tin": 33, "tsuen-wan": 33, "kwai-tsing": 31, "tai-po": 28, "sai-kung": 32,
  "tuen-mun": 26, "yuen-long": 27, north: 26, islands: 30,
};

const SIZE_BY_BEDS = { 0: [220, 360], 1: [300, 460], 2: [420, 640], 3: [600, 950], 4: [1000, 1900] };

const AGENTS = [
  { name: "Harbour Realty", type: "agency" },
  { name: "Lion Rock Homes", type: "agency" },
  { name: "Peak & Co. Property", type: "agency" },
  { name: "Victoria Estates", type: "agency" },
  { name: "Kowloon Keys", type: "agency" },
  { name: "Owner direct", type: "landlord" },
];

const HIGHLIGHTS = [
  "Bright unit with an open kitchen and generous windows.",
  "Recently renovated with new flooring and built-in storage.",
  "Quiet, well-kept block with 24-hour security.",
  "Efficient layout with no wasted corridor space.",
  "Move-in ready with modern appliances included.",
  "Corner unit with cross-ventilation and great natural light.",
  "Walk to supermarkets, cafés and the wet market.",
  "Family-friendly estate with playgrounds and schools nearby.",
];

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function fetchListings({ now = new Date(), count = 260 } = {}) {
  const rand = mulberry32(852);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const between = (min, max) => min + rand() * (max - min);
  const chance = (p) => rand() < p;
  const day = 24 * 60 * 60 * 1000;

  const listings = [];
  for (let i = 0; i < count; i++) {
    const estate = ESTATES[i % ESTATES.length];
    const type = estate.type ?? "Apartment";
    const bedrooms = pick(estate.beds ?? [0, 1, 1, 2, 2, 2, 3]);
    const [minSize, maxSize] = SIZE_BY_BEDS[bedrooms];
    const area = Math.round(between(minSize, maxSize) / 5) * 5;
    const floorZone = type === "Village House" ? pick(["Low", "Mid"]) : pick(["Low", "Mid", "Mid", "High", "High"]);
    const view = pick(estate.views ?? ["City", "City", "Mountain", "Garden"]);

    let rate = DISTRICT_RATE[estate.district] * estate.tier * between(0.85, 1.18);
    if (floorZone === "High") rate *= 1.05;
    if (view === "Sea") rate *= 1.08;
    if (bedrooms === 0) rate *= 1.12;
    const price = Math.round((area * rate) / 500) * 500;

    const furnished = type === "Serviced Apartment" ? "Fully furnished" : pick(["Unfurnished", "Unfurnished", "Partially furnished", "Fully furnished"]);
    const block = type === "Village House" ? null : `Tower ${1 + Math.floor(rand() * 8)}`;
    const listedAt = new Date(now.getTime() - Math.floor(rand() * rand() * 45) * day - Math.floor(rand() * day));
    const availableFrom = new Date(now.getTime() + Math.floor(rand() * 60) * day);

    // A single flat is often advertised by several agents at slightly different prices.
    const offers = [];
    const offerCount = type === "Village House" ? 1 : pick([1, 1, 1, 2, 2, 3]);
    const agents = [...AGENTS].sort(() => rand() - 0.5).slice(0, offerCount);
    for (const agent of agents) {
      const delta = offers.length === 0 ? 0 : Math.round(between(-0.04, 0.05) * price / 100) * 100;
      offers.push({
        source: agent.name,
        sourceType: agent.type,
        price: price + delta,
        commissionFree: agent.type === "landlord" || chance(0.15),
      });
    }

    const mtrWalkMins = estate.mtr ? Math.round(between(estate.walk[0], estate.walk[1])) : null;
    const highlights = [pick(HIGHLIGHTS), pick(HIGHLIGHTS)].filter((v, idx, a) => a.indexOf(v) === idx);
    const bedroomText = bedrooms === 0 ? "studio" : `${bedrooms}-bedroom ${type.toLowerCase()}`;
    const mtrText = estate.mtr ? `${mtrWalkMins} minutes' walk to ${estate.mtr} MTR station` : "served by frequent buses and minibuses";

    listings.push({
      externalId: `sample-${i + 1}`,
      estate: estate.name,
      block,
      district: estate.district,
      lat: estate.lat + between(-0.0012, 0.0012),
      lng: estate.lng + between(-0.0012, 0.0012),
      type,
      bedrooms,
      bathrooms: bedrooms >= 3 ? pick([2, 2, 3]) : bedrooms === 2 ? pick([1, 1, 2]) : 1,
      saleableArea: area,
      floorZone,
      view,
      furnished,
      petFriendly: chance(estate.pets ?? 0.3),
      balcony: chance(type === "Village House" ? 0.8 : 0.45),
      clubhouse: Boolean(estate.club) && type !== "Village House",
      parking: chance(type === "Village House" ? 0.5 : 0.2),
      mtrStation: estate.mtr,
      mtrWalkMins,
      listedAt: listedAt.toISOString(),
      availableFrom: availableFrom.toISOString().slice(0, 10),
      description: `A ${floorZone.toLowerCase()}-floor ${bedroomText} at ${estate.name} with ${view.toLowerCase()} views, ${mtrText}. ${highlights.join(" ")}`,
      offers,
    });
  }
  return listings;
}
