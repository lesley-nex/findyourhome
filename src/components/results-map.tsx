"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { bedroomLabel, formatPrice, formatShortPrice, listingTitle } from "@/lib/format";
import type { Listing } from "@/lib/types";

export type Bounds = { south: number; west: number; north: number; east: number };

const HK_CENTER: [number, number] = [22.35, 114.12];
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function pinIcon(l: Listing, active: boolean) {
  const cls = ["price-pin", l.priceRating === "great" ? "is-great" : "", active ? "is-active" : ""].join(" ");
  return L.divIcon({
    className: "pin-host",
    html: `<span class="${cls}">${formatShortPrice(l.price)}</span>`,
    iconSize: [0, 0],
  });
}

function FitToResults({ listings, fitKey }: { listings: Listing[]; fitKey: string }) {
  const map = useMap();
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    // A hidden map (e.g. mobile list view) has no size, so defer fitting until it's shown.
    const fit = () => {
      const el = map.getContainer();
      if (el.clientWidth === 0 || el.clientHeight === 0) return;
      if (lastKey.current === fitKey || listings.length === 0) return;
      lastKey.current = fitKey;
      map.invalidateSize();
      const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [fitKey, listings, map]);
  return null;
}

function BoundsWatcher({ onChange }: { onChange: (b: Bounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onChange({ south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() });
    },
  });
  useEffect(() => {
    const b = map.getBounds();
    onChange({ south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() });
  }, [map, onChange]);
  return null;
}

function ResizeOnShow() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function PriceMarker({ listing, active, onHover }: { listing: Listing; active: boolean; onHover?: (id: string | null) => void }) {
  const icon = useMemo(() => pinIcon(listing, active), [listing, active]);
  return (
    <Marker
      position={[listing.lat, listing.lng]}
      icon={icon}
      zIndexOffset={active ? 1000 : listing.priceRating === "great" ? 100 : 0}
      eventHandlers={onHover ? { mouseover: () => onHover(listing.id), mouseout: () => onHover(null) } : undefined}
    >
      <Popup closeButton={false} offset={[0, -24]}>
        <Link href={`/listing/${listing.id}`} className="block p-3 text-ink! no-underline">
          <p className="text-base font-semibold">{formatPrice(listing.price)}/mo</p>
          <p className="mt-0.5 text-sm font-medium">{listingTitle(listing)}</p>
          <p className="mt-0.5 text-xs text-muted">
            {bedroomLabel(listing.bedrooms)} · {listing.saleableArea} sq ft · ${listing.pricePerSqft}/sq ft
          </p>
          <p className="mt-2 text-xs font-medium text-brand">View details →</p>
        </Link>
      </Popup>
    </Marker>
  );
}

export default function ResultsMap({
  listings,
  activeId = null,
  onHover,
  onBoundsChange,
  fitKey,
  zoom,
}: {
  listings: Listing[];
  activeId?: string | null;
  onHover?: (id: string | null) => void;
  onBoundsChange?: (b: Bounds) => void;
  fitKey?: string;
  zoom?: number;
}) {
  const single = listings.length === 1;
  return (
    <MapContainer
      center={single ? [listings[0].lat, listings[0].lng] : HK_CENTER}
      zoom={zoom ?? (single ? 16 : 11)}
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <ResizeOnShow />
      {fitKey !== undefined && <FitToResults listings={listings} fitKey={fitKey} />}
      {onBoundsChange && <BoundsWatcher onChange={onBoundsChange} />}
      {listings.map((l) => (
        <PriceMarker key={l.id} listing={l} active={l.id === activeId} onHover={onHover} />
      ))}
    </MapContainer>
  );
}
