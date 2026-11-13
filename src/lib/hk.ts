export type RegionId = "hk-island" | "kowloon" | "new-territories" | "islands";

export const REGIONS: { id: RegionId; name: string }[] = [
  { id: "hk-island", name: "Hong Kong Island" },
  { id: "kowloon", name: "Kowloon" },
  { id: "new-territories", name: "New Territories" },
  { id: "islands", name: "Outlying Islands" },
];

export const DISTRICTS: { id: string; name: string; region: RegionId; areas: string }[] = [
  { id: "central-western", name: "Central & Western", region: "hk-island", areas: "Central, Sheung Wan, Sai Ying Pun, Kennedy Town, Mid-Levels" },
  { id: "wan-chai", name: "Wan Chai", region: "hk-island", areas: "Wan Chai, Causeway Bay, Happy Valley, Tai Hang" },
  { id: "eastern", name: "Eastern", region: "hk-island", areas: "North Point, Quarry Bay, Tai Koo, Sai Wan Ho, Chai Wan" },
  { id: "southern", name: "Southern", region: "hk-island", areas: "Pok Fu Lam, Aberdeen, Ap Lei Chau, Repulse Bay, Wong Chuk Hang" },
  { id: "yau-tsim-mong", name: "Yau Tsim Mong", region: "kowloon", areas: "Tsim Sha Tsui, Jordan, Mong Kok, Olympic, West Kowloon" },
  { id: "sham-shui-po", name: "Sham Shui Po", region: "kowloon", areas: "Sham Shui Po, Lai Chi Kok, Mei Foo, Cheung Sha Wan" },
  { id: "kowloon-city", name: "Kowloon City", region: "kowloon", areas: "Hung Hom, Whampoa, To Kwa Wan, Kai Tak, Ho Man Tin" },
  { id: "kwun-tong", name: "Kwun Tong", region: "kowloon", areas: "Kwun Tong, Kowloon Bay, Lam Tin, Yau Tong" },
  { id: "wong-tai-sin", name: "Wong Tai Sin", region: "kowloon", areas: "Diamond Hill, San Po Kong, Wong Tai Sin" },
  { id: "sha-tin", name: "Sha Tin", region: "new-territories", areas: "Sha Tin, Tai Wai, Fo Tan, Ma On Shan" },
  { id: "tsuen-wan", name: "Tsuen Wan", region: "new-territories", areas: "Tsuen Wan, Sham Tseng" },
  { id: "kwai-tsing", name: "Kwai Tsing", region: "new-territories", areas: "Tsing Yi, Kwai Chung" },
  { id: "tai-po", name: "Tai Po", region: "new-territories", areas: "Tai Po, Tai Wo" },
  { id: "sai-kung", name: "Sai Kung", region: "new-territories", areas: "Sai Kung, Tseung Kwan O, LOHAS Park, Clear Water Bay" },
  { id: "tuen-mun", name: "Tuen Mun", region: "new-territories", areas: "Tuen Mun, Siu Hong" },
  { id: "yuen-long", name: "Yuen Long", region: "new-territories", areas: "Yuen Long, Tin Shui Wai, Kam Tin" },
  { id: "north", name: "North", region: "new-territories", areas: "Sheung Shui, Fanling" },
  { id: "islands", name: "Islands", region: "islands", areas: "Tung Chung, Discovery Bay, Lantau, Lamma, Cheung Chau" },
];

export const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));

export const MTR_LINES = {
  island: { name: "Island Line", color: "#007DC5" },
  tsuenWan: { name: "Tsuen Wan Line", color: "#E2231A" },
  kwunTong: { name: "Kwun Tong Line", color: "#00AB4E" },
  tko: { name: "Tseung Kwan O Line", color: "#7D499D" },
  tungChung: { name: "Tung Chung Line", color: "#F7943E" },
  eastRail: { name: "East Rail Line", color: "#5EB6E4" },
  tuenMa: { name: "Tuen Ma Line", color: "#9A3820" },
  southIsland: { name: "South Island Line", color: "#B5BD00" },
} as const;

export type MtrLineId = keyof typeof MTR_LINES;

export const STATION_LINE: Record<string, MtrLineId> = {
  "Kennedy Town": "island", HKU: "island", "Sai Ying Pun": "island", "Sheung Wan": "island",
  Central: "island", "Wan Chai": "island", "Causeway Bay": "island", "Tin Hau": "island",
  "Fortress Hill": "island", "Tai Koo": "island", "Sai Wan Ho": "island", "Chai Wan": "island",
  "South Horizons": "southIsland", "Wong Chuk Hang": "southIsland",
  "Tsim Sha Tsui": "tsuenWan", "Lai Chi Kok": "tsuenWan", "Mei Foo": "tsuenWan", "Tsuen Wan": "tsuenWan",
  Whampoa: "kwunTong", "Lam Tin": "kwunTong", "Kowloon Bay": "kwunTong", "Diamond Hill": "kwunTong",
  "LOHAS Park": "tko", "Tiu Keng Leng": "tko", "Tseung Kwan O": "tko",
  Kowloon: "tungChung", Olympic: "tungChung", "Tsing Yi": "tungChung", "Tung Chung": "tungChung",
  "Tai Wai": "eastRail", "Fo Tan": "eastRail", "Tai Po Market": "eastRail", "Sheung Shui": "eastRail", Fanling: "eastRail",
  "To Kwa Wan": "tuenMa", "Kai Tak": "tuenMa", "City One": "tuenMa", "Tsuen Wan West": "tuenMa",
  "Tuen Mun": "tuenMa", "Tin Shui Wai": "tuenMa", "Yuen Long": "tuenMa",
};

export function stationLine(station: string) {
  const id = STATION_LINE[station];
  return id ? MTR_LINES[id] : null;
}
