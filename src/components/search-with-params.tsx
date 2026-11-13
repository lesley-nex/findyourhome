"use client";

import { useSearchParams } from "next/navigation";
import { SearchExperience } from "./search-experience";

export function SearchWithParams() {
  const params = useSearchParams();
  return <SearchExperience params={new URLSearchParams(params.toString())} />;
}
