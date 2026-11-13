"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { relativeDays } from "@/lib/format";
import { ChevronLeftIcon, ShareIcon } from "./icons";

export const LAST_SEARCH_KEY = "fyh:last-search";

const noopSubscribe = () => () => {};

export function BackToResults() {
  const search = useSyncExternalStore(
    noopSubscribe,
    () => sessionStorage.getItem(LAST_SEARCH_KEY) ?? "",
    () => "",
  );
  return (
    <Link href={search ? `/?${search}` : "/"} className="flex items-center gap-1 rounded-full py-2 pr-3 text-sm font-medium hover:underline">
      <ChevronLeftIcon className="size-4" />
      Back to results
    </Link>
  );
}

export function RelativeTime({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const minute = useSyncExternalStore(noopSubscribe, () => Math.floor(Date.now() / 60_000), () => null);
  if (minute == null) return null;
  const text = relativeDays(iso, minute * 60_000);
  return <>{prefix ? `${prefix} ${text.toLowerCase()}` : text}</>;
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fall through to copying when the share sheet is dismissed or unavailable.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:bg-stone-50"
    >
      <ShareIcon className="size-4" />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

export function ContactButton({ source }: { source: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Contact {source}
      </button>
      {open && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          This preview uses sample listings. Once live data sources are connected, this button opens the original listing
          and the agent&apos;s WhatsApp or phone number.
        </p>
      )}
    </div>
  );
}
