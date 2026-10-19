import Link from "next/link";
import Image from "next/image";
import { portfolioCategories } from "@/lib/portfolio-categories";
import { getCategoryPhotos } from "@/lib/googleDrive";
import { getFeaturedCouples, type CoupleCategorySlug } from "@/lib/couples";

export const revalidate = 300;

const COUPLE_CATEGORIES: CoupleCategorySlug[] = ["pre-wedding", "wedding"];
function isCoupleCategory(slug: string): slug is CoupleCategorySlug {
  return (COUPLE_CATEGORIES as string[]).includes(slug);
}

export default async function PortfolioPage() {
  const barsData = await Promise.all(
    portfolioCategories.map(async (category) => {
      const { featured, all } = await getCategoryPhotos(category.slug);

      // Fall back through the same real photos already shown elsewhere on
      // the site, rather than placeholder tiles: first the category's own
      // "Featured" subfolder, then its wider photo pool (e.g. Wedding/
      // Gallery), then — for Pre-Wedding/Wedding — the first couple's
      // photos, since that's where the real volume of photos actually is.
      let preview = featured.length > 0 ? featured : all;
      if (preview.length === 0 && isCoupleCategory(category.slug)) {
        const couples = await getFeaturedCouples(category.slug);
        preview = couples[0]?.photos ?? [];
      }

      return { category, preview };
    })
  );

  return (
    <div>
      <div className="pt-16 md:pt-24 pb-8 px-6 md:px-16 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Curated Highlights</div>
        <h1 className="font-serif text-3xl md:text-5xl mt-3.5">Portfolio</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[560px] mx-auto mt-4">
          Scroll through our favourite moments, grouped by celebration &mdash; each with its own
          mood. For the full library, browse Galleries.
        </p>
      </div>

      {barsData.map(({ category, preview }) => (
        <div
          key={category.slug}
          style={{ background: category.tint }}
          className="py-14 md:py-18 px-6 md:px-16"
        >
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div
                className="text-xs tracking-[0.22em] uppercase"
                style={{ color: category.accent }}
              >
                {category.label}
              </div>
              <h2 className="font-serif text-2xl md:text-[32px] mt-2">{category.title}</h2>
            </div>
            <Link
              href={`/portfolio/${category.slug}`}
              className="text-xs tracking-wider uppercase hidden sm:inline"
              style={{ color: category.accent }}
            >
              View all &rarr;
            </Link>
          </div>
          <div
            className={`grid gap-5 grid-cols-2 ${
              category.cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            {preview.length > 0
              ? preview
                  .slice(0, category.cols)
                  .map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[4/3] w-full rounded overflow-hidden"
                      style={{ background: category.tint }}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain"
                      />
                    </div>
                  ))
              : category.placeholderTiles.map((grad, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded"
                    style={{ background: `linear-gradient(135deg, ${grad})` }}
                  />
                ))}
          </div>
          <Link
            href={`/portfolio/${category.slug}`}
            className="text-xs tracking-wider uppercase mt-5 sm:hidden inline-block"
            style={{ color: category.accent }}
          >
            View all &rarr;
          </Link>
        </div>
      ))}
    </div>
  );
}
