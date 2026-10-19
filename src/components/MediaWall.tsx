import Image from "next/image";
import type { DriveImage } from "@/lib/googleDrive";
import type { VideoLink } from "@/lib/videoLinks";
import { YouTubeFilmTile, InstagramFilmTile } from "./FilmTile";

/**
 * Dense "wall of images" grid mixing photo tiles and film tiles —
 * CSS-columns masonry, modeled on the Litho/Hitchcock-style reference
 * portfolios rather than a rigid uniform grid.
 */
export function MediaWall({
  photos,
  videos,
  placeholderTiles,
}: {
  photos: DriveImage[];
  videos: VideoLink[];
  placeholderTiles: string[];
}) {
  const hasRealMedia = photos.length > 0 || videos.length > 0;

  if (!hasRealMedia) {
    return (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const grad = placeholderTiles[i % placeholderTiles.length];
          const tall = i % 3 === 1;
          return (
            <div
              key={i}
              className={`w-full rounded mb-3 md:mb-4 break-inside-avoid ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
              style={{ background: `linear-gradient(135deg, ${grad})` }}
            />
          );
        })}
      </div>
    );
  }

  // Interleave videos evenly among the photos so films don't clump at the end.
  const tiles: React.ReactNode[] = [];
  const videoEvery = videos.length > 0 ? Math.max(1, Math.floor(photos.length / videos.length)) : 0;
  let videoIndex = 0;

  photos.forEach((photo, i) => {
    tiles.push(
      photo.width && photo.height ? (
        <Image
          key={`photo-${photo.id}`}
          src={photo.url}
          alt={photo.name}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-auto rounded mb-3 md:mb-4 break-inside-avoid"
        />
      ) : (
        // Fallback for the rare file Drive didn't return dimensions for.
        <img
          key={`photo-${photo.id}`}
          src={photo.url}
          alt={photo.name}
          loading="lazy"
          className="w-full rounded mb-3 md:mb-4 break-inside-avoid"
        />
      )
    );
    if (videoEvery > 0 && (i + 1) % videoEvery === 0 && videoIndex < videos.length) {
      const video = videos[videoIndex++];
      tiles.push(renderVideoTile(video));
    }
  });
  while (videoIndex < videos.length) {
    tiles.push(renderVideoTile(videos[videoIndex++]));
  }

  return <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">{tiles}</div>;
}

function renderVideoTile(video: VideoLink) {
  if (video.platform === "youtube" && video.youtubeId) {
    return <YouTubeFilmTile key={`video-${video.url}`} youtubeId={video.youtubeId} caption={video.caption} />;
  }
  if (video.platform === "instagram") {
    return <InstagramFilmTile key={`video-${video.url}`} url={video.url} caption={video.caption} />;
  }
  return null;
}
