import { siteConfig } from "@/lib/site-config";
import { GoogleGIcon, StarIcon } from "./icons";

export function GoogleRatingBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";
  return (
    <div
      className={`inline-flex items-center gap-2.5 bg-card border border-line rounded-full ${
        isSmall ? "px-4 py-2" : "px-5 py-2.5"
      }`}
    >
      <GoogleGIcon size={isSmall ? 15 : 18} />
      <span className={`font-medium text-ink ${isSmall ? "text-xs" : "text-sm"}`}>
        {siteConfig.googleRating} Google Rating
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} size={isSmall ? 13 : 15} />
        ))}
      </div>
    </div>
  );
}
