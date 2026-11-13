"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  FEATURES,
  parseFilters,
  serializeFilters,
  SORTS,
  type Filters,
  type SortId,
} from "@/lib/filters";
import { bedroomLabel, formatPrice } from "@/lib/format";
import { DISTRICT_BY_ID, DISTRICTS } from "@/lib/hk";
import { LISTINGS } from "@/lib/listings";
import type { Bounds } from "./results-map";
import {
  AreaFields,
  BedsField,
  FiltersDrawer,
  LocationField,
  MtrField,
  Popover,
  PriceFields,
  ToggleChip,
} from "./filter-controls";
import { CloseIcon, ListIcon, MapIcon, SlidersIcon } from "./icons";
import { LAST_SEARCH_KEY } from "./listing-actions";
import { ListingCard } from "./listing-card";
import { SearchBox } from "./search-box";

const ResultsMap = dynamic(() => import("./results-map"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-stone-200" />,
});

const PAGE_SIZE = 24;
const AGENCY_COUNT = new Set(LISTINGS.flatMap((l) => l.offers.map((o) => o.source))).size;

const POPULAR: { label: string; query: string }[] = [
  { label: "Under $15k near MTR", query: "max=15000&mtr=10" },
  { label: "Pet friendly", query: "f=pets" },
  { label: "Sea views", query: "f=seaview" },
  { label: "No commission", query: "f=nocomm" },
  { label: "Studios on HK Island", query: "beds=0&d=central-western,wan-chai,eastern,southern" },
  { label: "Family homes in Sha Tin", query: "beds=3,4&d=sha-tin" },
  { label: "Great-price deals", query: "f=deal&sort=psf-asc" },
];

function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function inBounds(lat: number, lng: number, b: Bounds) {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

function activeChips(f: Filters): { key: string; label: string; clear: Partial<Filters> }[] {
  const chips: { key: string; label: string; clear: Partial<Filters> }[] = [];
  if (f.q) chips.push({ key: "q", label: `“${f.q}”`, clear: { q: "" } });
  for (const d of f.districts) {
    chips.push({ key: `d-${d}`, label: DISTRICT_BY_ID[d]?.name ?? d, clear: { districts: f.districts.filter((x) => x !== d) } });
  }
  if (f.minPrice != null || f.maxPrice != null) {
    const label =
      f.minPrice != null && f.maxPrice != null
        ? `${formatPrice(f.minPrice)} – ${formatPrice(f.maxPrice)}`
        : f.minPrice != null
          ? `From ${formatPrice(f.minPrice)}`
          : `Up to ${formatPrice(f.maxPrice!)}`;
    chips.push({ key: "price", label, clear: { minPrice: null, maxPrice: null } });
  }
  if (f.beds.length) {
    chips.push({
      key: "beds",
      label: [...f.beds].sort().map((b) => (b === 4 ? "4+ bd" : bedroomLabel(b, true))).join(", "),
      clear: { beds: [] },
    });
  }
  if (f.minArea != null || f.maxArea != null) {
    chips.push({ key: "area", label: `${f.minArea ?? 0}–${f.maxArea ?? "∞"} sq ft`, clear: { minArea: null, maxArea: null } });
  }
  if (f.mtr != null) chips.push({ key: "mtr", label: `≤ ${f.mtr} min to MTR`, clear: { mtr: null } });
  for (const t of f.types) chips.push({ key: `t-${t}`, label: t, clear: { types: f.types.filter((x) => x !== t) } });
  for (const t of f.furnishing) chips.push({ key: `fu-${t}`, label: t, clear: { furnishing: f.furnishing.filter((x) => x !== t) } });
  for (const id of f.features) {
    chips.push({ key: `f-${id}`, label: FEATURES.find((x) => x.id === id)!.label, clear: { features: f.features.filter((x) => x !== id) } });
  }
  return chips;
}

function useStickyOffset() {
  const [height, setHeight] = useState(62);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}

/** `params` is null while prerendering, when the query string isn't known yet. */
export function SearchExperience({ params }: { params: URLSearchParams | null }) {
  const [filters, setFilters] = useState<Filters>(() => (params ? parseFilters(params) : EMPTY_FILTERS));
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [showMap, setShowMap] = useState(true);
  const [searchOnMove, setSearchOnMove] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [page, setPage] = useState({ key: "", count: PAGE_SIZE });
  const [barRef, barHeight] = useStickyOffset();

  // Adopt URL changes that didn't come from this component (e.g. clicking the logo).
  const paramsKey = params?.toString() ?? null;
  const [lastParamsKey, setLastParamsKey] = useState(paramsKey);
  if (paramsKey !== lastParamsKey) {
    setLastParamsKey(paramsKey);
    if (params && paramsKey !== serializeFilters(filters)) setFilters(parseFilters(params));
  }

  const syncUrl = params !== null;
  useEffect(() => {
    if (!syncUrl) return;
    const qs = serializeFilters(filters);
    sessionStorage.setItem(LAST_SEARCH_KEY, qs);
    if (window.location.search.replace(/^\?/, "") !== qs) {
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    }
  }, [filters, syncUrl]);

  const update = useCallback((patch: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...patch })), []);

  const onSubmitQuery = useCallback((q: string) => update({ q }), [update]);
  const onPickDistrict = useCallback(
    (id: string) =>
      setFilters((prev) => ({ ...prev, q: "", districts: prev.districts.includes(id) ? prev.districts : [...prev.districts, id] })),
    [],
  );

  const filtered = useMemo(() => applyFilters(LISTINGS, filters), [filters]);
  const fitKey = useMemo(() => serializeFilters({ ...filters, sort: "newest" }), [filters]);
  const results = useMemo(
    () => (searchOnMove && bounds ? filtered.filter((l) => inBounds(l.lat, l.lng, bounds)) : filtered),
    [filtered, searchOnMove, bounds],
  );

  const pageKey = `${fitKey}|${filters.sort}|${searchOnMove}`;
  const visibleCount = page.key === pageKey ? page.count : PAGE_SIZE;
  const visible = results.slice(0, visibleCount);

  const chips = activeChips(filters);
  const filterCount = activeFilterCount(filters);
  // The hero (with its own search box) stays while typing, so focus isn't lost mid-query.
  const isDefault = filterCount === 0;
  const medianPrice = median(results.map((l) => l.price));
  const medianPsf = median(results.map((l) => l.pricePerSqft));

  const priceLabel =
    filters.minPrice != null || filters.maxPrice != null
      ? chips.find((c) => c.key === "price")!.label
      : "Price";
  const bedsLabel = filters.beds.length ? chips.find((c) => c.key === "beds")!.label : "Bedrooms";
  const locationLabel =
    filters.districts.length === 0
      ? "Location"
      : filters.districts.length === 1
        ? DISTRICT_BY_ID[filters.districts[0]].name
        : `${filters.districts.length} districts`;

  const toggleFeature = (id: Filters["features"][number]) =>
    update({ features: filters.features.includes(id) ? filters.features.filter((x) => x !== id) : [...filters.features, id] });

  return (
    <div className="flex flex-1 flex-col">
      {isDefault && (
        <section
          className={`border-b border-line bg-gradient-to-b from-brand-soft/70 to-canvas ${mobileView === "map" ? "hidden lg:block" : ""}`}
        >
          <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Every Hong Kong rental, <span className="text-brand">in one place.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-stone-600 sm:text-lg">
              We merge listings from agencies and landlords across all 18 districts, remove the duplicates, and tell you
              whether the price is fair.
            </p>
            <div className="mt-6 max-w-2xl">
              <SearchBox value={filters.q} onSubmit={onSubmitQuery} onPickDistrict={onPickDistrict} size="lg" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">Popular:</span>
              {POPULAR.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFilters(parseFilters(new URLSearchParams(p.query)))}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-sm hover:border-stone-400"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-4">
              {[
                [LISTINGS.length.toLocaleString(), "homes to rent"],
                [String(DISTRICTS.length), "districts covered"],
                [String(AGENCY_COUNT), "sources merged"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight">{value}</dd>
                  <dd className="text-sm text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <div ref={barRef} className="sticky top-14 z-[1050] border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6">
          {!isDefault && (
            <div className="max-w-xl">
              <SearchBox value={filters.q} onSubmit={onSubmitQuery} onPickDistrict={onPickDistrict} />
            </div>
          )}
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium hover:border-stone-400"
            >
              <SlidersIcon className="size-4" />
              Filters
              {filterCount > 0 && <span className="rounded-full bg-brand px-1.5 text-xs text-white tabular-nums">{filterCount}</span>}
            </button>
            <Popover label={locationLabel} active={filters.districts.length > 0}>
              <LocationField filters={filters} update={update} />
            </Popover>
            <Popover label={priceLabel} active={filters.minPrice != null || filters.maxPrice != null}>
              <PriceFields filters={filters} update={update} />
            </Popover>
            <Popover label={bedsLabel} active={filters.beds.length > 0}>
              <BedsField filters={filters} update={update} />
            </Popover>
            <Popover label="Size" active={filters.minArea != null || filters.maxArea != null}>
              <AreaFields filters={filters} update={update} />
            </Popover>
            <Popover label={filters.mtr != null ? `≤ ${filters.mtr} min MTR` : "MTR"} active={filters.mtr != null}>
              <MtrField filters={filters} update={update} />
            </Popover>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <ToggleChip pressed={filters.features.includes("pets")} onClick={() => toggleFeature("pets")}>
              Pet friendly
            </ToggleChip>
            <ToggleChip pressed={filters.features.includes("nocomm")} onClick={() => toggleFeature("nocomm")}>
              No commission
            </ToggleChip>
            <ToggleChip pressed={filters.features.includes("deal")} onClick={() => toggleFeature("deal")}>
              Great price
            </ToggleChip>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1">
        <main className={`min-w-0 flex-1 px-4 py-5 sm:px-6 ${mobileView === "map" ? "hidden lg:block" : ""}`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight" aria-live="polite">
                {results.length.toLocaleString()} {results.length === 1 ? "home" : "homes"} for rent
                {searchOnMove && bounds ? " in this map area" : ""}
              </h2>
              {results.length > 0 && (
                <p className="text-sm text-muted">
                  Median {formatPrice(medianPrice)}/mo · ${medianPsf}/sq ft
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted">Sort</span>
                <select
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortId })}
                  className="h-9 rounded-full border border-line bg-white px-3 text-sm font-medium outline-none focus:border-ink"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setShowMap((s) => !s)}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium hover:border-stone-400 lg:flex"
              >
                <MapIcon className="size-4" />
                {showMap ? "Hide map" : "Show map"}
              </button>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => update(c.clear)}
                  className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pr-2 pl-3 text-sm hover:bg-stone-200"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label}
                  <CloseIcon className="size-3.5" />
                </button>
              ))}
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="px-2 text-sm font-medium underline underline-offset-4">
                Clear all
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <p className="text-lg font-semibold">No homes match all of those filters</p>
              <p className="mt-1 text-sm text-muted">
                {searchOnMove ? "Try zooming out on the map, or " : "Try "}removing a filter or widening your budget.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchOnMove(false);
                  setFilters(EMPTY_FILTERS);
                }}
                className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 sm:grid-cols-2 ${
                  showMap ? "xl:grid-cols-2 2xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {visible.map((l) => (
                  <ListingCard key={l.id} listing={l} active={hoverId === l.id} onHover={setHoverId} />
                ))}
              </div>
              {visible.length < results.length && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <p className="text-sm text-muted">
                    Showing {visible.length} of {results.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPage({ key: pageKey, count: visibleCount + PAGE_SIZE })}
                    className="rounded-full border border-ink px-6 py-2.5 text-sm font-medium hover:bg-ink hover:text-white"
                  >
                    Show more homes
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <aside
          className={`${mobileView === "map" ? "block" : "hidden"} ${showMap ? "lg:block" : "lg:hidden"} sticky top-[var(--map-top)] h-[calc(100dvh-var(--map-top))] w-full shrink-0 lg:w-[42%] lg:border-l lg:border-line`}
          style={{ "--map-top": `${56 + barHeight}px` } as React.CSSProperties}
        >
          <div className="relative size-full">
            <ResultsMap
              listings={filtered}
              activeId={hoverId}
              onHover={setHoverId}
              fitKey={fitKey}
              onBoundsChange={searchOnMove ? setBounds : undefined}
            />
            <label className="absolute top-3 left-1/2 z-[1000] flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium whitespace-nowrap shadow-md select-none">
              <input
                type="checkbox"
                checked={searchOnMove}
                onChange={(e) => {
                  setSearchOnMove(e.target.checked);
                  if (!e.target.checked) setBounds(null);
                }}
                className="size-4 accent-brand"
              />
              Search as I move the map
            </label>
          </div>
        </aside>
      </div>

      <button
        type="button"
        onClick={() => {
          setMobileView((v) => (v === "list" ? "map" : "list"));
          window.scrollTo({ top: 0 });
        }}
        className="fixed bottom-6 left-1/2 z-[1100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl lg:hidden"
      >
        {mobileView === "list" ? (
          <>
            <MapIcon className="size-4" /> Map
          </>
        ) : (
          <>
            <ListIcon className="size-4" /> List ({results.length})
          </>
        )}
      </button>

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        update={update}
        onClear={() => setFilters(EMPTY_FILTERS)}
        resultCount={results.length}
      />
    </div>
  );
}
