import type { Metadata } from "next";
import Link from "next/link";
import { DISTRICTS } from "@/lib/hk";
import { LISTINGS } from "@/lib/listings";

export const metadata: Metadata = {
  title: "How it works",
};

const STEPS = [
  {
    title: "We collect every listing",
    body: "Listings from agencies, landlords and platforms are pulled into one place, so you don't need ten tabs open to see what's on the market.",
  },
  {
    title: "We remove the duplicates",
    body: "The same flat is often advertised by several agents. We merge them into a single listing and show every offer side by side, with the lowest price first.",
  },
  {
    title: "We tell you if the price is fair",
    body: "Each home's rent per square foot of saleable area is compared with similar homes in the same district, so you can spot a great deal or an overpriced flat at a glance.",
  },
  {
    title: "We show the real cost",
    body: "Walking time to the nearest MTR station, commission-free flags and an estimate of what you'll pay on signing day: deposit, rent in advance, commission and stamp duty.",
  },
];

const FAQ = [
  {
    q: "What does “saleable area” mean?",
    a: "It's the floor area inside the flat, excluding shared spaces like lobbies and clubhouses. Since 2013 it's the standard measure in Hong Kong, and it's what we use for all price-per-square-foot comparisons.",
  },
  {
    q: "How much does it cost to move in?",
    a: "For a typical two-year lease, budget about 3.5 months' rent: a 2-month deposit, 1 month in advance, half a month's agency commission (unless it's commission-free) and your half of the stamp duty.",
  },
  {
    q: "Are the listings on this preview real?",
    a: "Not yet. This preview runs on sample listings for real estates across all 18 districts so the search experience can be tested end to end. Live sources are added through data adapters as partnerships are signed.",
  },
  {
    q: "I'm an agent or landlord. How do I list a home?",
    a: "We'd love to include your listings. Get in touch and we'll set up a feed. It's free to list.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-brand">How it works</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        Renting in Hong Kong shouldn&apos;t take ten tabs.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-stone-600">
        findyourhome.hk brings every rental across all {DISTRICTS.length} districts into one simple search, currently{" "}
        {LISTINGS.length} homes, and gives you the context you need to decide quickly.
      </p>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-line bg-white p-6">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
              {i + 1}
            </span>
            <h2 className="mt-4 font-semibold">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-14 rounded-3xl bg-ink p-8 text-white sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight">Ready to find your home?</h2>
        <p className="mt-2 text-stone-300">Search by estate, district or MTR station, and filter by what matters to you.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold hover:bg-brand-dark">
          Start searching
        </Link>
      </div>
    </main>
  );
}
