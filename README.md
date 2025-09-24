This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deploying under a sub-path (e.g. GitHub Pages)

By default the app assumes it is deployed from the domain root (as on Vercel).

If you need to host the site behind a reverse proxy or under a sub-path, set the `NEXT_PUBLIC_BASE_PATH`

environment variable before building, for example:

```bash
NEXT_PUBLIC_BASE_PATH=/dem-fre.chat npm run build
```

This will ensure the generated assets and runtime requests use the correct base path.



You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase configuration for the Newsbot

The Python services that power the Newsbot features must talk to the **same Supabase project** as the Next.js frontend. Make sure
your deployment environment provides the following variables:

- `NEXT_PUBLIC_SUPABASE_URL` — shared by the Next.js app and the Python runtime. You can also set `SUPABASE_URL` explicitly for
  Python processes; when omitted, the Python code will reuse `NEXT_PUBLIC_SUPABASE_URL` automatically.
- `SUPABASE_SERVICE_ROLE_KEY` — **required** for the Python runtime. It enables the background tasks to insert and update data.
  Anonymous keys (`SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are only useful for local diagnostics and will trigger a
  warning because they lack write permissions needed in production.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
