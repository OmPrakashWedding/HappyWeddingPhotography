"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DriveImage } from "@/lib/googleDrive";
import type { VideoLink } from "@/lib/videoLinks";
import { YouTubeFilmTile, InstagramFilmTile } from "./FilmTile";
import { siteConfig } from "@/lib/site-config";

const categories = ["All", "Weddings", "Pre-Wedding", "Corporate Events", "Films"] as const;
type Category = (typeof categories)[number];

type GallerySection = {
  name: Exclude<Category, "All" | "Films">;
  portfolioSlug: string;
  photos: DriveImage[];
  placeholderTiles: string[];
};

export function GalleriesClient({
  sections,
  films,
}: {
  sections: GallerySection[];
  films: VideoLink[];
}) {
  const [active, setActive] = useState<Category>("All");

  const visibleSections = sections.filter((s) => active === "All" || active === s.name);

  return (
    <div>
      <div className="pt-16 md:pt-20 pb-6 px-6 md:px-16 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Full Library</div>
        <h1 className="font-serif text-3xl md:text-5xl mt-3.5">Galleries</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[560px] mx-auto mt-4 mb-8">
          Browse the complete collection by category &mdash; photos and films from every
          celebration we&apos;ve been part of.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`text-xs tracking-wider uppercase px-5 py-2.5 rounded-full transition-colors ${
                active === cat
                  ? "bg-ink text-cream-1"
                  : "bg-card border border-line text-ink hover:border-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {visibleSections.map((section) => (
        <div key={section.name} className="pt-10 md:pt-14 px-6 md:px-16">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl">{section.name}</h2>
            <Link href={`/portfolio/${section.portfolioSlug}`} className="text-xs tracking-wider uppercase">
              See all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {section.photos.length > 0
              ? section.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-[4/5] rounded overflow-hidden bg-cream-1"
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
              : section.placeholderTiles.map((grad, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] rounded"
                    style={{ background: `linear-gradient(135deg, ${grad})` }}
                  />
                ))}
          </div>
        </div>
      ))}

      {(active === "All" || active === "Films") && (
        <div className="pt-14 pb-16 px-6 md:px-16">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl">Films</h2>
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-wider uppercase"
            >
              Watch on YouTube &rarr;
            </a>
          </div>
          {films.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {films.slice(0, 6).map((video) =>
                video.platform === "youtube" && video.youtubeId ? (
                  <YouTubeFilmTile key={video.url} youtubeId={video.youtubeId} caption={video.caption} />
                ) : (
                  <InstagramFilmTile key={video.url} url={video.url} caption={video.caption} />
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {["#3d332a,#6b5c4c", "#5a4a38,#8f6a34", "#4a3d30,#a9707a"].map((grad, i) => (
                <div
                  key={i}
                  className="relative h-60 rounded flex items-center justify-center"
                  style={{ background: `linear-gradient(160deg, ${grad})` }}
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-cream-1/90 flex items-center justify-center">
                    <div
                      className="ml-1"
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        borderLeft: "13px solid var(--ink)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
