"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import {
  AREA_STEPS,
  FEATURES,
  FURNISHING,
  MTR_STEPS,
  PRICE_STEPS,
  PROPERTY_TYPES,
  type Filters,
} from "@/lib/filters";
import { DISTRICTS, REGIONS } from "@/lib/hk";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "./icons";

type Update = (patch: Partial<Filters>) => void;

export function Popover({
  label,
  active,
  children,
  align = "left",
}: {
  label: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
          active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-stone-400"
        }`}
      >
        {label}
        <ChevronDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={`fixed inset-x-3 top-auto z-[1200] mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:w-max sm:max-w-[min(560px,90vw)] ${
            align === "right" ? "sm:right-0" : "sm:left-0"
          }`}
        >
          {children}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-white">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ToggleChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
        pressed ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-stone-400"
      }`}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 text-sm select-none">
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? "border-ink bg-ink text-white" : "border-stone-300 bg-white"
        }`}
      >
        {checked && <CheckIcon className="size-3.5" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  options: { value: number; label: string }[];
  placeholder: string;
  label: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-ink"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export function PriceFields({ filters, update }: { filters: Filters; update: Update }) {
  const opts = PRICE_STEPS.map((v) => ({ value: v, label: formatPrice(v) }));
  return (
    <div className="flex min-w-64 gap-3">
      <Select
        label="Min rent"
        placeholder="No min"
        value={filters.minPrice}
        options={opts.filter((o) => filters.maxPrice == null || o.value < filters.maxPrice)}
        onChange={(v) => update({ minPrice: v })}
      />
      <Select
        label="Max rent"
        placeholder="No max"
        value={filters.maxPrice}
        options={opts.filter((o) => filters.minPrice == null || o.value > filters.minPrice)}
        onChange={(v) => update({ maxPrice: v })}
      />
    </div>
  );
}

export function AreaFields({ filters, update }: { filters: Filters; update: Update }) {
  const opts = AREA_STEPS.map((v) => ({ value: v, label: `${v} sq ft` }));
  return (
    <div className="flex min-w-64 gap-3">
      <Select label="Min size" placeholder="No min" value={filters.minArea} options={opts} onChange={(v) => update({ minArea: v })} />
      <Select label="Max size" placeholder="No max" value={filters.maxArea} options={opts} onChange={(v) => update({ maxArea: v })} />
    </div>
  );
}

const BED_OPTIONS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export function BedsField({ filters, update }: { filters: Filters; update: Update }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BED_OPTIONS.map((o) => (
        <ToggleChip key={o.value} pressed={filters.beds.includes(o.value)} onClick={() => update({ beds: toggle(filters.beds, o.value) })}>
          {o.label}
        </ToggleChip>
      ))}
    </div>
  );
}

export function MtrField({ filters, update }: { filters: Filters; update: Update }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ToggleChip pressed={filters.mtr == null} onClick={() => update({ mtr: null })}>
        Any
      </ToggleChip>
      {MTR_STEPS.map((m) => (
        <ToggleChip key={m} pressed={filters.mtr === m} onClick={() => update({ mtr: m })}>
          ≤ {m} min walk
        </ToggleChip>
      ))}
    </div>
  );
}

export function LocationField({ filters, update }: { filters: Filters; update: Update }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {REGIONS.map((region) => {
        const districts = DISTRICTS.filter((d) => d.region === region.id);
        const ids = districts.map((d) => d.id);
        const all = ids.every((id) => filters.districts.includes(id));
        return (
          <div key={region.id}>
            <div className="mb-1 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">{region.name}</p>
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() =>
                  update({
                    districts: all
                      ? filters.districts.filter((d) => !ids.includes(d))
                      : [...new Set([...filters.districts, ...ids])],
                  })
                }
              >
                {all ? "Clear" : "Select all"}
              </button>
            </div>
            {districts.map((d) => (
              <Checkbox key={d.id} checked={filters.districts.includes(d.id)} onChange={() => update({ districts: toggle(filters.districts, d.id) })}>
                <span>
                  {d.name}
                  <span className="block text-xs text-muted">{d.areas}</span>
                </span>
              </Checkbox>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-5 last:border-0">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function FiltersDrawer({
  open,
  onClose,
  filters,
  update,
  onClear,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  update: Update;
  onClear: () => void;
  resultCount: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex justify-end" role="dialog" aria-modal="true" aria-label="All filters">
      <button type="button" aria-label="Close filters" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-stone-100" aria-label="Close">
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <Section title="Monthly rent">
            <PriceFields filters={filters} update={update} />
          </Section>
          <Section title="Bedrooms">
            <BedsField filters={filters} update={update} />
          </Section>
          <Section title="Saleable area">
            <AreaFields filters={filters} update={update} />
          </Section>
          <Section title="Walk to MTR">
            <MtrField filters={filters} update={update} />
          </Section>
          <Section title="Must-haves">
            <div className="grid grid-cols-2 gap-x-4">
              {FEATURES.map((f) => (
                <Checkbox key={f.id} checked={filters.features.includes(f.id)} onChange={() => update({ features: toggle(filters.features, f.id) })}>
                  {f.label}
                </Checkbox>
              ))}
            </div>
          </Section>
          <Section title="Property type">
            {PROPERTY_TYPES.map((t) => (
              <Checkbox key={t} checked={filters.types.includes(t)} onChange={() => update({ types: toggle(filters.types, t) })}>
                {t}
              </Checkbox>
            ))}
          </Section>
          <Section title="Furnishing">
            {FURNISHING.map((t) => (
              <Checkbox key={t} checked={filters.furnishing.includes(t)} onChange={() => update({ furnishing: toggle(filters.furnishing, t) })}>
                {t}
              </Checkbox>
            ))}
          </Section>
          <Section title="Location">
            <LocationField filters={filters} update={update} />
          </Section>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <button type="button" onClick={onClear} className="text-sm font-medium underline underline-offset-4">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
            Show {resultCount} {resultCount === 1 ? "home" : "homes"}
          </button>
        </div>
      </div>
    </div>
  );
}
