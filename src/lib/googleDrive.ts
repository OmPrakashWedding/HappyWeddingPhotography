import type { PortfolioCategorySlug } from "./portfolio-categories";
import { portfolioCategories } from "./portfolio-categories";

export type DriveImage = {
  id: string;
  url: string;
  name: string;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

export type DriveSubfolder = { id: string; name: string };

const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const FOLDER_MIME = "application/vnd.google-apps.folder";

/**
 * Served through our own /api/drive-image proxy (src/app/api/drive-image/
 * [fileId]/route.ts) rather than Google's `thumbnailLink`, which is a
 * pre-generated preview URL not guaranteed stable for hotlinking — see
 * Documents/portfolio-media-integration-guide.md §1.6 for why.
 */
function toDisplayUrl(fileId: string): string {
  return `/api/drive-image/${fileId}`;
}

export async function listFolderChildren(folderId: string): Promise<DriveFile[]> {
  if (!DRIVE_API_KEY) return [];

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType)",
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
    .map((f) => ({ id: f.id, name: f.name, url: toDisplayUrl(f.id) }));
}

/** Subfolders directly inside `folderId`, sorted by name — used for the Couples/ folder. */
export async function listSubfolders(folderId: string): Promise<DriveSubfolder[]> {
  const children = await listFolderChildren(folderId);
  return children
    .filter((f) => f.mimeType === FOLDER_MIME)
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

  const [featuredFiles, restImages] = await Promise.all([
    featuredFolder ? listFolderChildren(featuredFolder.id) : Promise.resolve([]),
    Promise.resolve(children.filter((f) => f.mimeType !== FOLDER_MIME)),
  ]);

  const featured = toDriveImages(featuredFiles);
  const rest = toDriveImages(restImages);

  return { featured, all: [...featured, ...rest] };
}

export const isDriveConfigured = Boolean(DRIVE_API_KEY);
