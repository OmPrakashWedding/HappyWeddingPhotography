import type { PortfolioCategorySlug } from "./portfolio-categories";
import { portfolioCategories } from "./portfolio-categories";

export type DriveImage = {
  id: string;
  url: string;
  name: string;
  /** Real pixel dimensions from Drive, when available — lets next/image
   *  size and optimize the image correctly instead of guessing. */
  width?: number;
  height?: number;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  imageMediaMetadata?: { width?: number; height?: number };
  thumbnailLink?: string;
};

export type DriveSubfolder = { id: string; name: string };

const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const FOLDER_MIME = "application/vnd.google-apps.folder";

/**
 * Where a photo's actual bytes get served from. Two tiers:
 *
 * 1. Cloudinary "fetch" delivery (when configured) — Cloudinary fetches
 *    the file once, ever, then caches it permanently on its own CDN and
 *    serves every future request from there. Drive only ever sees ONE
 *    fetch per photo, total, regardless of visitor count or how many
 *    responsive-size variants next/image requests — this is what actually
 *    fixes Google's abuse-protection rate limiting, since it was our own
 *    server's request *volume* that triggered it, not any single request.
 *
 *    The fetch source is Drive's own `thumbnailLink` (resized, upsized to
 *    ~1600px), not the full original — Cloudinary's free tier caps a
 *    fetched source file at 10MB, and a full-resolution wedding photo
 *    routinely exceeds that. Using `thumbnailLink` here is safe precisely
 *    *because* Cloudinary caches the result forever after one successful
 *    fetch: the link's long-term instability (the reason it's avoided for
 *    direct hotlinking — see Documents/portfolio-media-integration-guide.md
 *    §1.6) stops mattering once Cloudinary never needs to ask Drive for it
 *    again.
 * 2. Our own /api/drive-image proxy (src/app/api/drive-image/[fileId]/
 *    route.ts), streaming the real full-resolution file via `alt=media` —
 *    the fallback when Cloudinary isn't configured.
 */
function toDisplayUrl(fileId: string, thumbnailLink?: string): string {
  if (CLOUDINARY_CLOUD_NAME && thumbnailLink) {
    const upsized = thumbnailLink.replace(/=s\d+$/, "=s1600");
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(upsized)}`;
  }
  return `/api/drive-image/${fileId}`;
}

export async function listFolderChildren(folderId: string): Promise<DriveFile[]> {
  if (!DRIVE_API_KEY) return [];

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height))",
    orderBy: "name",
    key: DRIVE_API_KEY,
    pageSize: "200",
  });

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`Google Drive API error for folder ${folderId}: ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { files?: DriveFile[] };
    return data.files ?? [];
  } catch (err) {
    console.error(`Google Drive fetch failed for folder ${folderId}:`, err);
    return [];
  }
}

function toDriveImages(files: DriveFile[]): DriveImage[] {
  return files
    .filter((f) => f.mimeType.startsWith("image/"))
    .map((f) => ({
      id: f.id,
      name: f.name,
      url: toDisplayUrl(f.id, f.thumbnailLink),
      width: f.imageMediaMetadata?.width,
      height: f.imageMediaMetadata?.height,
    }));
}

/**
 * Subfolders directly inside `folderId`, sorted by name — used for a
 * Couples/ folder. Skips anything named "Gallery" (case-insensitive), since
 * some category folders keep a flat "Gallery" pool as a sibling of the
 * couple subfolders rather than inside a separate wrapper folder.
 */
export async function listSubfolders(folderId: string): Promise<DriveSubfolder[]> {
  const children = await listFolderChildren(folderId);
  return children
    .filter((f) => f.mimeType === FOLDER_MIME && f.name.trim().toLowerCase() !== "gallery")
    .map((f) => ({ id: f.id, name: f.name }));
}

/** Every image directly inside `folderId`, as ready-to-render DriveImages. */
export async function getFolderImages(folderId: string): Promise<DriveImage[]> {
  const children = await listFolderChildren(folderId);
  return toDriveImages(children);
}

/**
 * Photos for one Portfolio category: `featured` (the small teaser bar's
 * "Featured" subfolder) and `all` (featured + everything else in the
 * category folder — shown on the /portfolio/[category] deep page).
 *
 * The "Featured" subfolder match is case-insensitive, and a flat "Gallery"
 * subfolder (if present, e.g. Wedding/Gallery) counts as part of "rest"
 * too, alongside any images sitting directly in the category folder.
 */
export async function getCategoryPhotos(
  slug: PortfolioCategorySlug
): Promise<{ featured: DriveImage[]; all: DriveImage[] }> {
  const category = portfolioCategories.find((c) => c.slug === slug);
  const folderId = category ? process.env[category.driveFolderEnv] : undefined;

  if (!DRIVE_API_KEY || !folderId) {
    return { featured: [], all: [] };
  }

  const children = await listFolderChildren(folderId);
  const featuredFolder = children.find(
    (f) => f.mimeType === FOLDER_MIME && f.name.trim().toLowerCase() === "featured"
  );
  const galleryFolder = children.find(
    (f) => f.mimeType === FOLDER_MIME && f.name.trim().toLowerCase() === "gallery"
  );

  const [featuredFiles, galleryFiles] = await Promise.all([
    featuredFolder ? listFolderChildren(featuredFolder.id) : Promise.resolve([]),
    galleryFolder ? listFolderChildren(galleryFolder.id) : Promise.resolve([]),
  ]);
  const directImages = children.filter((f) => f.mimeType !== FOLDER_MIME);

  const featured = toDriveImages(featuredFiles);
  const rest = toDriveImages([...galleryFiles, ...directImages]);

  // "Other" stays empty (placeholder tiles) until it has its own real
  // photos in its own Drive folder — it should never borrow another
  // category's photos.
  return { featured, all: [...featured, ...rest] };
}

export const isDriveConfigured = Boolean(DRIVE_API_KEY);
