"use client";

import dynamic from "next/dynamic";
import type { Listing } from "@/lib/types";

const ResultsMap = dynamic(() => import("./results-map"), {
  ssr: false,
  loading: () => <div className="size-full min-h-60 animate-pulse bg-stone-200" />,
});

export function ListingMap({ listing }: { listing: Listing }) {
  return (
    <div className="size-full min-h-60">
      <ResultsMap listings={[listing]} zoom={15} />
    </div>
  );
}
