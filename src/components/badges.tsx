import { stationLine } from "@/lib/hk";
import type { PriceRating } from "@/lib/types";
import { TrainIcon } from "./icons";

const RATING: Record<PriceRating, { label: string; className: string }> = {
  great: { label: "Great price", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  fair: { label: "Fair price", className: "bg-stone-100 text-stone-700 ring-stone-500/20" },
  high: { label: "Above market", className: "bg-amber-50 text-amber-800 ring-amber-600/20" },
};

export function PriceRatingBadge({ rating, className = "" }: { rating: PriceRating; className?: string }) {
  const r = RATING[rating];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${r.className} ${className}`}>
      {r.label}
    </span>
  );
}

export function MtrBadge({ station, mins }: { station: string | null; mins: number | null }) {
  if (!station || mins == null) {
    return <span className="text-xs text-muted">Bus / minibus access</span>;
  }
  const line = stationLine(station);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600">
      <span
        className="flex size-4 items-center justify-center rounded text-white"
        style={{ backgroundColor: line?.color ?? "#57534e" }}
        title={line?.name}
      >
        <TrainIcon className="size-3" />
      </span>
      <span>
        <span className="font-medium text-ink">{mins} min</span> to {station}
      </span>
    </span>
  );
}
