# About Page Redesign — Founder Story

## Context

The About page currently has generic placeholder copy and a 3-image gradient grid. The client wants it rebuilt around the actual founder, Om Prakash, using real photos from Google Drive (the same client-managed pipeline already powering Portfolio) — a personal photo-and-bio hero, a story section about what inspired Happy Wedding Photography, and a small gallery.

Decisions already made with the client:
- **Section 2's "random" photo and Section 3's gallery are a fixed pick**, not auto-rotating — same deterministic-selection approach as the owner photo, not the site's usual "changes every 5 minutes" ISR pattern.
- **Copy is drafted now** (warm, first-person founder voice) as a first pass for Om Prakash to fact-check and personalize before launch — not fabricated as final/verified biographical fact.
- **A design canvas mockup comes first**, before writing component code — same workflow as the Portfolio Couple Collage.

**Real data check (already looked at both folders read-only, since this only needed reading, not changing anything):**
- Owner folder (`1RmLm6F2izp2UTqAq1HM0XulV8aVXwJ5R`) has **exactly 1 photo** — that's the one used for Section 1, no picking needed.
- Story/gallery folder (`1VwnxU5rpFQpcJVus2Ldx8taldcDI31A5`) has **exactly 3 photos** total. The brief wants 1 for Section 2 + 3 *different* ones for Section 3 — that's 4 distinct photos needed, but only 3 exist right now. The plan handles this gracefully (Section 3 shows whatever's left over — currently 2 — and will show the full 3 automatically the moment the client adds a 4th photo to that folder, no code change needed) — but worth flagging plainly: **ask the client to add at least one more photo to that folder** so Section 3 looks as intended from day one.

---

## 1. Content plan

### Section 1 — Owner spotlight (photo left, bio right)
- The single photo from the owner folder.
- Bio copy, first-person, drafted now — covers his range (wedding, pre-wedding, corporate/events, and political photography, per the client's note), and how he thinks about his work. Representative draft direction:

  > "Hi, I'm Om Prakash — the lead photographer behind Happy Wedding Photography. Over the years I've stood behind the lens at some of the most meaningful moments in people's lives: quiet, golden-hour pre-wedding shoots, grand wedding celebrations, corporate gatherings, and the fast-moving energy of political events. Every kind of shoot teaches me something different — patience, precision, timing. But what I chase in all of them is the same thing: the moment someone stops noticing the camera. My dream has always been simple — to capture people exactly as they are, so a photograph doesn't just show how they looked, but how they felt."

  (Final wording written at build time, clearly a first draft — flagged for Om Prakash to edit with real specifics: how many years, a real memory, his own words.)

### Section 2 — What inspired Happy Wedding Photography (image + narrative, reversed layout — text left, photo right, for visual rhythm against Section 1)
- One photo from the story/gallery folder.
- Narrative copy about how witnessing couples' happiness/big-day moments inspired him, and what Happy Wedding Photography stands for as a result. Representative draft direction:

  > "There's a moment I chase at every wedding — not the vows, not the posed portraits, but the instant right after, when it hits a couple that it's real. That moment is what first drew me into wedding photography, and it's what eventually became Happy Wedding Photography: the belief that a family's happiness, captured honestly, becomes something they keep forever — not a performance for the camera, but proof the day was exactly as good as it felt."

### Section 3 — Gallery
- The remaining story-folder photos (up to 3; currently 2 until the client adds a 4th) in a clean grid, no heavy copy — a small eyebrow label is enough (e.g. "Moments We Love").
- Existing "Book Now" CTA at the bottom of the page stays as-is.

---

## 2. Data layer

- New env vars: `GOOGLE_DRIVE_FOLDER_ABOUT_OWNER`, `GOOGLE_DRIVE_FOLDER_ABOUT_STORY` — added to `.env.local`, `.env.local.example`, `docs/CREDENTIALS_SETUP.md`. Already have the real folder IDs from this conversation, so these can be filled in immediately (no waiting on the client).
- New `src/lib/about.ts`: `getAboutImages()` — reuses the existing `getFolderImages` helper from `src/lib/googleDrive.ts` (already exported from the Portfolio work). Owner photo = first image in the owner folder; story photo = first image in the story folder; gallery = the rest of the story folder's images (`slice(1)`), naturally excluding whatever Section 2 used and naturally growing to 3 once a 4th photo is added. Returns nulls/`[]` gracefully if env vars aren't set (same fallback pattern as Portfolio), so the page never breaks — falls back to a placeholder photo block + the drafted copy still shows.

## 3. Design step

Use the **design** skill to add a new "About — Redesign" artboard (desktop width) to the existing published canvas (same artifact, re-seed and republish) — Section 1 (photo/bio split), Section 2 (reversed image/narrative), Section 3 (gallery), using the actual drafted copy above and the site's existing cream/beige/serif visual language. Reviewed before writing the page component.

## 4. Page changes — `src/app/about/page.tsx`

Rebuilt around `getAboutImages()` (with `revalidate = 300` for consistency with the rest of the pipeline, even though the *selection* is deterministic, so a photo swap in Drive still shows up without a redeploy) replacing the current generic intro + gradient grid with the three sections above.

---

## Verification

- With the two env vars set to the real folder IDs already gathered: `/about` shows the real owner photo + bio, the real story photo + narrative, and the real gallery photos (2 today, 3 once a 4th is added to the story folder).
- With those env vars unset: page still renders cleanly with placeholder photo blocks and the drafted copy — never blocks on missing credentials, consistent with the rest of the site.
- `npm run build` succeeds with `/about` still statically generated.
- Confirm Section 3's photos are never the same as Section 2's photo.
