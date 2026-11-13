"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DISTRICTS, STATION_LINE, stationLine } from "@/lib/hk";
import { LISTINGS } from "@/lib/listings";
import { CloseIcon, HomeIcon, MapIcon, SearchIcon, TrainIcon } from "./icons";

type Suggestion =
  | { kind: "district"; id: string; label: string; detail: string }
  | { kind: "estate"; label: string; detail: string }
  | { kind: "station"; label: string; detail: string; color: string };

const ESTATES = [...new Map(LISTINGS.map((l) => [l.estate, l])).values()];
const ESTATE_COUNTS = LISTINGS.reduce<Record<string, number>>((acc, l) => {
  acc[l.estate] = (acc[l.estate] ?? 0) + 1;
  return acc;
}, {});

function score(name: string, q: string, extra = "") {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  if (extra.toLowerCase().includes(q)) return 3;
  return null;
}

function suggestionsFor(text: string): Suggestion[] {
  const q = text.trim().toLowerCase();
  if (q.length < 1) return [];
  const scored: { s: Suggestion; score: number }[] = [];
  for (const d of DISTRICTS) {
    const sc = score(d.name, q, d.areas);
    if (sc != null) scored.push({ score: sc, s: { kind: "district", id: d.id, label: d.name, detail: d.areas } });
  }
  for (const st of Object.keys(STATION_LINE)) {
    const sc = score(st, q);
    const line = stationLine(st);
    if (sc != null) scored.push({ score: sc, s: { kind: "station", label: st, detail: line?.name ?? "MTR", color: line?.color ?? "#57534e" } });
  }
  for (const l of ESTATES) {
    const sc = score(l.estate, q);
    if (sc != null) scored.push({ score: sc, s: { kind: "estate", label: l.estate, detail: `${ESTATE_COUNTS[l.estate]} homes` } });
  }
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map((x) => x.s);
}

export function SearchBox({
  value,
  onSubmit,
  onPickDistrict,
  size = "md",
}: {
  value: string;
  onSubmit: (q: string) => void;
  onPickDistrict: (id: string) => void;
  size?: "md" | "lg";
}) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const [lastValue, setLastValue] = useState(value);
  const [submitted, setSubmitted] = useState(value);

  // Only adopt external changes (back button, popular-search links), never the
  // echo of what the user just typed, so in-flight keystrokes aren't overwritten.
  if (value !== lastValue) {
    setLastValue(value);
    if (value.trim() !== submitted.trim()) setText(value);
  }

  const submit = (q: string) => {
    setSubmitted(q);
    onSubmit(q);
  };

  const suggestions = useMemo(() => suggestionsFor(text), [text]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (text.trim() === value.trim()) return;
    const t = setTimeout(() => {
      setSubmitted(text);
      onSubmit(text);
    }, 300);
    return () => clearTimeout(t);
  }, [text, value, onSubmit]);

  const pick = (s: Suggestion) => {
    setOpen(false);
    if (s.kind === "district") {
      setText("");
      setSubmitted("");
      onPickDistrict(s.id);
    } else {
      setText(s.label);
      submit(s.label);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[highlight]) pick(suggestions[highlight]);
      else {
        setOpen(false);
        submit(text);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const lg = size === "lg";

  return (
    <div ref={ref} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-full border border-line bg-white shadow-sm transition focus-within:border-ink focus-within:shadow-md ${
          lg ? "h-14 pr-2 pl-5" : "h-11 pr-1.5 pl-4"
        }`}
      >
        <SearchIcon className={`shrink-0 text-muted ${lg ? "size-5" : "size-4"}`} />
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search estate, district or MTR station"
          aria-label="Search estate, district or MTR station"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="search-suggestions"
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-stone-400 ${lg ? "text-base" : "text-sm"}`}
        />
        {text && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText("");
              submit("");
            }}
            className="rounded-full p-1.5 text-muted hover:bg-stone-100"
          >
            <CloseIcon className="size-4" />
          </button>
        )}
        {lg && (
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              submit(text);
            }}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Search
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-full z-[1200] mt-2 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-xl"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.kind}-${s.label}`} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(s)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === highlight ? "bg-stone-100" : ""}`}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600"
                  style={s.kind === "station" ? { backgroundColor: s.color, color: "white" } : undefined}
                >
                  {s.kind === "district" ? <MapIcon className="size-4" /> : s.kind === "station" ? <TrainIcon className="size-4" /> : <HomeIcon className="size-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {s.label}
                    {s.kind === "station" && " Station"}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {s.kind === "district" ? `District · ${s.detail}` : s.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
