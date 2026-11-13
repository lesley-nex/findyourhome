# findyourhome.hk

Every Hong Kong rental, in one place. A fast, simple search across all 18 districts that merges duplicate listings, flags fair prices and shows the real cost of moving in.

## Features

- One search box for estates, districts and MTR stations, with suggestions
- Filters for rent, bedrooms, saleable area, MTR walking time, pets, commission-free, furnishing, property type and more, all kept in the URL so searches can be shared
- Split list and map view with price pins, plus "search as I move the map"
- Duplicate listings merged into one, showing every agent's price with the lowest first
- Fair-price check: rent per sq ft compared with the district median
- Move-in cost estimate (deposit, rent in advance, commission, stamp duty)
- Save homes on the device and compare them side by side
- Mobile-first layout with a full-screen map and filter sheet

## Develop

```bash
npm install
npm run dev        # regenerates src/data/listings.json, then starts Next.js
npm run build      # static export to ./out
```

## Data pipeline

`scripts/build-listings.mjs` runs before every dev and build. It calls each adapter in `scripts/sources/`, merges listings for the same flat (same estate, block, floor zone, bedrooms and area), computes district medians and price ratings, and writes `src/data/listings.json`.

The only adapter today is `sample.mjs`, which generates realistic but **fictional** listings for real estates. To add a real source (licensed feed, agency API, partner CSV), create another adapter that exports `fetchListings()` returning the `RawListing` shape documented at the top of `build-listings.mjs`, and add it to `SOURCES`. Make sure you have the right to use the data. Most listing portals prohibit scraping in their terms.

## Deploy

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. The site also rebuilds daily.

### Custom domain (findyourhome.hk)

1. Register `findyourhome.hk` with a .hk registrar (e.g. HKDNR or any accredited registrar).
2. At your DNS provider, add `A` records for the apex pointing to GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` pointing to `<github-user>.github.io`.
3. In the repo, set the Actions variable `CUSTOM_DOMAIN` to `findyourhome.hk`. This removes the `/<repo>` base path.
4. In **Settings → Pages**, set the custom domain to `findyourhome.hk` and enable **Enforce HTTPS**.
5. Re-run the deploy workflow.
