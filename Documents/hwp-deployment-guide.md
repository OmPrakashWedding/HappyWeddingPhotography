# Going Live — Deployment Guide

Target: deploy the Next.js site to **Vercel** (free tier, built by the same team behind Next.js — zero-config for this stack) under **Om Prakash's own Vercel account**, then point the existing domain at it, replacing the current WordPress site.

---

## 0. Before anything else — back up the WordPress site

Since the domain is currently live on WordPress, going live with the new site will take the WP site offline once DNS switches. Before that happens:
- Log into **wp-admin → Tools → Export** and download the WordPress export file (keeps posts/pages/media references as a record).
- Optionally screenshot/save any contact details, testimonials, or copy from the current site that isn't already on the new one.
- This is just a safety net — the new site is not reading any data from WordPress, so this step doesn't block anything else below.

---

## 1. Commit and push the pending work

There's a batch of uncommitted changes (Cloudinary image pipeline, couple-name banner, portfolio/galleries card fixes, video links). This needs to go to GitHub before Vercel can deploy it, since Vercel builds from the repo, not local files.

**I'll do this once you confirm** — it pushes to the shared `OmPrakashWedding/HappyWeddingPhotography` repo on GitHub.

## 2. Om Prakash creates a Vercel account

1. Go to [vercel.com/signup](https://vercel.com/signup) and sign up with **"Continue with GitHub"**, logging in as the `OmPrakashWedding` GitHub account (the one that owns the repo).
2. This keeps hosting ownership with the client, same as the GitHub repo — you (the developer) get added as a collaborator on the Vercel project afterward, same pattern as GitHub.

## 3. Import the project into Vercel

1. From the Vercel dashboard: **Add New → Project**.
2. Select the `HappyWeddingPhotography` repo from the list (Vercel auto-detects it's Next.js — no config needed).
3. **Don't click Deploy yet** — first add the environment variables (next step), otherwise the first build will fail or deploy with broken image/Supabase/Drive integration.

## 4. Add environment variables in Vercel

In the import screen (or later under **Project → Settings → Environment Variables**), add every variable currently in `.env.local` **except** change one value:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://happyweddingphotography.com` (the real domain, once decided — see §6) |
| `NEXT_PUBLIC_CONTACT_PHONE` | same as `.env.local` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | same as `.env.local` |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | same as `.env.local` |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | same as `.env.local` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | same as `.env.local` |
| `NEXT_PUBLIC_YOUTUBE_URL` | same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | same as `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same as `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | same as `.env.local` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | same as `.env.local` (`lxlgwfek`) |
| `GOOGLE_DRIVE_API_KEY` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_PRE_WEDDING` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_WEDDING` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_EVENTS` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_OTHER` | same as `.env.local` |
| `GOOGLE_DRIVE_COUPLES_FOLDER_PRE_WEDDING` | same as `.env.local` |
| `GOOGLE_DRIVE_COUPLES_FOLDER_WEDDING` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_ABOUT_OWNER` | same as `.env.local` |
| `GOOGLE_DRIVE_FOLDER_ABOUT_STORY` | same as `.env.local` |
| `GOOGLE_SHEET_VIDEOS_CSV_URL` | same as `.env.local` |

Leave the still-blank ones (`YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_INSTAGRAM_EMBED_URL`, `RESEND_API_KEY`) blank — the site already handles them being unset.

**I can hand you these values to paste directly** (reading them from your local `.env.local`) when you're ready for this step — I won't commit them to git or print the secret ones in chat unprompted, but I can output them for you to copy into Vercel's UI.

## 5. Deploy and verify on the Vercel subdomain first

1. Click **Deploy**. First build takes ~2-3 minutes.
2. Vercel gives you a free `*.vercel.app` URL immediately (e.g. `happy-wedding-photography.vercel.app`) — **test the whole site here before touching the domain**: Home, Portfolio, Galleries (photos + films), About, Contact form (submit a real test lead and confirm it lands in Supabase).
3. Only move to §6 once this checks out.

## 6. Point the domain at Vercel (replaces WordPress)

Since only wp-admin access is confirmed right now (not separate domain/DNS access), the first job is finding out **who controls the domain's DNS** — this is almost always a different login than wp-admin:

- Check the hosting account used to set up WordPress (cPanel, Hostinger hPanel, GoDaddy dashboard, etc.) — DNS management is very often bundled into the same hosting account login, just a different section/tab than wp-admin (e.g. "DNS Zone Editor" or "Domains").
- If that doesn't have it, the domain may be registered somewhere else entirely — check the confirmation email from when the domain was purchased, or run a WHOIS lookup on the domain to see the registrar name.

Once you know where DNS is managed:

1. In Vercel: **Project → Settings → Domains → Add** → enter the domain (e.g. `happyweddingphotography.com`).
2. Vercel shows you exact DNS records to add (usually an `A` record pointing to `76.76.21.21` and a `CNAME` for `www`) — copy those.
3. Log into the DNS panel you found and add those records, removing/replacing whatever currently points to the WordPress host.
4. Propagation usually takes a few minutes to a few hours. Vercel auto-issues a free SSL certificate once it verifies the DNS change — no action needed for HTTPS.
5. Once live, the WordPress site at that domain will stop being reachable (the backup from §0 covers this).

## 7. Final checklist

- [ ] Pending commits pushed to GitHub
- [ ] Vercel project created under Om Prakash's account, you added as collaborator
- [ ] All env vars added, `NEXT_PUBLIC_SITE_URL` updated to the real domain
- [ ] Full site tested on the `*.vercel.app` URL (all pages, Contact form lead actually saved)
- [ ] DNS located and updated to point at Vercel
- [ ] Domain resolves to the new site over HTTPS
- [ ] WordPress export saved as backup
