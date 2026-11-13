import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://findyourhome.hk"),
  title: {
    default: "findyourhome.hk — Every Hong Kong rental, in one place",
    template: "%s · findyourhome.hk",
  },
  description:
    "Search apartments for rent across all 18 Hong Kong districts. Listings from agencies and landlords merged into one simple search, with fair-price checks, MTR walking times and move-in cost estimates.",
  openGraph: {
    siteName: "findyourhome.hk",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e8453c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-HK" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {children}
        <footer className="border-t border-line bg-white">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>© {new Date().getFullYear()} findyourhome.hk · Every Hong Kong rental, in one place.</p>
            <p>Preview build: listings are sample data for real Hong Kong estates.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
