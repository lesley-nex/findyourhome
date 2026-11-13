import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MtrBadge, PriceRatingBadge } from "@/components/badges";
import { FloorPlan } from "@/components/floor-plan";
import { CheckIcon } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { ListingMap } from "@/components/listing-map";
import { BackToResults, ContactButton, RelativeTime, ShareButton } from "@/components/listing-actions";
import { SaveButton } from "@/components/save-button";
import {
  bedroomLabel,
  formatDate,
  formatNumber,
  formatPrice,
  listingTitle,
  moveInCost,
} from "@/lib/format";
import { DISTRICT_BY_ID } from "@/lib/hk";
import { getListing, LISTINGS, similarListings } from "@/lib/listings";

export const dynamicParams = false;

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/listing/[id]">): Promise<Metadata> {
  const { id } = await params;
  const l = getListing(id);
  if (!l) return {};
  const district = DISTRICT_BY_ID[l.district]?.name;
  return {
    title: `${listingTitle(l)}, ${district} — ${formatPrice(l.price)}/mo`,
    description: `${bedroomLabel(l.bedrooms)}, ${l.saleableArea} sq ft saleable in ${district}. ${l.description}`,
  };
}

export default async function ListingPage({ params }: PageProps<"/listing/[id]">) {
  const { id } = await params;
  const l = getListing(id);
  if (!l) notFound();

  const district = DISTRICT_BY_ID[l.district];
  const cost = moveInCost(l.price, l.commissionFree);
  const similar = similarListings(l);
  const psfDiff = Math.round(((l.pricePerSqft - l.districtMedianPerSqft) / l.districtMedianPerSqft) * 100);
  const lowest = l.offers[0];
  const highest = l.offers[l.offers.length - 1];

  const facts: [string, string][] = [
    ["Saleable area", `${formatNumber(l.saleableArea)} sq ft`],
    ["Bedrooms", bedroomLabel(l.bedrooms)],
    ["Bathrooms", String(l.bathrooms)],
    ["Floor", `${l.floorZone} floor`],
    ["View", l.view],
    ["Furnishing", l.furnished],
    ["Property type", l.type],
    ["Available from", formatDate(l.availableFrom)],
  ];

  const amenities: [string, boolean][] = [
    ["Pet friendly", l.petFriendly],
    ["Balcony", l.balcony],
    ["Clubhouse & pool", l.clubhouse],
    ["Parking available", l.parking],
    ["No agency commission", l.commissionFree],
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackToResults />
        <div className="flex items-center gap-2">
          <ShareButton title={listingTitle(l)} />
          <SaveButton id={l.id} variant="full" />
        </div>
      </div>

      <div className="grid gap-3 overflow-hidden rounded-3xl sm:grid-cols-5">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line sm:col-span-3 sm:aspect-auto sm:min-h-80">
          <FloorPlan listing={l} className="size-full" />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm">
            Indicative layout · photos on the source listing
          </span>
        </div>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-line sm:col-span-2 sm:aspect-auto sm:min-h-80">
          <ListingMap listing={l} />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <p className="text-sm text-muted">
            <Link href={`/?d=${l.district}`} className="hover:underline">
              {district?.name}
            </Link>{" "}
            · {l.estate}
            {l.block ? ` · ${l.block}` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{listingTitle(l)}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <MtrBadge station={l.mtrStation} mins={l.mtrWalkMins} />
            <span className="text-sm text-muted">
              <RelativeTime iso={l.listedAt} prefix="Listed" />
            </span>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">About this home</h2>
            <p className="mt-2 leading-relaxed text-stone-700">{l.description}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Features</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {amenities.map(([label, has]) => (
                <li key={label} className={`flex items-center gap-2 text-sm ${has ? "" : "text-stone-400 line-through"}`}>
                  <CheckIcon className={`size-4 ${has ? "text-emerald-600" : "text-stone-300"}`} />
                  {label}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Is this a fair price?</h2>
            <div className="mt-3 rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PriceRatingBadge rating={l.priceRating} />
                <p className="text-sm text-muted">
                  {district?.name} median: <span className="font-medium text-ink">${l.districtMedianPerSqft}/sq ft</span>
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">
                At <span className="font-semibold">${l.pricePerSqft}/sq ft</span> of saleable area, this home is{" "}
                {psfDiff === 0 ? (
                  "right at"
                ) : (
                  <span className="font-semibold">
                    {Math.abs(psfDiff)}% {psfDiff < 0 ? "below" : "above"}
                  </span>
                )}{" "}
                the typical rent for comparable homes in {district?.name}.
                {l.view === "Sea" && " Sea views usually command a premium."}
                {l.floorZone === "High" && " High floors usually cost a little more."}
              </p>
              <PriceScale value={l.pricePerSqft} median={l.districtMedianPerSqft} />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Neighbourhood</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              {district?.name} covers {district?.areas}.{" "}
              <Link href={`/?d=${l.district}`} className="font-medium text-brand hover:underline">
                See all homes in {district?.name} →
              </Link>
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-3xl font-semibold tracking-tight">
              {formatPrice(l.price)}
              <span className="text-base font-normal text-muted">/month</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              ${l.pricePerSqft}/sq ft · {formatNumber(l.saleableArea)} sq ft saleable
            </p>

            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">
                  {l.offers.length > 1 ? `Advertised by ${l.offers.length} sources` : "Advertised by"}
                </h2>
                {l.offers.length > 1 && highest.price > lowest.price && (
                  <span className="text-xs font-medium text-emerald-700">Save {formatPrice(highest.price - lowest.price)}/mo</span>
                )}
              </div>
              <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                {l.offers.map((o, i) => (
                  <li key={o.source} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{o.source}</p>
                      <p className="text-xs text-muted">
                        {o.sourceType === "landlord" ? "Landlord" : "Agency"}
                        {o.commissionFree ? " · No commission" : " · ½ month commission"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${i === 0 && l.offers.length > 1 ? "text-emerald-700" : ""}`}>{formatPrice(o.price)}</p>
                      {i === 0 && l.offers.length > 1 && <p className="text-[11px] text-emerald-700">Lowest</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <ContactButton source={lowest.source} />

            <div className="mt-6 border-t border-line pt-5">
              <h2 className="text-sm font-semibold">Estimated move-in cost</h2>
              <dl className="mt-2 space-y-1.5 text-sm">
                {[
                  ["Deposit (2 months)", cost.deposit],
                  ["First month's rent", cost.advance],
                  ["Agency commission", cost.commission],
                  ["Stamp duty (your half)", cost.stampDuty],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-muted">{label}</dt>
                    <dd>{value === 0 ? "None" : formatPrice(value as number)}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t border-line pt-2 font-semibold">
                  <dt>Total upfront</dt>
                  <dd>{formatPrice(cost.total)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted">Typical 2-year lease. Check the exact terms with the agent or landlord.</p>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-lg font-semibold">Similar homes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <ListingCard key={s.id} listing={s} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function PriceScale({ value, median }: { value: number; median: number }) {
  const min = median * 0.6;
  const max = median * 1.4;
  const pct = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  return (
    <div className="mt-5">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-400 via-stone-200 to-amber-400">
        <span className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-stone-500" style={{ left: pct(median) }} />
        <span
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow"
          style={{ left: pct(value) }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>Lower</span>
        <span>District median</span>
        <span>Higher</span>
      </div>
    </div>
  );
}
