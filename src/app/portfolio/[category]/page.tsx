import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { portfolioCategories, getPortfolioCategory } from "@/lib/portfolio-categories";
import { getCategoryPhotos } from "@/lib/googleDrive";
import { getVideoLinksByCategory, getVideoLinksByCouple } from "@/lib/videoLinks";
import { getFeaturedCouples, type CoupleCategorySlug } from "@/lib/couples";
import { MediaWall } from "@/components/MediaWall";
import { CoupleCollage } from "@/components/CoupleCollage";
import { siteConfig } from "@/lib/site-config";

const COUPLE_CATEGORIES: CoupleCategorySlug[] = ["pre-wedding", "wedding"];
function isCoupleCategory(slug: string): slug is CoupleCategorySlug {
  return (COUPLE_CATEGORIES as string[]).includes(slug);
}

export const revalidate = 300;

export function generateStaticParams() {
  return portfolioCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const config = getPortfolioCategory(category);
  if (!config) return {};
  return {
    title: `${config.label} | ${siteConfig.name}`,
    description: config.description,
  };
}

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const config = getPortfolioCategory(category);
  if (!config) notFound();

  const showCouples = isCoupleCategory(config.slug);

  return (
    <div style={{ background: config.tint }} className="min-h-screen">
      <div className="pt-12 md:pt-16 pb-10 px-6 md:px-16 text-center">
        <Link
          href="/portfolio"
          className="text-xs tracking-wider uppercase"
          style={{ color: config.accent }}
        >
          &larr; All Portfolio
        </Link>
        <div className="text-xs tracking-[0.22em] uppercase mt-6" style={{ color: config.accent }}>
          {config.label}
        </div>
        <h1 className="font-serif text-3xl md:text-5xl mt-3">{config.title}</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[560px] mx-auto mt-4">
          {config.description}
        </p>
      </div>

      <div className="px-6 md:px-16 pb-24">
        {showCouples ? (
          <CoupleCollages categorySlug={config.slug as CoupleCategorySlug} accent={config.accent} />
        ) : (
          <CategoryMediaWall categorySlug={config.slug} placeholderTiles={config.placeholderTiles} />
        )}
      </div>
    </div>
  );
}

async function CategoryMediaWall({
  categorySlug,
  placeholderTiles,
}: {
  categorySlug: Parameters<typeof getCategoryPhotos>[0];
  placeholderTiles: string[];
}) {
  const [{ all: photos }, videos] = await Promise.all([
    getCategoryPhotos(categorySlug),
    getVideoLinksByCategory(categorySlug),
  ]);
  return <MediaWall photos={photos} videos={videos} placeholderTiles={placeholderTiles} />;
}

async function CoupleCollages({
  categorySlug,
  accent,
}: {
  categorySlug: CoupleCategorySlug;
  accent: string;
}) {
  const couples = await getFeaturedCouples(categorySlug);

  if (couples.length === 0) {
    // Nothing configured (or uploaded) yet — one sample collage so the page
    // never looks broken, matching the rest of the pipeline's fallback rule.
    return <CoupleCollage names="Priya & Arjun" photos={[]} videos={[]} accent={accent} />;
  }

  const collages = await Promise.all(
    couples.map(async (couple) => ({
      couple,
      videos: await getVideoLinksByCouple(couple.names, categorySlug),
    }))
  );

  return (
    <>
      {collages.map(({ couple, videos }) => (
        <CoupleCollage
          key={couple.names}
          names={couple.names}
          photos={couple.photos}
          videos={videos}
          accent={accent}
        />
      ))}
    </>
  );
}
