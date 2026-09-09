import type { PortfolioCategorySlug } from "./portfolio-categories";
import { portfolioCategories } from "./portfolio-categories";

export type DriveImage = {
  id: string;
  url: string;
  name: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
};

const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const FOLDER_MIME = "application/vnd.google-apps.folder";

/**
 * Upsizes Google's own returned thumbnail link (e.g. "...=s220") to a
 * larger render size, instead of guessing an unofficial direct-file URL —
 * see Documents/portfolio-media-integration-guide.md §1.6 for why.
 */
function toDisplayUrl(thumbnailLink: string, size = 1600): string {
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
}

async function listFolderChildren(folderId: string): Promise<DriveFile[]> {
  if (!DRIVE_API_KEY) return [];

  const params = new URLSearchParams({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,thumbnailLink)",
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
    .filter((f) => f.mimeType.startsWith("image/") && f.thumbnailLink)
    .map((f) => ({ id: f.id, name: f.name, url: toDisplayUrl(f.thumbnailLink!) }));
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
  const featuredFolder = children.find((f) => f.mimeType === FOLDER_MIME && f.name === "Featured");

  const [featuredFiles, restImages] = await Promise.all([
    featuredFolder ? listFolderChildren(featuredFolder.id) : Promise.resolve([]),
    Promise.resolve(children.filter((f) => f.mimeType !== FOLDER_MIME)),
  ]);

  const featured = toDriveImages(featuredFiles);
  const rest = toDriveImages(restImages);

  return { featured, all: [...featured, ...rest] };
}

export const isDriveConfigured = Boolean(DRIVE_API_KEY);
