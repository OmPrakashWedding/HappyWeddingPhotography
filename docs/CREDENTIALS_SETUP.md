# Credentials Setup Guide

This is the **one place** to add every credential as it becomes available. Copy `.env.local.example` to `.env.local` (already done once) and fill in values here as you get them — nothing else in the codebase needs to change.

The site works right now with every one of these blank: Supabase-backed forms show a friendly "not connected yet" message, YouTube/Instagram sections fall back to placeholder media, and Cloudinary is skipped in favor of local images.

---

## Supabase (database — leads form today, future Calendar CRM app later)

1. Go to [supabase.com](https://supabase.com) → sign in → **New Project**.
2. Once created, go to **Project Settings → API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (keep secret, server-only) → `SUPABASE_SERVICE_ROLE_KEY`
4. In the **SQL Editor** (left sidebar) → **New query**, paste the entire contents of `supabase/schema.sql` from this repo, and click **Run**. That creates all 5 tables (`services`, `leads`, `projects`, `invoices`, `notes`) plus the RLS policies described in `Documents/wedding-photography-website-dev-plan.md` §4, in one go. Safe to re-run if needed.
5. Restart `npm run dev`, then submit the Book Now form at `/contact` — a new row should appear in the `leads` table in the Supabase Table Editor.

## YouTube Data API v3 (Portfolio/Galleries video embeds)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create/select a project.
2. Enable **YouTube Data API v3** under APIs & Services.
3. Create an API key under **Credentials** → paste into `YOUTUBE_API_KEY`.
4. Get the channel ID from the client's YouTube channel (Settings → Advanced → Channel ID, or from the channel URL) → paste into `YOUTUBE_CHANNEL_ID`.

## Cloudinary (decorative hero clips / optimized images, free tier)

1. Sign up free at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
3. Copy **API Key** / **API Secret** → `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`.

## Instagram (live feed embed — Phase 8)

- Simplest: use an embed widget (e.g. via Elfsight/SnapWidget free tier or Instagram's own oEmbed) and paste its embed URL into `NEXT_PUBLIC_INSTAGRAM_EMBED_URL`.
- `NEXT_PUBLIC_INSTAGRAM_HANDLE` (already set) is used for the plain "Follow us" link in the footer regardless.

## Resend (optional — email notification on new lead, Phase 4)

- Not required: new-lead notifications are handled by the future Calendar CRM Application, not the website (see dev plan §7).
- Only fill this in if you specifically want an extra website-side email alert. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month), create an API key → `RESEND_API_KEY`.

## Portfolio media — Google Drive (photos) + Google Sheet (video links)

Full client-facing setup guide (folder structure, naming, the exact CSV publish steps): `Documents/portfolio-media-integration-guide.md`. Once the client has created the Drive folders and the Sheet:

1. **Google Drive API key**: [console.cloud.google.com](https://console.cloud.google.com) → enable **Google Drive API** → Credentials → create an API key → `GOOGLE_DRIVE_API_KEY`. Restrict it to the Drive API (and, once the domain is live, to that domain via HTTP referrer restriction).
2. **Folder IDs**: from each category folder's URL (`drive.google.com/drive/folders/<FOLDER_ID>`) → `GOOGLE_DRIVE_FOLDER_PRE_WEDDING`, `GOOGLE_DRIVE_FOLDER_WEDDING`, `GOOGLE_DRIVE_FOLDER_EVENTS`, `GOOGLE_DRIVE_FOLDER_OTHER`. Each folder (and its `Featured` subfolder) must be shared "Anyone with the link — Viewer" or the site can't read it.
3. **Video links CSV**: the published-CSV URL from the client's Google Sheet (File → Share → Publish to web → CSV) → `GOOGLE_SHEET_VIDEOS_CSV_URL`.
4. Restart `npm run dev`, visit `/portfolio/pre-wedding` (etc.) — real photos/films should replace the placeholder tiles within the 5-minute revalidate window.

## Domain

- Once a domain is purchased/available, update `NEXT_PUBLIC_SITE_URL` and connect it in the Vercel project's **Settings → Domains** at deploy time (Phase 7).

---

**Never commit `.env.local`** — it's gitignored. `.env.local.example` (committed, no real secrets) documents the shape for anyone setting up the project fresh.
