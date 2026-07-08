# Racecard Reader

A production rebuild of the Racecard Reader prototype: upload a horse racing
meeting (PDF or CSV), get a clean, readable table of every runner with their
full stewards/vet report history, and print exactly what's on screen with
nothing cut off.

## Stack, and why

- **Next.js 16 (App Router, TypeScript)** - one deployable app for both the
  UI and the API routes (upload handling, parsing, notes), rather than a
  separate Vite SPA + Express backend. Simplest path to the "PDF upload plus
  database plus SSO" scope this app landed on.
- **Postgres + Drizzle ORM** - plain SQL-shaped schema, no native binary
  engine to install (Prisma's schema-engine binary download is blocked in
  some sandboxed/offline environments, which is why this project uses
  Drizzle instead - see `src/db/schema.ts`).
- **Clerk** for auth (Google/Microsoft SSO) - a few lines of middleware and
  `<ClerkProvider>` instead of hand-rolling OAuth.
- **Anthropic Claude** for turning messy extracted racecard text into
  structured data (see "How racecard parsing works" below).
- **CSS Modules** - the original prototype's design is entirely inline
  styles with exact pixel/hex values; CSS Modules preserve that fidelity
  while keeping it out of JSX. A few genuinely dynamic values (column
  widths, divider offsets, print zoom) stay as inline styles, same as the
  original.

## Getting started locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database.** Either run the bundled throwaway Postgres:

   ```bash
   docker compose up -d
   ```

   or point `DATABASE_URL` at any Postgres you already have (Neon, Supabase,
   a local install, etc).

3. **Environment variables.** Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` - see above.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - create a free
     app at [dashboard.clerk.com](https://dashboard.clerk.com), then enable
     **Google** and **Microsoft** under User & Authentication > Social
     Connections. Copy the two keys from API Keys.
   - `ANTHROPIC_API_KEY` - from [console.anthropic.com](https://console.anthropic.com).
     Only needed for parsing real uploaded racecards; you can skip it if
     you're only trying the demo meeting.

4. **Create the schema:**

   ```bash
   npm run db:push
   ```

   (Use `npm run db:generate` + `npm run db:migrate` instead if you want
   versioned migration files checked into git - one has already been
   generated for you under `drizzle/`.)

5. **Run it:**

   ```bash
   npm run dev
   ```

   Sign in (Clerk will prompt you to configure your social connections if
   you haven't yet), then either upload a PDF/CSV or click "try it with a
   sample demo meeting" on the upload screen.

   To seed the demo meeting straight into the database for a specific user
   without going through the UI: `npm run db:seed -- <your-clerk-user-id>`
   (find your user id in the Clerk dashboard, or in the browser dev tools
   under `window.Clerk.user.id` once signed in).

## How racecard parsing works

Real racecard PDFs vary hugely between providers (Racing Post, At The Races,
Timeform, ...), so rather than hand-writing layout/column detection, the
pipeline is:

1. `src/lib/parsing/extractText.ts` - pull raw text out of the PDF (via
   `pdfjs-dist`) or normalize the CSV, preserving rough reading order.
2. `src/lib/parsing/structure.ts` - hand that text to Claude with a strict
   tool-call schema (races → runners → chronological reports), validate the
   result with Zod, and retry once with the validation errors if it doesn't
   match.
3. `src/lib/meetingRepo.ts` - persist the validated result.

This is inherently best-effort. **It hasn't been tuned against real sample
racecards** (none were available while building this) - expect to iterate on
the prompt in `structure.ts` once you try it against PDFs from your actual
source. Failed parses are stored as a `failed` meeting (visible in "Recent
uploads" with the error message) rather than silently dropped, so you can
see what went wrong.

Upload processing runs in the background after the API responds (see the
comment in `src/app/api/meetings/route.ts`) - this relies on the Node
process staying alive between requests, which holds on a normal persistent
server but **not** on serverless request-scoped runtimes (e.g. Vercel
functions). If you deploy there instead, swap that for a real job queue.

## Print behaviour (the core value prop)

"Print racecard" renders every race, one per printed page, using your
current column widths and column visibility exactly as configured on
screen. `src/lib/hooks/usePrintZoom.ts` ports the prototype's
`updatePrintZoom` logic exactly: it computes the total configured width
across visible columns, compares it to a ~700px portrait-page target, and
injects a print-only `zoom` factor so nothing is ever cut off - a full
6-column table at generous widths just gets shrunk uniformly instead of
truncating cell text. Text truncation is also lifted globally at print
time (see the `.rc-truncate` print override in `src/app/globals.css`).

## Deployment

This needs a persistent Node server (not a static host) because of the
background upload processing described above. Any of these work well with
Postgres + a long-running Node process:

- **Fly.io** - `fly launch` (it'll detect the Dockerfile), `fly postgres
  create` for the database, `fly secrets set` for the env vars above.
- **Railway** - new project from this repo, add a Postgres plugin, set the
  env vars, it builds the Dockerfile automatically.
- **Render** - "Web Service" from this repo (Docker runtime), add a managed
  Postgres instance, set the env vars.

A production-ready `Dockerfile` and `.dockerignore` are included
(`output: "standalone"` in `next.config.ts` keeps the runtime image small).
After deploying, run `npm run db:migrate` once against the production
`DATABASE_URL` (or `db:push` for a quick start) to create the schema.

Whichever host you pick, also add its URL to Clerk's allowed origins/redirect
URLs in the Clerk dashboard.

## Known limitations / good next steps

- PDF parsing accuracy needs real-world tuning (see above) - bring some
  sample racecards and iterate on the extraction prompt.
- Uploaded PDFs' raw text is stored nowhere currently beyond the parse step;
  consider persisting the original file (S3/R2/etc.) if you want to allow
  re-parsing without re-uploading.
- Notes and uploads are scoped per-user with no team/sharing concept - if
  multiple people need to see the same meeting, that's the next piece to add
  (an `organizationId` alongside `ownerId` would be the natural extension,
  and Clerk supports Organizations natively if you need this).
- Silk artwork is only wired up for the 11 sample silks bundled in
  `public/silks/`; runners without a match fall back to a generated
  colour+initial avatar, same as the original prototype's placeholder logic.
  Real per-horse silk lookup would need a data source for that.
- Next.js 16 has deprecated the `middleware.ts` convention in favour of a
  `proxy.ts` file; the app still builds and runs correctly on `middleware.ts`
  today, but it's worth migrating when you upgrade Next.js next.
