import Link from "next/link";
import { portfolioCategories } from "@/lib/portfolio-categories";
import { getCategoryPhotos } from "@/lib/googleDrive";

export const revalidate = 300;

export default async function PortfolioPage() {
  const barsData = await Promise.all(
    portfolioCategories.map(async (category) => {
      const { featured } = await getCategoryPhotos(category.slug);
      return { category, featured };
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

      {barsData.map(({ category, featured }) => (
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
            {featured.length > 0
              ? featured
                  .slice(0, category.cols)
                  .map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.name}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded object-cover"
                    />
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
