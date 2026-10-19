import { getCategoryPhotos } from "@/lib/googleDrive";
import { getAllVideoLinks } from "@/lib/videoLinks";
import { getPortfolioCategory } from "@/lib/portfolio-categories";
import { GalleriesClient } from "@/components/GalleriesClient";
import { pickRandom } from "@/lib/random";

export const revalidate = 300;

const GALLERY_CATEGORIES = [
  { name: "Weddings" as const, portfolioSlug: "wedding" as const },
  { name: "Pre-Wedding" as const, portfolioSlug: "pre-wedding" as const },
  { name: "Corporate Events" as const, portfolioSlug: "events" as const },
];

const MAX_SECTION_PHOTOS = 10;

export default async function GalleriesPage() {
  const sections = await Promise.all(
    GALLERY_CATEGORIES.map(async ({ name, portfolioSlug }) => {
      const { all } = await getCategoryPhotos(portfolioSlug);
      const category = getPortfolioCategory(portfolioSlug);
      return {
        name,
        portfolioSlug,
        photos: pickRandom(all, MAX_SECTION_PHOTOS),
        placeholderTiles: category?.placeholderTiles ?? [],
      };
    })
  );

  const allVideos = await getAllVideoLinks();
  // Films shows one per category to stay varied rather than all from one shoot.
  const films = GALLERY_CATEGORIES.flatMap(({ portfolioSlug }) =>
    allVideos.filter((v) => v.category === portfolioSlug).slice(0, 2)
  );

  return <GalleriesClient sections={sections} films={films} />;
}
