"use client";

import Link from "next/link";
import { bedroomLabel, formatNumber, formatPrice, listingTitle, moveInCost } from "@/lib/format";
import { DISTRICT_BY_ID } from "@/lib/hk";
import { getListing } from "@/lib/listings";
import { useSaved } from "@/lib/saved";
import type { Listing } from "@/lib/types";
import { MtrBadge, PriceRatingBadge } from "./badges";
import { FloorPlan } from "./floor-plan";
import { HeartIcon } from "./icons";
import { ListingCard } from "./listing-card";

const yesNo = (v: boolean) => (v ? "Yes" : "—");

const ROWS: { label: string; render: (l: Listing) => React.ReactNode; best?: (ls: Listing[]) => string | null }[] = [
  { label: "Rent", render: (l) => <span className="font-semibold">{formatPrice(l.price)}</span>, best: (ls) => minBy(ls, (l) => l.price) },
  { label: "Price check", render: (l) => <PriceRatingBadge rating={l.priceRating} /> },
  { label: "$ / sq ft", render: (l) => `$${l.pricePerSqft}`, best: (ls) => minBy(ls, (l) => l.pricePerSqft) },
  { label: "Saleable area", render: (l) => `${formatNumber(l.saleableArea)} sq ft`, best: (ls) => minBy(ls, (l) => -l.saleableArea) },
  { label: "Bedrooms", render: (l) => bedroomLabel(l.bedrooms) },
  { label: "Bathrooms", render: (l) => l.bathrooms },
  { label: "District", render: (l) => DISTRICT_BY_ID[l.district]?.name },
  { label: "MTR", render: (l) => <MtrBadge station={l.mtrStation} mins={l.mtrWalkMins} />, best: (ls) => minBy(ls, (l) => l.mtrWalkMins ?? 99) },
  { label: "Floor / view", render: (l) => `${l.floorZone} · ${l.view}` },
  { label: "Furnishing", render: (l) => l.furnished },
  { label: "Pets allowed", render: (l) => yesNo(l.petFriendly) },
  { label: "Balcony", render: (l) => yesNo(l.balcony) },
  { label: "Clubhouse", render: (l) => yesNo(l.clubhouse) },
  {
    label: "Move-in cost",
    render: (l) => formatPrice(moveInCost(l.price, l.commissionFree).total),
    best: (ls) => minBy(ls, (l) => moveInCost(l.price, l.commissionFree).total),
  },
];

function minBy(ls: Listing[], f: (l: Listing) => number) {
  if (ls.length < 2) return null;
  const best = Math.min(...ls.map(f));
  const winners = ls.filter((l) => f(l) === best);
  return winners.length === 1 ? winners[0].id : null;
}

export function SavedHomes() {
  const { saved, toggle } = useSaved();
  const listings = saved.map(getListing).filter((l): l is Listing => Boolean(l));

  if (listings.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
        <HeartIcon className="mx-auto size-10 text-stone-300" />
        <p className="mt-3 text-lg font-semibold">No saved homes yet</p>
        <p className="mt-1 text-sm text-muted">Tap the heart on any listing to keep it here and compare later.</p>
        <Link href="/" className="mt-5 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Start searching
        </Link>
      </div>
    );
  }

  const compare = listings.slice(0, 4);

  return (
    <>
      {listings.length >= 2 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            Compare {compare.length === listings.length ? "" : `your latest ${compare.length} of `}
            {listings.length} homes
          </h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="w-36 p-3" />
                  {compare.map((l) => (
                    <th key={l.id} className="p-3 text-left align-top font-normal">
                      <Link href={`/listing/${l.id}`} className="group block">
                        <div className="aspect-[16/10] overflow-hidden rounded-xl border border-line">
                          <FloorPlan listing={l} className="size-full" />
                        </div>
                        <p className="mt-2 line-clamp-2 font-medium group-hover:underline">{listingTitle(l)}</p>
                      </Link>
                      <button type="button" onClick={() => toggle(l.id)} className="mt-1 text-xs text-muted hover:text-brand">
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const bestId = row.best?.(compare);
                  return (
                    <tr key={row.label} className="border-t border-line">
                      <th scope="row" className="p-3 text-left font-medium text-muted">
                        {row.label}
                      </th>
                      {compare.map((l) => (
                        <td key={l.id} className={`p-3 ${bestId === l.id ? "bg-emerald-50" : ""}`}>
                          {row.render(l)}
                          {bestId === l.id && <span className="ml-1.5 text-xs font-medium text-emerald-700">Best</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">All saved ({listings.length})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>
    </>
  );
}
