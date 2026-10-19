import Image from "next/image";
import type { DriveImage } from "@/lib/googleDrive";
import type { VideoLink } from "@/lib/videoLinks";
import { YouTubeFilmTile, InstagramFilmTile } from "./FilmTile";
import { CoupleNameBanner } from "./CoupleNameBanner";

const PLACEHOLDER_GRADIENTS = [
  "#f0dcdc,#dcaaa8;4/3",
  "#e9c9c8,#c98f8a;3/4",
  "#f3e0df,#d3a09d;4/3",
  "#ecd2d1,#c68885;4/5",
  "#e7c9b8,#c98f8a;3/4",
  "#dce8ef,#a9c3d3;4/3",
  "#c9dbe6,#8fa9bc;3/4",
  "#e3edf3,#b7cddb;4/3",
];

/**
 * A masonry "wall" — each photo keeps its own natural aspect ratio (no
 * cropping), so the layout's variety comes from the real shapes of the
 * couple's actual photos rather than a fixed template. The couple-name
 * card is one flow item among the tiles, not an overlay, so it can never
 * land on top of a photo.
 */
export function CoupleCollage({
  names,
  photos,
  videos,
  accent,
}: {
  names: string;
  photos: DriveImage[];
  videos: VideoLink[];
  accent: string;
}) {
  const isPlaceholder = photos.length === 0;
  const photoTiles = isPlaceholder
    ? PLACEHOLDER_GRADIENTS.map((entry, i) => {
        const [grad, aspect] = entry.split(";");
        return { key: `ph-${i}`, grad, aspect };
      })
    : photos.map((p) => ({ key: p.id, url: p.url, alt: p.name, width: p.width, height: p.height }));

  type Tile =
    | {
        type: "photo";
        key: string;
        url?: string;
        alt?: string;
        grad?: string;
        aspect?: string;
        width?: number;
        height?: number;
      }
    | { type: "video"; key: string; video: VideoLink };

  const tiles: Tile[] = [];
  const videoEvery = videos.length > 0 ? Math.max(2, Math.floor(photoTiles.length / videos.length)) : 0;
  let videoIndex = 0;

  photoTiles.forEach((tile, i) => {
    tiles.push({ type: "photo", ...tile });
    if (videoEvery > 0 && (i + 1) % videoEvery === 0 && videoIndex < videos.length) {
      tiles.push({ type: "video", key: `video-${videos[videoIndex].url}`, video: videos[videoIndex] });
      videoIndex++;
    }
  });
  while (videoIndex < videos.length) {
    tiles.push({ type: "video", key: `video-${videos[videoIndex].url}`, video: videos[videoIndex] });
    videoIndex++;
  }

  return (
    <div className="mb-16 md:mb-20">
      <CoupleNameBanner names={names} />
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
        {tiles.map((tile) => {
          if (tile.type === "video") {
            if (tile.video.platform === "youtube" && tile.video.youtubeId) {
              return (
                <YouTubeFilmTile
                  key={tile.key}
                  youtubeId={tile.video.youtubeId}
                  caption={tile.video.caption}
                />
              );
            }
            return <InstagramFilmTile key={tile.key} url={tile.video.url} caption={tile.video.caption} />;
          }

          // Photo tile — real Drive image (natural aspect ratio, no crop) or a
          // placeholder gradient sized to a representative aspect ratio.
          if (tile.url && tile.width && tile.height) {
            return (
              <Image
                key={tile.key}
                src={tile.url}
                alt={tile.alt ?? ""}
                width={tile.width}
                height={tile.height}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-auto rounded mb-3 md:mb-4 break-inside-avoid"
              />
            );
          }
          if (tile.url) {
            // Fallback for the rare file Drive didn't return dimensions for.
            return (
              <img
                key={tile.key}
                src={tile.url}
                alt={tile.alt}
                loading="lazy"
                className="w-full rounded mb-3 md:mb-4 break-inside-avoid"
              />
            );
          }
          return (
            <div
              key={tile.key}
              style={{ aspectRatio: tile.aspect, background: `linear-gradient(135deg, ${tile.grad})` }}
              className="w-full rounded mb-3 md:mb-4 break-inside-avoid"
            />
          );
        })}
      </div>
    </div>
  );
}
