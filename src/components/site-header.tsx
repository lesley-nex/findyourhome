"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/saved";
import { HeartIcon, HomeIcon } from "./icons";

export function SiteHeader() {
  const pathname = usePathname();
  const { saved } = useSaved();

  const navLink = (href: string, label: React.ReactNode, active: boolean) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-ink text-white" : "text-ink hover:bg-stone-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="findyourhome.hk home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
            <HomeIcon className="size-5" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">
            findyourhome<span className="text-brand">.hk</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLink(
            "/saved",
            <>
              <HeartIcon className="size-4" filled={saved.length > 0} />
              <span className="hidden sm:inline">Saved</span>
              {saved.length > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    pathname.startsWith("/saved") ? "bg-white/20" : "bg-brand text-white"
                  }`}
                >
                  {saved.length}
                </span>
              )}
            </>,
            pathname.startsWith("/saved"),
          )}
          {navLink("/about", "How it works", pathname.startsWith("/about"))}
        </nav>
      </div>
    </header>
  );
}
