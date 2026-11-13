import type { Metadata } from "next";
import { SavedHomes } from "@/components/saved-homes";

export const metadata: Metadata = {
  title: "Saved homes",
};

export default function SavedPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Saved homes</h1>
      <p className="mt-1 text-muted">Saved on this device. Compare them side by side before you book viewings.</p>
      <SavedHomes />
    </main>
  );
}
