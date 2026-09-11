import { NextRequest } from "next/server";

/**
 * Serves a Google Drive image through our own domain instead of linking
 * directly to Google's `thumbnailLink` — that link is a pre-generated
 * preview URL that isn't guaranteed to stay stable for hotlinking. This
 * route instead calls Drive's actual file-content endpoint (`alt=media`),
 * the stable, documented way to fetch a file's bytes, every time a browser
 * requests the image — so a photo never "goes stale" the way a cached
 * thumbnail link can.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!apiKey || !/^[\w-]+$/.test(fileId)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!driveRes.ok || !driveRes.body) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(driveRes.body, {
      headers: {
        "Content-Type": driveRes.headers.get("content-type") ?? "image/jpeg",
        // Browsers cache for an hour; a stale copy can still serve for a day
        // while we quietly refetch, so a viewer is never left with nothing.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error(`Drive image proxy failed for ${fileId}:`, err);
    return new Response("Image fetch failed", { status: 502 });
  }
}
