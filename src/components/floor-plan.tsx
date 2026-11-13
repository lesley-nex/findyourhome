import { DISTRICT_BY_ID, type RegionId } from "@/lib/hk";
import type { Listing } from "@/lib/types";

const TINTS: Record<RegionId, { bg: string; room: string; accent: string }> = {
  "hk-island": { bg: "#e8f1fb", room: "#ffffff", accent: "#2563eb" },
  kowloon: { bg: "#fdf0e7", room: "#ffffff", accent: "#ea580c" },
  "new-territories": { bg: "#e9f6ee", room: "#ffffff", accent: "#16a34a" },
  islands: { bg: "#e6f6f7", room: "#ffffff", accent: "#0891b2" },
};

function seeded(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

type Room = { x: number; y: number; w: number; h: number; label: string };

function layout(l: Pick<Listing, "id" | "bedrooms" | "bathrooms">): Room[] {
  const rand = seeded(l.id);
  const X = 12, Y = 12, W = 136, H = 86;
  if (l.bedrooms === 0) {
    const side = 34 + Math.round(rand() * 8);
    const kitchenH = 40 + Math.round(rand() * 10);
    return [
      { x: X, y: Y, w: W - side, h: H, label: "LIVING / BED" },
      { x: X + W - side, y: Y, w: side, h: kitchenH, label: "K" },
      { x: X + W - side, y: Y + kitchenH, w: side, h: H - kitchenH, label: "BATH" },
    ];
  }
  const rooms: Room[] = [];
  const baths = Math.max(1, l.bathrooms);
  const weights = Array.from({ length: l.bedrooms }, (_, i) => (i === 0 && l.bedrooms > 1 ? 1.5 : 1) + rand() * 0.4);
  const total = weights.reduce((a, b) => a + b, 0);
  const bedLabel = (i: number) => (i === 0 && l.bedrooms > 1 ? "MASTER" : "BED");

  if (l.bedrooms <= 2 && rand() < 0.5) {
    // Bedrooms stacked down one side, living area beside them.
    const colW = 48 + Math.round(rand() * 14);
    let y = Y;
    weights.forEach((w, i) => {
      const h = i === weights.length - 1 ? Y + H - y : Math.round((w / total) * H);
      rooms.push({ x: X, y, w: colW, h, label: bedLabel(i) });
      y += h;
    });
    const restX = X + colW;
    const restW = W - colW;
    const livingH = 50 + Math.round(rand() * 10);
    rooms.push({ x: restX, y: Y, w: restW, h: livingH, label: "LIVING / DINING" });
    const kitchenW = Math.round(restW * (0.45 + rand() * 0.15));
    rooms.push({ x: restX, y: Y + livingH, w: kitchenW, h: H - livingH, label: "K" });
    const bathW = (restW - kitchenW) / baths;
    for (let i = 0; i < baths; i++) {
      rooms.push({ x: restX + kitchenW + i * bathW, y: Y + livingH, w: bathW, h: H - livingH, label: "BA" });
    }
  } else {
    // Bedrooms in a row, living, kitchen and bathrooms below.
    const topH = 36 + Math.round(rand() * 14);
    let x = X;
    weights.forEach((w, i) => {
      const width = i === weights.length - 1 ? X + W - x : Math.round((w / total) * W);
      rooms.push({ x, y: Y, w: width, h: topH, label: bedLabel(i) });
      x += width;
    });
    const bottomY = Y + topH;
    const bottomH = H - topH;
    const bathW = 24 + Math.round(rand() * 6);
    const kitchenW = 28 + Math.round(rand() * 12);
    const livingW = W - bathW - kitchenW;
    const kitchenFirst = rand() < 0.4;
    rooms.push({ x: kitchenFirst ? X + kitchenW : X, y: bottomY, w: livingW, h: bottomH, label: "LIVING / DINING" });
    rooms.push({ x: kitchenFirst ? X : X + livingW, y: bottomY, w: kitchenW, h: bottomH, label: "K" });
    const bathH = bottomH / baths;
    for (let i = 0; i < baths; i++) {
      rooms.push({ x: X + livingW + kitchenW, y: bottomY + i * bathH, w: bathW, h: bathH, label: "BA" });
    }
  }

  if (rand() < 0.5) for (const r of rooms) r.x = X + W - (r.x - X) - r.w;
  if (rand() < 0.35) for (const r of rooms) r.y = Y + H - (r.y - Y) - r.h;
  return rooms;
}

export function FloorPlan({
  listing,
  className = "",
}: {
  listing: Pick<Listing, "id" | "bedrooms" | "bathrooms" | "district" | "balcony">;
  className?: string;
}) {
  const region = DISTRICT_BY_ID[listing.district]?.region ?? "hk-island";
  const tint = TINTS[region];
  const rooms = layout(listing);

  return (
    <svg viewBox="0 0 160 110" className={className} role="img" aria-label="Floor plan sketch" preserveAspectRatio="xMidYMid slice">
      <rect width="160" height="110" fill={tint.bg} />
      <g opacity="0.35" stroke={tint.accent} strokeWidth="0.3">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="110" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="160" y2={i * 10} />
        ))}
      </g>
      {listing.balcony && (
        <rect x="12" y="98" width="70" height="8" fill="none" stroke="#1c1917" strokeWidth="0.8" strokeDasharray="2 1.5" />
      )}
      {rooms.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={tint.room} stroke="#1c1917" strokeWidth="1.6" />
          {r.w > 18 && r.h > 10 && (
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={r.w < 34 ? 4.2 : 5}
              fontWeight="600"
              letterSpacing="0.4"
              fill="#57534e"
              fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            >
              {r.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
