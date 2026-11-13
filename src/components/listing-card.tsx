import Link from "next/link";
import { bedroomLabel, formatNumber, formatPrice, listingTitle } from "@/lib/format";
import { DISTRICT_BY_ID } from "@/lib/hk";
import type { Listing } from "@/lib/types";
import { MtrBadge, PriceRatingBadge } from "./badges";
import { FloorPlan } from "./floor-plan";
import { RelativeTime } from "./listing-actions";
import { SaveButton } from "./save-button";

export function ListingCard({
  listing: l,
  active = false,
  onHover,
}: {
  listing: Listing;
  active?: boolean;
  onHover?: (id: string | null) => void;
}) {
  return (
    <Link
      href={`/listing/${l.id}`}
      onMouseEnter={onHover ? () => onHover(l.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg ${
        active ? "border-ink shadow-lg" : "border-line"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <FloorPlan listing={l} className="size-full transition-transform duration-300 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {l.commissionFree && (
              <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[11px] font-medium text-white">No commission</span>
            )}
            {l.offers.length > 1 && (
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink shadow-sm">
                {l.offers.length} offers compared
              </span>
            )}
          </div>
          <SaveButton id={l.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-semibold tracking-tight">
            {formatPrice(l.price)}
            <span className="text-sm font-normal text-muted">/mo</span>
          </p>
          <PriceRatingBadge rating={l.priceRating} />
        </div>
        <div>
          <h3 className="line-clamp-1 font-medium">{listingTitle(l)}</h3>
          <p className="text-sm text-muted">
            {DISTRICT_BY_ID[l.district]?.name}
            {l.block ? ` · ${l.block}` : ""} · {l.floorZone} floor
          </p>
        </div>
        <p className="flex flex-wrap gap-x-3 text-sm text-stone-700">
          <span>{bedroomLabel(l.bedrooms)}</span>
          <span>{l.bathrooms} bath</span>
          <span>{formatNumber(l.saleableArea)} sq ft</span>
          <span className="text-muted">${l.pricePerSqft}/sq ft</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
          <MtrBadge station={l.mtrStation} mins={l.mtrWalkMins} />
          <span className="text-xs text-muted">
            <RelativeTime iso={l.listedAt} />
          </span>
        </div>
      </div>
    </Link>
  );
}
