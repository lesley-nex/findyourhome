import { Suspense } from "react";
import { SearchWithParams } from "@/components/search-with-params";
import { SearchExperience } from "@/components/search-experience";

export default function Home() {
  return (
    <Suspense fallback={<SearchExperience params={null} />}>
      <SearchWithParams />
    </Suspense>
  );
}
