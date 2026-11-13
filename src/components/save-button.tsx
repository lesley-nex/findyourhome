"use client";

import { useSaved } from "@/lib/saved";
import { HeartIcon } from "./icons";

export function SaveButton({ id, variant = "overlay" }: { id: string; variant?: "overlay" | "full" }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(id);
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          saved ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white hover:bg-stone-50"
        }`}
      >
        <HeartIcon className="size-4" filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save home"}
      className="flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white"
    >
      <HeartIcon className={`size-[18px] ${saved ? "text-brand" : "text-ink"}`} filled={saved} />
    </button>
  );
}
