# Portfolio Media Integration — Client-Managed Photos & Films

## Context

The main site build (Home, About, Portfolio, Galleries, Services, Blog, Contact) is done and running, currently with gradient placeholder tiles standing in for real photos/films — that work lives in `Documents\wedding-photography-website-dev-plan.md` and is **not touched by this plan**.

This is a separate, focused plan for the next piece the client asked for: real photos and films on the Portfolio pages, managed entirely by the client with free tools, plus a dedicated deep page per Portfolio category (Pre-Wedding / Wedding / Events / Other) styled like the reference wall-of-images portfolios shared (Litho, Hitchcock). Once approved, this plan is saved as its own file — `Documents\portfolio-media-integration-guide.md` — separate from the main dev plan, since it's a distinct, self-contained guide the client can also read on its own.

Decisions already made with the client:
- **Photos**: client uploads to their own **Google Drive** (free, familiar), not Cloudinary — no login to any dev tool required.
- **Videos**: client manages YouTube/Instagram links via a shared **Google Sheet**, published as CSV — no login system to build.
- **Film tiles**: YouTube clips autoplay muted + looped in the grid (real, supported embed params) so they read like a moving GIF; Instagram tiles use Instagram's own embed widget (static card, no true autoplay — a real platform limitation, not a bug).
- **Galleries page stays as-is**, untouched — this plan only adds new Portfolio deep pages; it doesn't merge into or replace Galleries.

---

## 1. Photos — Google Drive: full folder & naming guide

### 1.1 Folder structure the client sets up

Four folders in the client's Google Drive, one per Portfolio category — this **is** the category system; there's no separate tagging step:

```
My Drive
└── HWP Website Photos/
    ├── Pre-Wedding/
    │   ├── Featured/        ← the 3-4 photos shown in the small Portfolio teaser bar
    │   └── (all other photos for this category, shown on the full /portfolio/pre-wedding page)
    ├── Wedding/
    │   ├── Featured/
    │   └── (all other photos)
    ├── Events/
    │   ├── Featured/
    │   └── (all other photos)
    └── Other/
        ├── Featured/
        └── (all other photos)
```

- The **`Featured`** subfolder inside each category is what feeds the small preview grid on the main Portfolio page (`/portfolio`) — keep 3-4 of the best shots in there. Everything in the category folder (Featured + the rest) shows up on that category's full page (e.g. `/portfolio/wedding`).
- A photo can just live in the category folder without being in `Featured` — it'll still appear on the deep page, just not the homepage-style teaser.
- To swap what's featured: just move a file in or out of the `Featured` subfolder in the normal Drive app. Takes effect on the site within ~5 minutes, no developer involved.

### 1.2 Sharing — required for the site to see the folder

For **each** of the 8 folders above (4 categories + their 4 `Featured` subfolders):
1. Right-click the folder → **Share**.
2. Under **General access**, change "Restricted" to **Anyone with the link**.
3. Set the role to **Viewer** (never Editor — the public link should only let people *see* images, never change them).
4. Click **Done**.

**Plainly worth knowing:** this makes those specific folders viewable (not editable) by anyone who has the link — not discoverable by search, not listed anywhere, but not private either. Nothing else in the client's Drive is affected. This is what lets the website read the folder automatically without the client logging in anywhere.

### 1.3 File naming — controls the order photos appear in

The website lists Drive files in name order, so **filename = display order**. Recommended convention:

```
01-couple-entrance.jpg
02-first-look.jpg
03-mandap-ceremony.jpg
...
```

Two-digit numeric prefixes keep the order predictable (and sort correctly past 9, unlike `1-`, `2-`, …, `10-`). The words after the number are just for the client's own reference — they're never shown on the site.

**Fast way to number files before uploading (no extra software):** select all the photos for one folder in Windows File Explorer, right-click the first one → **Rename** (or press F2), type a base name like `wedding-photo`, hit Enter — Windows automatically numbers the rest as `wedding-photo (1).jpg`, `wedding-photo (2).jpg`, etc. Rename once, then drag the whole batch into the right Drive folder.

### 1.4 Photo prep — file type, size, and why it matters

**Upload full quality — don't pre-compress.** The site never serves the file the client uploads directly: it always requests Google Drive's own auto-generated `thumbnailLink` (§1.6 below), which Google regenerates itself, server-side, at a web-appropriate size and compression every time — regardless of what the original looks like. So there is no need to manually resize/squash photos before upload for the website's sake; doing that only throws away quality for no benefit here.

- **Format:** JPG (not HEIC/PNG for photos — HEIC won't display in most browsers, PNG is unnecessarily large for photos).
- **Quality:** export the best quality edited version — full resolution, ~90-100% JPEG quality, sRGB color profile. Avoid RAW/TIFF: Drive can store them, but the site can't render them, and they burn through the free storage quota for no display benefit.
- **Storage math:** a full-quality edited JPEG wedding photo typically runs 5-15MB. Google Drive's free tier is 15GB, which comfortably holds 1,000-3,000+ photos at that size — quality doesn't need to be traded off to fit.
- **Bonus:** keeping full-quality originals in Drive also means they stay useful for prints, social media, or a future move to a dedicated image host (Cloudinary) — nothing is thrown away.

### 1.5 What the developer needs from the client, once

Just the folder link (or the folder ID from the URL, `drive.google.com/drive/folders/<FOLDER_ID>`) for each of the 4 top-level category folders — the code fetches each `Featured` subfolder by finding it inside its parent automatically, so only 4 IDs need to be recorded, not 8.

### 1.6 How the site actually reads this (technical, for the developer)

**Google Cloud Console setup (once, free):**
1. Create/select a project → enable **Google Drive API**.
2. Create an **API key** under Credentials; restrict it to the Drive API, and (once the domain is live) to that domain via HTTP referrer restriction.
3. Store in `.env.local`: `GOOGLE_DRIVE_API_KEY`, `GOOGLE_DRIVE_FOLDER_PRE_WEDDING`, `GOOGLE_DRIVE_FOLDER_WEDDING`, `GOOGLE_DRIVE_FOLDER_EVENTS`, `GOOGLE_DRIVE_FOLDER_OTHER`.

**Code — `src/lib/googleDrive.ts`:**
- `files.list` with `q="'<folderId>' in parents and trashed=false"`, `fields=files(id,name,mimeType)`, `orderBy=name`, `key=<API key>` — first call finds the `Featured` subfolder's own ID (`mimeType='application/vnd.google-apps.folder'`), then a second call lists images inside it the same way (`mimeType contains 'image/'`), and a third lists the full category folder minus the `Featured` subfolder itself.
- Each image's display URL comes from Google's own returned `thumbnailLink`, upsized by swapping its `=s220` suffix for `=s1600` — deliberately using Google's own link rather than an unofficial direct-file URL pattern, for reliability.
- Fetched with Next.js ISR (`revalidate: 300`), so a new upload shows up within ~5 minutes with zero redeploy.

**Honest tradeoff, worth telling the client directly:** Drive is the account they already know, but it wasn't built as an image CDN — thumbnail links can occasionally be slower or lower-res than a dedicated image host, and Google doesn't officially guarantee hotlinking at scale. That's fine for a small studio's traffic; if photos ever load inconsistently once the site is getting real visitors, the documented fallback is migrating this one file to Cloudinary (already free-tier in the main plan) — every page consumes the same `{id, url}[]` shape regardless of source, so nothing else changes.

---

## 2. Videos — Google Sheet: full step-by-step setup

### 2.1 Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it (click "Untitled spreadsheet" top-left) to **`HWP Video Links`**.
3. In row 1, type these exact column headers (spelling/case matters — the site reads columns by these names):

   | A | B | C | D | E |
   |---|---|---|---|---|
   | `category` | `platform` | `url` | `caption` | `order` |

4. Starting row 2, add one row per video. Example rows:

   | category | platform | url | caption | order |
   |---|---|---|---|---|
   | pre-wedding | youtube | https://youtu.be/abc123XYZ | Priya & Arjun, golden hour | 1 |
   | wedding | youtube | https://www.youtube.com/watch?v=def456UVW | The Big Day highlight film | 1 |
   | wedding | instagram | https://www.instagram.com/reel/Cxxxxxxxxx/ | Reception reel | 2 |
   | events | youtube | https://youtu.be/ghi789RST | Corporate gala 2025 | 1 |

   **Column rules:**
   - `category` — must be exactly one of `pre-wedding`, `wedding`, `events`, `other` (lowercase, hyphen, matching the Portfolio bars).
   - `platform` — exactly `youtube` or `instagram` (lowercase).
   - `url` — the normal link copied from YouTube's Share button or Instagram's Share → Copy Link on a Reel/post.
   - `caption` — optional, plain text, shown as a small label on the tile.
   - `order` — optional whole number controlling position within that category (lower = earlier); leave blank to just append at the end.

   **Optional but recommended — stop typos before they happen:** select the `category` column → **Data → Data validation → Add rule → Dropdown** → list the four allowed values. Same for `platform` with `youtube`/`instagram`. This turns each cell into a dropdown instead of free typing, so a category name can never be misspelled.

### 2.2 Publish it as a live CSV link

1. **File → Share → Publish to web.**
2. In the dialog, under "Link," choose the sheet by name (not "Entire document" if there's ever more than one tab) and set the format dropdown to **Comma-separated values (.csv)**.
3. Click **Publish**, confirm in the popup.
4. Copy the generated link — it looks like `https://docs.google.com/spreadsheets/d/e/<long-id>/pub?output=csv`. That whole URL is the value for `GOOGLE_SHEET_VIDEOS_CSV_URL`.

### 2.3 Ongoing use

- Adding a new film = adding a row with those 5 columns and pasting the link. No re-publishing needed — Google keeps the published CSV in sync with the sheet automatically (typically within a few minutes), matching the site's own 5-minute refresh.
- Deleting or editing a row removes/updates it on the site the same way.
- **Worth knowing:** "Publish to web" makes that sheet's data readable by anyone with the link (not editable, not listed/discoverable anywhere else) — fine here since it only ever contains public video links and captions, no personal or booking data. Don't add unrelated columns with sensitive info to this particular sheet later.

### 2.4 How the site actually reads this (technical, for the developer)

**Code — `src/lib/videoLinks.ts`:** server-side fetch of the published CSV URL (`GOOGLE_SHEET_VIDEOS_CSV_URL` env var), parsed by header name into `{category, platform, url, caption, order}[]`. YouTube video IDs are extracted from the URL by regex for embedding; Instagram links are passed to Instagram's oEmbed/embed.js widget. Same `revalidate: 300` ISR pattern as photos.

**Film tile behavior:** YouTube tiles render as an `<iframe>` with `autoplay=1&mute=1&loop=1&playlist=<id>&controls=0` — officially supported params, behaves like a looping GIF in the grid, click to unmute/open full player. Instagram embeds don't support true autoplay-loop the way YouTube's does, so Instagram tiles show as Instagram's own static embed card (thumbnail + play affordance) instead — flagged now so it isn't a surprise later.

---

## 3. Portfolio category pages (`/portfolio/[category]`)

- Dynamic route `src/app/portfolio/[category]/page.tsx`, `generateStaticParams` for the four known slugs (`pre-wedding`, `wedding`, `events`, `other`), pre-rendered + ISR-revalidated.
- Background tint matches that category's existing Portfolio bar color (light blue / blush pink / neutral cream / muted sage) — pulled from one shared constant so the teaser bar and its deep page can never drift apart.
- Layout: a dense "wall of images" grid — CSS columns/masonry, tiles of varied size, tight gaps — mixing photo tiles and autoplay film tiles in one feed, ordered by filename (photos) / `order` column (videos) interleaved, modeled on the reference screenshots (Litho/Hitchcock-style portfolio walls) rather than a rigid uniform grid.
- Each Portfolio bar's existing "See all" link points to its matching deep page; the bar itself keeps showing just the `Featured` subfolder's 3-4 curated tiles.

---

## 4. Verification

- With real credentials set in `.env.local`: uploading a test photo into a Drive category folder (or its `Featured` subfolder), or adding a row to the video Sheet, shows up on the matching `/portfolio/[category]` page within the 5-minute ISR window — no code change, no redeploy. This is the actual proof the client can self-manage media end to end.
- Renaming a file to change its numeric prefix reorders it on the page after the next refresh.
- `npm run build` still succeeds with all four category pages statically generated.
- Every category page loads correctly with zero Drive/Sheet credentials configured too (graceful placeholder fallback), matching the rest of the site's "never block on missing credentials" rule.
- Manual check: YouTube tiles actually autoplay muted+looped in the grid; Instagram tiles render via Instagram's embed widget without erroring; a bad `category`/`platform` value in the Sheet is skipped rather than crashing the page.

## 5. Where this gets saved

Every plan for this project lives inside the project itself, in `C:\Users\acer\Desktop\Websites\HappyWeddingPhotography\Documents\` — not just kept in the external Claude Code plan-file location. Once approved, this plan is written there as its own file, `portfolio-media-integration-guide.md`, standalone and separate from `wedding-photography-website-dev-plan.md` (which is left as-is). Any future plan for this project follows the same rule: written into `Documents\` under its own clearly-named file, so the project folder always holds the complete, current set of plans for anyone who opens it — not just this session.
