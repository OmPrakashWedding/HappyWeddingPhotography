# Happy Wedding Photography — Website Development Plan (Phase 1 → Launch)

## Context

The client runs a wedding/event photography, videography & cinematography business. The provided MD (`wedding-photography-website-dev-plan.md`) sketches a Next.js + Supabase + YouTube site. This plan adapts it to what was actually decided in scoping:

- The project folder (`C:\Users\acer\Desktop\Websites\HappyWeddingPhotography`) is currently empty except a `.code-workspace` file and the logo (`Images\Instagarm_logo.jpg`) — this is a greenfield build, nothing to migrate.
- Domain, Supabase, Instagram, and YouTube access will be granted **later** — the build must not block on them; every integration point is wired to a placeholder/env var with a single documented file to fill in when credentials arrive.
- A second, separate project — an internal **Calendar CRM Application** (leads + projects/invoices + date-conflict tracking + lead notifications) — is needed by the business but is **out of scope to build now**. Its full database schema is designed and provisioned now (§4) as one shared Supabase backend, so the Application's later build starts on UI only, with zero backend rework.
- **Visibility:** the site must be checkable on `localhost` after every phase, not just at the end — each phase below ends with what you'll be able to see running `npm run dev` (http://localhost:3000).
- Top nav is fixed: **About · Blog · Portfolio · Galleries · Book Now**, where Portfolio (curated highlights) and Galleries (full categorized albums) are distinct pages, and Blog ships as a launch stub (real content later).
- All decorative animation/media tooling must stay on free tiers.
- Design direction will be drafted visually with the Claude Design canvas before component coding starts, informed by real reference sites (Zenfolio, Colorlib, sitebuilderreport wedding-photography roundups — cream/beige + full-bleed imagery + elegant serif type is the dominant successful pattern).

Goal of this document: a phase-by-phase build plan that takes the site from zero to deployed, with an explicit, single place to drop in every credential as it becomes available.

**Plan file location:** once approved, this plan is copied to `C:\Users\acer\Desktop\Websites\HappyWeddingPhotography\Documents\wedding-photography-website-dev-plan.md` (folder created if missing) and kept in sync there as the plan is updated going forward — that copy, inside the project, is the one to treat as current alongside this one.

---

## 1. Final Site Structure

| # | Page | Notes |
|---|------|-------|
| 1 | Home | Hero (YouTube/Cloudinary decorative loop), tagline, featured work strip, testimonials teaser, IG teaser, CTA |
| 2 | About | Story, philosophy, team |
| 3 | Portfolio | Curated highlight reel, split into service bars — Pre-Wedding, Wedding, Events, Other — each its own section with a distinct tinted background (see below) |
| 4 | Galleries | Full library, categorized (Weddings / Pre-Wedding / Corporate / Films), filterable grid + YouTube embeds |
| 5 | Services | Photography / Videography / Cinematography packages |
| 6 | Blog | Stub at launch: route + layout + "Coming soon" empty state; content model built but unpopulated |
| 7 | Contact / Book Now | Enquiry form → Supabase `leads`; direct-call phone number (client-provided) shown prominently |
| Global | Navbar | About · Blog · Portfolio · Galleries · **Book Now** (styled as CTA button, links to Contact form) |
| Global | Footer | Contact info, Instagram feed embed, social links, logo |

Testimonials and Instagram feed remain as sections (Home + possibly Footer), not standalone pages, per the MD.

**Portfolio page — service bars:** instead of one undifferentiated grid, Portfolio is broken into four stacked bars, one per service category, each a full-width section with its own subtle background tint so a visitor feels the mood shift while scrolling — the overall cream/beige/serif language stays constant (nav, type, buttons), only the section background changes:

| Bar | Background tint |
|---|---|
| Pre-Wedding | Light, airy blue tint |
| Wedding | Light pink/blush tint |
| Events (corporate/other functions) | Same background as the rest of the site (no tint — the neutral baseline) |
| Other | A distinct but elegant muted tint (e.g. soft sage or warm sand — kept subtle, not competing with Wedding/Pre-Wedding) |

This pattern is drafted into the Phase 1 design canvas (Portfolio artboard) and then carried into the Phase 3 Portfolio page build and the Phase 5 styling pass.

---

## 2. Tech Stack (confirmed, free-tier)

| Layer | Choice | Free-tier note |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | — |
| Styling | Tailwind CSS | — |
| Animation | Framer Motion | free/open-source |
| Backend/DB | Supabase (Postgres + RLS) | free tier: 500MB DB, fine for `leads` |
| Decorative snippets/images | Cloudinary free tier (25GB storage/bandwidth credit) | compressed short clips + optimized images only — never full videos |
| Video | YouTube Data API v3 (client's existing channel) | free quota; no self-hosted video |
| Forms | Native form → Supabase insert | RLS: public INSERT only |
| Email notify on new lead (optional, Phase 4) | Resend free tier (3,000 emails/mo) via Supabase Edge Function | — |
| Hosting | Vercel free/hobby tier | — |
| Design mockups | Claude Design canvas skill | — |

---

## 3. Credentials & Config — Single Source of Truth

Create **one** documented env file so nothing is hardcoded and every future credential drop-in is a one-file edit:

- `/.env.local.example` (committed, no real values) — template with every key, a comment on where to get it, and which phase needs it.
- `/.env.local` (gitignored) — actual secrets, filled in as the client provides them.
- `/docs/CREDENTIALS_SETUP.md` — human guide: for each variable, exactly which dashboard/page to visit, what to copy, and how to verify it works (e.g. "run `npm run dev`, check `/api/health` returns ok").

Planned variables (populated progressively, site works with sensible fallbacks/placeholders until each arrives):

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, Edge Functions
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_INSTAGRAM_EMBED_URL=  # or IG Basic Display token if live-feed API is used
RESEND_API_KEY=                   # optional, Phase 4
```

Until real values exist: YouTube/Instagram sections render with static placeholder media already in `/Images`, gallery/hero use local optimized images instead of Cloudinary, and the domain stays on the Vercel-issued `*.vercel.app` URL. Nothing in the codebase should need to change shape when real values are dropped in — only the env file.

---

## 4. Database Plan (Supabase) — Unified Schema, Shared by Website + Future Application

The Supabase project is **one shared backend** for both the website and the future Calendar/CRM Application from day one — not a website-only DB that the app bolts onto later. The full schema is designed now (this section) even though only the website writes to it in this build; the Application (§7) is built later against this same schema, so nothing here needs to be reshaped when that project starts.

**`services`** — master list of offerings + rates, used by both the website (Services page) and the Application (lead/project service selection):

| Column | Type |
|---|---|
| id | uuid, PK |
| name | text |
| category | text (photography / videography / cinematography) |
| description | text |
| rate | numeric |
| is_active | boolean, default true |
| created_at | timestamptz, default now() |

**`leads`** — every enquiry, whether submitted by a client via the website form or entered manually by staff in the Application:

| Column | Type |
|---|---|
| id | uuid, PK, default gen_random_uuid() |
| name | text |
| phone | text |
| email | text |
| event_type | text |
| event_date | date |
| message | text |
| source | text — `'website'` \| `'manual'` (who created it) |
| status | text — `'new'` \| `'contacted'` \| `'converted'` \| `'lost'`, default `'new'` |
| requested_service_ids | uuid[] — references `services.id` |
| assigned_to | uuid, nullable — staff user (Application admin), FK to `auth.users` |
| created_at | timestamptz, default now() |
| updated_at | timestamptz, default now() |

**`projects`** — created when a lead pays an advance and converts to a booked client:

| Column | Type |
|---|---|
| id | uuid, PK |
| lead_id | uuid, FK → `leads.id` (traceability back to the original enquiry) |
| client_name | text |
| client_phone | text |
| client_email | text |
| event_date | date |
| service_ids | uuid[] — references `services.id` |
| advance_paid | numeric |
| total_amount | numeric |
| status | text — `'booked'` \| `'in_progress'` \| `'completed'` \| `'cancelled'` |
| created_at | timestamptz, default now() |
| updated_at | timestamptz, default now() |

**`invoices`** — one-to-many with `projects`:

| Column | Type |
|---|---|
| id | uuid, PK |
| project_id | uuid, FK → `projects.id` |
| invoice_number | text |
| amount | numeric |
| status | text — `'pending'` \| `'paid'` \| `'overdue'` |
| issued_date | date |
| due_date | date, nullable |
| notes | text, nullable |
| created_at | timestamptz, default now() |

**`notes`** — free-text notes captured against a lead or project (e.g. call summaries), used by the Application:

| Column | Type |
|---|---|
| id | uuid, PK |
| lead_id | uuid, FK → `leads.id`, nullable |
| project_id | uuid, FK → `projects.id`, nullable |
| body | text |
| created_by | uuid, FK → `auth.users`, nullable |
| created_at | timestamptz, default now() |

**RLS policy design:**
- `leads`: anonymous (website visitors) can **INSERT only**, with `source` forced server-side to `'website'` and `assigned_to`/`status` left at defaults — no anon SELECT/UPDATE/DELETE. Authenticated staff (Application users, via Supabase Auth) get full SELECT/UPDATE.
- `services`: public SELECT (website Services page reads live rates), write restricted to staff.
- `projects`, `invoices`, `notes`: staff-only (authenticated + role check), no anonymous access at all — these never touch the public website.

This means the website only ever touches `services` (read) and `leads` (insert) — it has no code path that reaches `projects`/`invoices`/`notes`. Supabase Auth (staff roles) is provisioned now as part of this schema, even though the Application UI that uses it is built later.

---

## 5. Development Phases

### Phase 1 — Design Direction (Claude Design + reference research)
- Reference sweep already done: cream/beige + full-bleed photography + elegant serif headings + minimal nav is the winning pattern across current wedding-photographer sites (Zenfolio/Colorlib/sitebuilderreport roundups).
- Use the **design** skill to draft a canvas with artboards for: Home, Portfolio, Galleries, Contact/Book Now, mobile Home — using the provided logo, cream/beige gradient + gold/blush accent, serif display font (e.g. Google Fonts "Cormorant"/"Playfair Display") + clean sans body.
- Portfolio artboard is drafted with the four tinted service bars above (Pre-Wedding blue / Wedding blush / Events neutral / Other muted sage-sand), each bar carrying its own mini grid of that category's work.
- Confirm palette/typography/spacing with client review of the canvas before any component code is written.
- Canvas already drafted and published; the Portfolio artboard update above is the current outstanding revision to it.
- 👀 **Visible:** nothing on localhost yet (no app scaffolded) — review happens on the published Claude Design canvas artifact link instead.

### Phase 2 — Project Setup
- `npx create-next-app` (TS, App Router, Tailwind, ESLint) inside the existing folder.
- Add Framer Motion, Supabase JS client.
- Create `.env.local.example`, `docs/CREDENTIALS_SETUP.md`.
- Stand up Supabase project (once access given) — create the **full unified schema** from §4 (`services`, `leads`, `projects`, `invoices`, `notes`) and RLS policies in one migration, even though the website only touches `services`/`leads`. This avoids a schema migration later when the Application is built. Until access is given, stub a local mock so website form dev isn't blocked.
- Register Cloudinary free account (once access given); until then use local `/public/images`.
- 👀 **Visible:** `npm run dev` → http://localhost:3000 shows the default Next.js scaffold page (confirms the project boots) — no site content yet.

### Phase 3 — Core Development
- Reusable components: Navbar (with Book Now CTA), Footer, Hero, GalleryGrid, VideoEmbed (YouTube), TestimonialCarousel, InstagramEmbed, LeadForm.
- Build all 7 pages from §1.
- YouTube integration: server-side fetch (cached/ISR) from playlists once `YOUTUBE_API_KEY`/`YOUTUBE_CHANNEL_ID` exist; graceful fallback (static thumbnails) until then.
- Cloudinary integration for decorative hero clips/optimized images, same fallback pattern.
- Blog: route + layout + Supabase content table schema defined, but page renders "Coming soon" until Phase 8.
- 👀 **Visible:** every nav route (`/`, `/about`, `/portfolio`, `/galleries`, `/services`, `/blog`, `/contact`) loads on localhost with real layout/content and placeholder media — full click-through of the site's structure, just unstyled/untheme'd and with a form that doesn't submit yet.

### Phase 4 — Lead Capture & Backend
- Book Now form (validated client-side) → Supabase insert into `leads` (`source: 'website'`).
- Success/error states, spam mitigation (honeypot field + simple rate limit).
- **No email/notification logic is built into the website.** New-lead notifications are the future Application's responsibility (it watches the shared `leads` table — e.g. Supabase Realtime subscription or a scheduled check — and alerts staff there). The website's only job is to write a clean row.
- Direct-call phone number rendered from env var, click-to-call on mobile.
- 👀 **Visible:** on localhost, submitting `/contact` shows a real success/error state and the new row appears in the Supabase table editor immediately — end-to-end lead capture working locally.

### Phase 5 — Styling & Animation Pass
- Apply cream/beige gradient + accent theme site-wide from the approved Phase 1 canvas.
- Framer Motion: scroll reveals, hover states, hero crossfade/loop.
- Full mobile responsiveness pass.
- 👀 **Visible:** localhost now visually matches the approved Phase 1 canvas — cream/beige theme, animations, and responsive layout, checkable at both desktop and mobile viewport widths in devtools.

### Phase 6 — Testing & QA
- Cross-browser/mobile check, Lighthouse pass (image/video load performance, since media is the whole product).
- Form submission test against real Supabase table + RLS verification (confirm anon can insert, cannot select).
- Broken-link/env-fallback check (site must not break with any credential still unset).
- 👀 **Visible:** localhost behaves identically to what will ship — this phase finds and fixes issues on the same running instance rather than introducing new visible surface.

### Phase 7 — Deployment
- Deploy to Vercel, connect the client's real domain when available (until then ship on `*.vercel.app`).
- Set all env vars in Vercel dashboard from the same `.env.local.example` template.
- Client walkthrough + handoff notes (how to swap the logo, how to add credentials — pointing at `docs/CREDENTIALS_SETUP.md`).
- 👀 **Visible:** live at a public Vercel URL (later the real domain) in addition to localhost — first point the client can review without any local setup.

### Phase 8 — Post-Launch / Future
- Populate real Blog content + CMS-lite (Supabase table + simple admin form, or MDX).
- Swap placeholder logo for final logo.
- Wire live Instagram feed once IG access/token provided.
- **Calendar CRM Application** — separate project, see §7 below, built independently against the schema already provisioned in §4/Phase 2.
- 👀 **Visible:** each item ships as its own small, checkable update to the live site (or, for the Application, its own separate localhost instance once that project starts).

---

## 6. Reference Sources (design inspiration used)

- [Best Wedding Photography Portfolio Examples of 2026 — Zenfolio](https://zenfolio.com/wedding-photography/best-portfolio-websites/)
- [17 Excellent Wedding Photography Websites 2026 — Colorlib](https://colorlib.com/wp/wedding-photography-websites/)
- [Wedding Photography Websites: 25+ Beautiful Examples (2026) — Sitebuilderreport](https://www.sitebuilderreport.com/inspiration/wedding-photography-websites)
- [17 Best Wedding Photographer Websites In 2025 — Photo Web Designs](https://photowebdesigns.com/wedding-photographer-websites/)

---

## 7. Future Project (documented only, not built now): Calendar CRM Application

A separate codebase/project, built later — but against the **same unified Supabase schema already created in §4/Phase 2**, not a schema of its own. Nothing about the database changes when this project starts; it's a new frontend reading/writing tables that already exist.

- **Purpose:** internal tool for admins/company handles to manage leads and booked projects on a shared calendar.
- **Per-date, two sections:**
  1. **Leads** — name, contact, requested service(s) (pulled live from `services`), requested date. The Application checks `event_date` against existing `projects` on that date; if the company already has a project booked, the date is flagged orange/red as tentatively marked (not auto-rejected — multiple bookings per date are allowed if the manager confirms team availability). Leads entered directly by staff in the app are inserted with `source: 'manual'`; leads from the website arrive automatically with `source: 'website'` since it's the same table.
  2. **Projects** — converting a lead (advance paid) creates a row in `projects` linked via `lead_id`, carrying demographic info, booked `service_ids`, and its own `invoices` rows.
  3. **Notes** — free-text notes against a `lead_id` or `project_id` (e.g. call summaries), visible to admins.
  4. **Lead notifications** — generated by the Application itself (not the website): e.g. a Supabase Realtime subscription on `leads` inserts, or a polling/scheduled check, surfaces new website enquiries to staff the moment they land in the shared table.
- **Access control:** Supabase Auth, restricted to admin/company accounts, enforced by the RLS policies already defined in §4 (staff-only on `projects`/`invoices`/`notes`, staff read/write on `leads`).
- Since the schema, RLS, and services list are already in place from this build, the Application's own build phase starts directly on UI (calendar view, lead/project forms, invoice list) with zero backend/schema work of its own.
- This app is planned as its own future phase of work, scoped and estimated separately once the website is live.

---

## 8. Verification Plan

- `npm run dev` boots cleanly with only `.env.local.example` placeholders present (no crash on missing YouTube/Cloudinary/Instagram creds).
- Submitting the Book Now form against a real (or local Supabase CLI) instance creates a row in `leads` with `source: 'website'`; confirm via Supabase table editor.
- Confirm RLS: anonymous client can INSERT into `leads` but a SELECT from the anon key returns nothing; anon key has no access at all to `projects`, `invoices`, or `notes`; anon key can SELECT from `services`.
- Confirm the full schema (`services`, `leads`, `projects`, `invoices`, `notes`) exists and matches §4 before considering Phase 2 done — this is the contract the future Application will build against.
- Lighthouse/mobile check on Home, Galleries (heaviest media pages).
- Manual click-through of all nav items (About, Blog, Portfolio, Galleries, Book Now) on desktop + mobile viewport.
- `npm run build` succeeds before Vercel deploy.
