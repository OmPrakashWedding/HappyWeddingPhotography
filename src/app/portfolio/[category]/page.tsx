import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { portfolioCategories, getPortfolioCategory } from "@/lib/portfolio-categories";
import { getCategoryPhotos } from "@/lib/googleDrive";
import { getVideoLinksByCategory } from "@/lib/videoLinks";
import { MediaWall } from "@/components/MediaWall";
import { siteConfig } from "@/lib/site-config";

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

  const [{ all: photos }, videos] = await Promise.all([
    getCategoryPhotos(config.slug),
    getVideoLinksByCategory(config.slug),
  ]);

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
        <MediaWall photos={photos} videos={videos} placeholderTiles={config.placeholderTiles} />
      </div>
    </div>
  );
}
