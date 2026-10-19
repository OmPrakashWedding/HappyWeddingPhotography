import { NextRequest } from "next/server";
import zlib from "zlib";

/**
 * Serves a Google Drive image through our own domain instead of linking
 * directly to Google's `thumbnailLink` — that link is a pre-generated
 * preview URL that isn't guaranteed to stay stable for hotlinking. This
 * route instead calls Drive's actual file-content endpoint (`alt=media`),
 * the stable, documented way to fetch a file's bytes.
 *
 * Drive isn't a CDN: it has its own abuse-protection rate limiting, and a
 * burst of requests can get temporarily throttled with a 403 — and
 * next/image alone can turn ONE photo into several real requests here (a
 * separate fetch per responsive size variant). The in-memory cache below
 * means each photo is only ever fetched from Drive once per server
 * process, no matter how many variants/visitors ask for it afterwards —
 * this is the main lever against hitting Drive's rate limit at all.
 *
 * One retry rides out a transient blip; a soft placeholder (200 OK, short
 * cache) is returned on genuine failure so the browser never renders a
 * literal broken-image icon.
 */

type CachedImage = { body: ArrayBuffer; contentType: string; cachedAt: number };

// Byte budget, not entry count — a wedding photo can be 10-15MB, so capping
// by count alone could let the cache balloon to gigabytes and crash the
// process. 150MB comfortably fits a typical serverless function's memory
// limit alongside Node/Next's own overhead.
const MAX_CACHE_BYTES = 150 * 1024 * 1024;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — matches the browser Cache-Control below

// Module-level Map: persists for the life of this server process (the dev
// server, or one warm serverless instance in production) — not a database,
// just enough to stop the same photo being re-fetched from Drive dozens of
// times in a row while the process is warm.
const imageCache = new Map<string, CachedImage>();
let cacheBytes = 0;

function cacheGet(fileId: string): CachedImage | undefined {
  const entry = imageCache.get(fileId);
  if (!entry) return undefined;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    imageCache.delete(fileId);
    cacheBytes -= entry.body.byteLength;
    return undefined;
  }
  // Refresh recency (simple LRU-ish behavior) by re-inserting.
  imageCache.delete(fileId);
  imageCache.set(fileId, entry);
  return entry;
}

function cacheSet(fileId: string, entry: CachedImage) {
  while (cacheBytes + entry.body.byteLength > MAX_CACHE_BYTES && imageCache.size > 0) {
    const oldestKey = imageCache.keys().next().value;
    if (!oldestKey) break;
    const oldest = imageCache.get(oldestKey);
    imageCache.delete(oldestKey);
    if (oldest) cacheBytes -= oldest.body.byteLength;
  }
  // A single file larger than the whole budget just isn't cached — it'll
  // still be served fine, just re-fetched from Drive each time.
  if (entry.body.byteLength > MAX_CACHE_BYTES) return;
  imageCache.set(fileId, entry);
  cacheBytes += entry.body.byteLength;
}

// Next's built-in image optimizer refuses SVG sources by default (a real
// security setting, not worth weakening just for a placeholder) — so the
// placeholder has to be a real raster format. A hand-built 1x1 solid-color
// PNG needs no image library: next/image's `fill`+`object-cover`/`contain`
// scales it to fill the tile, reading as a plain color block either way.
function crc32(buf: Buffer): number {
  let crc = ~0;
  for (const byte of buf) {
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function solidColorPng(r: number, g: number, b: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1, 0); // width
  ihdrData.writeUInt32BE(1, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: RGB
  const ihdr = pngChunk("IHDR", ihdrData);
  const raw = Buffer.from([0, r, g, b]); // filter-type byte + one RGB pixel
  const idat = pngChunk("IDAT", zlib.deflateSync(raw));
  const iend = pngChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Matches --cream-3 from globals.css, so it blends into the page even
// without the real photo.
const PLACEHOLDER_PNG = solidColorPng(0xef, 0xdc, 0xc3);

function placeholderResponse() {
  return new Response(new Uint8Array(PLACEHOLDER_PNG), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Short-lived on purpose — retry soon rather than locking in a
      // placeholder for a day if Drive was only briefly unavailable.
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    },
  });
}

async function fetchFromDrive(fileId: string, apiKey: string) {
  return fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`);
}

// Google's rate-limiting applies to our whole API key/IP, not one file at a
// time — so once we see it, stop hitting Drive AT ALL for a cooldown
// window, for every photo, rather than retrying file-by-file and keeping
// the block alive. This is the single biggest lever for actually letting
// a throttle clear instead of prolonging it.
const CIRCUIT_BREAKER_MS = 30_000;
let circuitOpenUntil = 0;

function isGoogleThrottling(status: number) {
  // Google's bot-protection page comes back as a plain 403 (not Drive's
  // usual structured JSON error body), but checking the status alone is
  // enough here — a 403 from this endpoint is never a legitimate "this
  // exact file is forbidden" case for files the client has shared publicly.
  return status === 403 || status === 429;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const cached = cacheGet(fileId);
  if (cached) {
    return new Response(cached.body, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Image-Cache": "hit",
      },
    });
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey || !/^[\w-]+$/.test(fileId)) {
    return placeholderResponse();
  }

  if (Date.now() < circuitOpenUntil) {
    // Already know Drive is throttling us — don't make it worse.
    return placeholderResponse();
  }

  try {
    let driveRes = await fetchFromDrive(fileId, apiKey);

    if (!driveRes.ok && isGoogleThrottling(driveRes.status)) {
      circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_MS;
      console.error(`Drive is throttling us (${driveRes.status}) — backing off all requests for ${CIRCUIT_BREAKER_MS / 1000}s`);
      return placeholderResponse();
    }

    if (!driveRes.ok) {
      console.error(`Drive image fetch failed for ${fileId}: ${driveRes.status}, retrying once`);
      await new Promise((resolve) => setTimeout(resolve, 400));
      driveRes = await fetchFromDrive(fileId, apiKey);
    }

    if (!driveRes.ok) {
      if (isGoogleThrottling(driveRes.status)) {
        circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_MS;
      }
      console.error(`Drive image fetch failed for ${fileId} after retry: ${driveRes.status}`);
      return placeholderResponse();
    }

    const contentType = driveRes.headers.get("content-type") ?? "image/jpeg";
    const body = await driveRes.arrayBuffer();
    cacheSet(fileId, { body, contentType, cachedAt: Date.now() });

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        // A given photo almost never changes once uploaded, so cache hard:
        // fresh for a day, and a stale copy can still serve for a week while
        // we quietly refetch — fewer round-trips to Drive, faster repeat
        // loads, and a viewer is never left with nothing.
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Image-Cache": "miss",
      },
    });
  } catch (err) {
    console.error(`Drive image proxy threw for ${fileId}:`, err);
    return placeholderResponse();
  }
}
