"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function YouTubeFilmTile({
  youtubeId,
  caption,
}: {
  youtubeId: string;
  caption?: string;
}) {
  return (
    <div className="relative w-full aspect-[4/3] rounded overflow-hidden bg-ink mb-3 md:mb-4 break-inside-avoid">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        loading="lazy"
        title={caption ?? "Film"}
      />
      {caption && (
        <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent text-white text-xs">
          {caption}
        </div>
      )}
    </div>
  );
}

export function InstagramFilmTile({ url, caption }: { url: string; caption?: string }) {
  useEffect(() => {
    function process() {
      window.instgrm?.Embeds.process();
    }
    if (window.instgrm) {
      process();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.instagram.com/embed.js"]'
    );
    if (existing) {
      existing.addEventListener("load", process, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.addEventListener("load", process, { once: true });
    document.body.appendChild(script);
  }, [url]);

  return (
    <div className="rounded overflow-hidden bg-card border border-line mb-3 md:mb-4 break-inside-avoid">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ margin: 0, width: "100%", minWidth: "auto" }}
      >
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-6 text-center text-sm">
          {caption ?? "View on Instagram"}
        </a>
      </blockquote>
    </div>
  );
}
