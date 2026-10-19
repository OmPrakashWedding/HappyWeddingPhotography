import { getFolderImages, type DriveImage } from "./googleDrive";
import { pickRandom } from "./random";

export type AboutImages = {
  ownerPhoto: DriveImage | null;
  /** Section 2's photo — pinned to a specific chosen image, see PINNED_STORY_PHOTO_ID. */
  storyPhoto: DriveImage | null;
  /** Section 3's gallery — everything else in the story folder, so it can
   *  never repeat storyPhoto, and naturally grows as more photos are added. */
  galleryPhotos: DriveImage[];
};

/**
 * The specific photo chosen to represent "why Happy Wedding Photography" in
 * Section 2 (Drive file ID for "Copy of 7C1A6220.jpg"). Falls back to the
 * first photo in the folder if this one is ever removed/renamed, so the
 * page never breaks — but as long as it exists, this exact photo wins over
 * whatever would otherwise sort first alphabetically.
 */
const PINNED_STORY_PHOTO_ID = "1iwN4fxIh5wknF9uiEfgubYZ9aDLvwmp_";

/** Cap the gallery at a random selection as the story folder grows, same
 *  policy as the rest of the site's Drive-sourced photo grids. */
const MAX_GALLERY_PHOTOS = 10;

/**
 * Returns nulls/[] gracefully if the env vars aren't configured yet — same
 * fallback pattern as the rest of the media pipeline (see Documents/
 * about-page-redesign-plan.md).
 */
export async function getAboutImages(): Promise<AboutImages> {
  const ownerFolderId = process.env.GOOGLE_DRIVE_FOLDER_ABOUT_OWNER;
  const storyFolderId = process.env.GOOGLE_DRIVE_FOLDER_ABOUT_STORY;

  const [ownerImages, storyImages] = await Promise.all([
    ownerFolderId ? getFolderImages(ownerFolderId) : Promise.resolve([]),
    storyFolderId ? getFolderImages(storyFolderId) : Promise.resolve([]),
  ]);

  const pinnedIndex = storyImages.findIndex((img) => img.id === PINNED_STORY_PHOTO_ID);
  const storyIndex = pinnedIndex !== -1 ? pinnedIndex : 0;

  return {
    ownerPhoto: ownerImages[0] ?? null,
    storyPhoto: storyImages[storyIndex] ?? null,
    galleryPhotos: pickRandom(
      storyImages.filter((_, i) => i !== storyIndex),
      MAX_GALLERY_PHOTOS
    ),
  };
}
