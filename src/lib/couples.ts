import { listSubfolders, getFolderImages, type DriveImage } from "./googleDrive";

export type CoupleCategorySlug = "pre-wedding" | "wedding";

export type Couple = {
  /** Display name with the numeric prefix stripped, e.g. "Priya & Arjun". */
  names: string;
  photos: DriveImage[];
};

const COUPLES_FOLDER_ENV: Record<CoupleCategorySlug, string> = {
  "pre-wedding": "GOOGLE_DRIVE_COUPLES_FOLDER_PRE_WEDDING",
  wedding: "GOOGLE_DRIVE_COUPLES_FOLDER_WEDDING",
};

const MAX_FEATURED = 5;

/** Strips a leading "01 - " / "01-" style ordering prefix off a folder name. */
function stripOrderPrefix(folderName: string): string {
  return folderName.replace(/^\d+\s*-\s*/, "").trim();
}

/**
 * The featured couples for one category (pre-wedding or wedding): reads the
 * `Couples/` parent folder, takes the first 5 subfolders by name (the
 * client controls this by numbering folders "01 - Name & Name", "02 - ...")
 * and fetches each couple's photos.
 *
 * Returns [] gracefully if the env var isn't configured yet — same
 * fallback pattern as the rest of the media pipeline.
 */
export async function getFeaturedCouples(slug: CoupleCategorySlug): Promise<Couple[]> {
  const folderId = process.env[COUPLES_FOLDER_ENV[slug]];
  if (!folderId) return [];

  const subfolders = await listSubfolders(folderId);
  const featured = subfolders
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_FEATURED);

  const couples = await Promise.all(
    featured.map(async (folder) => ({
      names: stripOrderPrefix(folder.name),
      photos: await getFolderImages(folder.id),
    }))
  );

  // A couple folder with zero photos yet isn't worth rendering an empty collage for.
  return couples.filter((c) => c.photos.length > 0);
}

export const isCouplesConfigured = (slug: CoupleCategorySlug): boolean =>
  Boolean(process.env[COUPLES_FOLDER_ENV[slug]]);
