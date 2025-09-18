# Next.js Migration Skeleton

This folder contains a non-destructive Next.js scaffold that mirrors your current static site (index.html, login.html, css/style.css, js/main.js) while preparing for SSR/SSG and API routes.

## Structure

- `pages/` – index and login pages, plus example API routes
- `components/Layout.tsx` – shared header/nav/footer
- `lib/data.ts` – temporary in-repo data (ported from main.js)
- `styles/globals.css` – CSS ported from css/style.css

## Run locally

1. Install dependencies
   - npm: `cd next-app && npm install`
2. Start dev server
   - `npm run dev`
3. Open http://localhost:3000

## Notes

- Home page uses `getStaticProps` to serve data from `lib/data.ts`.
- API routes: `/api/home` exposes the same data for clients/mobile. Replace with DB-backed logic later.
- Incrementally migrate more pages/components as needed.

