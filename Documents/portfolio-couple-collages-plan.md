# Portfolio Couple Collages — Pre-Wedding & Wedding

## Context

The Portfolio media pipeline (Google Drive photos + Google Sheet video links, `/portfolio/[category]` deep pages) is already live and working — that work is documented in `Documents/portfolio-media-integration-guide.md` and stays as-is.

The client now wants something more specific for the two categories where it makes sense: instead of one flat wall of photos+films per category, **Pre-Wedding** and **Wedding** should each show a stack of up to 5 couple-specific collages — a scrapbook-style asymmetric grid of that couple's photos and films with their names overlaid, modeled on the reference image shared (a mixed-size photo collage, "Our Love Story" script text, small heart doodle accents). The admin picks which 5 couples are currently featured, and needs a simple way to swap that over time without touching code.

Decisions already made with the client:
- **Scope**: only `/portfolio/pre-wedding` and `/portfolio/wedding` change. Events/Other keep today's existing wall-of-media layout unchanged. The main `/portfolio` teaser bars are unchanged too.
- **Visual approach**: a refined collage *inspired by* the reference (asymmetric mixed-size grid, script-font couple name overlay, subtle inline line-art heart accents) — not a literal torn-paper/watercolor-mask replication, which isn't reliably buildable in code across arbitrary uploaded photos.
- **Featured selection**: reuses the numeric-prefix pattern the client already knows from photo ordering — each couple is a Drive subfolder like `01 - Priya & Arjun`; the site shows the first 5 by number. Re-featuring a couple is just renaming a prefix.
- **Photo count**: the collage layout is flexible, designed to look good with roughly 8-12 photos per couple (works reasonably from ~6 to ~14), not a rigid fixed template.

---

## 1. Google Drive structure (client-facing)

One new `Couples` folder per category, sitting alongside the existing category folder:

```
HWP Website Photos/
├── Pre-Wedding/
│   ├── Featured/              ← existing, unchanged (small /portfolio teaser bar)
│   ├── (other photos)         ← existing, unchanged (/portfolio/pre-wedding fallback content)
│   └── Couples/                ← NEW
│       ├── 01 - Priya & Arjun/     (8-12 photos)
│       ├── 02 - Neha & Rohan/      (8-12 photos)
│       ├── 03 - ...
│       ├── 04 - ...
│       ├── 05 - ...
│       └── (any older/inactive couples — just number them 06+ or leave unprefixed to drop off the featured list)
└── Wedding/
    ├── Featured/
    ├── (other photos)
    └── Couples/                 ← same pattern
        ├── 01 - ...
        └── ...
```

- **Only the top 5 subfolders (by numeric prefix) under `Couples/` show on the live site.** To swap a featured couple: rename folder prefixes so the desired 5 are `01`-`05`.
- **The couple's display name comes straight from the folder name** — the number prefix (`"01 - "`) is stripped, so `01 - Priya & Arjun` displays as **"Priya & Arjun."** No separate place to type the name.
- Each `Couples/<N - Name>/` folder needs the same "Anyone with the link — Viewer" sharing as every other folder in the pipeline (§1.2 of the existing guide).
- Photo prep (full quality, no need to pre-compress) and naming-for-order conventions are unchanged from the existing guide.

## 2. Video links — attaching films to a specific couple

Extend the existing "HWP Video Links" Google Sheet with one new column: `couple`.

| category | platform | url | caption | order | couple |
|---|---|---|---|---|---|
| wedding | youtube | https://youtu.be/abc123 | First dance | 1 | Priya & Arjun |

- `couple` must exactly match that couple's folder name **without** the number prefix (e.g. `Priya & Arjun`).
- Rows with `couple` filled in are shown inside that couple's collage. Rows with `couple` left blank keep working exactly as before, for Events/Other's unchanged category-level film grid.

## 3. Data layer (developer)

- **`src/lib/googleDrive.ts`**: export the existing internal folder-listing helpers (currently private) as `listSubfolders(parentId)` and `getFolderImages(folderId)`, so they can be reused for the new couples lookup without duplicating Drive API logic.
- **New `src/lib/couples.ts`**:
  - `getFeaturedCouples(categorySlug: 'pre-wedding' | 'wedding'): Promise<Couple[]>` — reads the category's `GOOGLE_DRIVE_COUPLES_FOLDER_*` env var, lists subfolders, sorts by name, takes the first 5, strips the numeric prefix for `names`, fetches each couple's photos via `getFolderImages`.
  - Returns `[]` gracefully if the env var isn't set yet (same fallback pattern as the rest of the pipeline).
- **`src/lib/videoLinks.ts`**: add `couple` to the parsed row shape (optional field) and a `getVideoLinksByCouple(coupleName, categorySlug)` helper.
- **New env vars**: `GOOGLE_DRIVE_COUPLES_FOLDER_PRE_WEDDING`, `GOOGLE_DRIVE_COUPLES_FOLDER_WEDDING` — added to `.env.local`, `.env.local.example`, `docs/CREDENTIALS_SETUP.md`.

## 4. New component — `src/components/CoupleCollage.tsx`

- Props: couple `names`, `photos` (DriveImage[]), `videos` (VideoLink[]), category `accent`/`tint`.
- Layout: CSS grid with a small set of repeating asymmetric span patterns (varying tile widths/heights) cycled across however many photos exist (8-12 typical, gracefully handles 6-14) — mixed photo tiles and film tiles (reusing the existing `YouTubeFilmTile`/`InstagramFilmTile` components from `FilmTile.tsx`) in one collage.
- Couple names rendered centered over the collage in a script/cursive font — adds one new free Google Font (e.g. "Alex Brush" or "Dancing Script") used only for this overlay text, layered over a soft translucent backing so it reads on any photo.
- 1-2 small inline line-art heart SVGs (hand-drawn style, stroke-based per the site's existing icon approach in `icons.tsx`) as subtle corner accents — no emoji, no raster assets.
- Placeholder mode (no Drive photos yet): renders one sample collage with gradient tiles and a "Couple Name" placeholder label, consistent with how every other part of the pipeline degrades gracefully.

## 5. Page changes — `src/app/portfolio/[category]/page.tsx`

- For `pre-wedding` and `wedding`: fetch `getFeaturedCouples(slug)` and render a `<CoupleCollage>` per couple, stacked vertically down the page (each visually grouped/separated, sitting on the category's existing tint background).
- For `events` and `other`: unchanged — still the existing `MediaWall` wall-of-media layout.
- Category tint, header, and "← All Portfolio" link stay as they are today.

## 6. Design step (before building the component)

Use the **design** skill to add one new artboard to the *existing* published design canvas (same artifact — re-seed and republish, not a new artifact) showing the Couple Collage template at desktop width: asymmetric mixed-size photo grid, one film tile, the script-font couple-name overlay, heart line-art accents, on the Wedding category's blush tint. This is the visual spec the component gets built against, reviewed before writing the component code.

## 7. Where this plan is saved

Once approved, saved to `C:\Users\acer\Desktop\Websites\HappyWeddingPhotography\Documents\portfolio-couple-collages-plan.md` — its own file, separate from `portfolio-media-integration-guide.md`. Once built, the client-facing Drive/Sheet instructions from §1-2 above also get folded into `Documents/portfolio-media-integration-guide.md` as a new section, since that's the document the client actually follows day-to-day.

---

## Verification

- With `GOOGLE_DRIVE_COUPLES_FOLDER_PRE_WEDDING`/`_WEDDING` unset: both category pages still render cleanly (placeholder collage), matching the site's existing "never block on missing credentials" rule.
- With real folders configured: uploading a 6th couple folder (`06 - ...`) does **not** appear on the site; renaming it to `01 -...` (bumping another couple down) swaps who's featured, visible after the next ISR revalidate — no code change, no redeploy.
- A couple folder with only 5 photos, and another with 14, both render a reasonable-looking collage (no broken/empty grid cells, no overflow).
- A video row with `couple` set to a name that doesn't match any current folder is simply not shown (no crash).
- `npm run build` still succeeds with `/portfolio/pre-wedding` and `/portfolio/wedding` statically generated.
