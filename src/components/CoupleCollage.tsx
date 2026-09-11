import type { DriveImage } from "@/lib/googleDrive";
import type { VideoLink } from "@/lib/videoLinks";
import { YouTubeFilmTile, InstagramFilmTile } from "./FilmTile";
import { HeartIcon } from "./icons";

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
    : photos.map((p) => ({ key: p.id, url: p.url, alt: p.name }));

  type Tile =
    | { type: "photo"; key: string; url?: string; alt?: string; grad?: string; aspect?: string }
    | { type: "video"; key: string; video: VideoLink }
    | { type: "name"; key: "name" };

  const tiles: Tile[] = [];
  const videoEvery = videos.length > 0 ? Math.max(2, Math.floor(photoTiles.length / videos.length)) : 0;
  let videoIndex = 0;
  // The name card sits in-flow, a couple of tiles in — reads prominently
  // near the top without ever covering a photo underneath it.
  const nameCardPosition = Math.min(2, photoTiles.length);

  photoTiles.forEach((tile, i) => {
    if (i === nameCardPosition) tiles.push({ type: "name", key: "name" });
    tiles.push({ type: "photo", ...tile });
    if (videoEvery > 0 && (i + 1) % videoEvery === 0 && videoIndex < videos.length) {
      tiles.push({ type: "video", key: `video-${videos[videoIndex].url}`, video: videos[videoIndex] });
      videoIndex++;
    }
  });
  if (nameCardPosition >= photoTiles.length) tiles.push({ type: "name", key: "name" });
  while (videoIndex < videos.length) {
    tiles.push({ type: "video", key: `video-${videos[videoIndex].url}`, video: videos[videoIndex] });
    videoIndex++;
  }

  return (
    <div className="mb-16 md:mb-20 columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
      {tiles.map((tile) => {
        if (tile.type === "name") {
          return (
            <div
              key="name"
              className="relative bg-card/95 rounded-lg px-8 py-7 text-center mb-3 md:mb-4 break-inside-avoid shadow-[0_18px_40px_-18px_rgba(80,60,30,0.3)]"
            >
              <HeartIcon size={18} color={accent} className="absolute -top-3 -right-3 opacity-70" />
              <div className="text-[11px] tracking-[0.2em] uppercase mb-1.5" style={{ color: accent }}>
                Our Love Story
              </div>
              <div
                className="font-script text-4xl md:text-5xl leading-none"
                style={{ color: "var(--gold-dark)" }}
              >
                {names}
              </div>
            </div>
          );
        }

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
        if (tile.url) {
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
  );
}
