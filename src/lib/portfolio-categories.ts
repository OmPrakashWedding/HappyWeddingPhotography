/**
 * Single source of truth for the four Portfolio categories — the small
 * teaser bars on /portfolio and the dedicated /portfolio/[category] pages
 * both read from here, so they can never drift out of sync.
 *
 * `driveFolderEnv` names the .env.local variable holding that category's
 * Google Drive folder ID (see Documents/portfolio-media-integration-guide.md).
 */
export type PortfolioCategorySlug = "pre-wedding" | "wedding" | "events" | "other";

export type PortfolioCategory = {
  slug: PortfolioCategorySlug;
  label: string;
  title: string;
  description: string;
  accent: string;
  tint: string;
  cols: 3 | 4;
  driveFolderEnv: string;
  /** Fallback gradient tiles shown until real Drive photos are configured. */
  placeholderTiles: string[];
};

export const portfolioCategories: PortfolioCategory[] = [
  {
    slug: "pre-wedding",
    label: "Pre-Wedding",
    title: "Golden Hour Beginnings",
    description: "Relaxed, candid pre-wedding shoots — golden hour light, real moments, no stiff posing.",
    accent: "#5f7f92",
    tint: "linear-gradient(180deg, #eef4f8, #e5eef4)",
    cols: 3,
    driveFolderEnv: "GOOGLE_DRIVE_FOLDER_PRE_WEDDING",
    placeholderTiles: ["#dce8ef,#a9c3d3", "#c9dbe6,#8fa9bc", "#e3edf3,#b7cddb"],
  },
  {
    slug: "wedding",
    label: "Wedding",
    title: "The Big Day",
    description: "Every part of the wedding day — ceremony, reception, and the quiet moments in between.",
    accent: "#a8706f",
    tint: "linear-gradient(180deg, #f8eeee, #f3e2e0)",
    cols: 4,
    driveFolderEnv: "GOOGLE_DRIVE_FOLDER_WEDDING",
    placeholderTiles: ["#f0dcdc,#dcaaa8", "#e9c9c8,#c98f8a", "#f3e0df,#d3a09d", "#ecd2d1,#c68885"],
  },
  {
    slug: "events",
    label: "Events",
    title: "Celebrations & Corporate Events",
    description: "Corporate functions, receptions, and every other celebration we've been part of.",
    accent: "var(--gold-dark)",
    tint: "var(--cream-1)",
    cols: 3,
    driveFolderEnv: "GOOGLE_DRIVE_FOLDER_EVENTS",
    placeholderTiles: ["#f0dcc0,#d7a978", "#ead6c0,#c9a06a", "#e3cfae,#b98b4e"],
  },
  {
    slug: "other",
    label: "Other",
    title: "Every Other Story",
    description: "The moments that don't fit a category, but tell a story worth keeping.",
    accent: "#7c8863",
    tint: "linear-gradient(180deg, #eef0e6, #e6e9da)",
    cols: 3,
    driveFolderEnv: "GOOGLE_DRIVE_FOLDER_OTHER",
    placeholderTiles: ["#d8ddc4,#a9b18f", "#dde2cd,#9ea87f", "#e2e6d4,#b3bb94"],
  },
];

export function getPortfolioCategory(slug: string): PortfolioCategory | undefined {
  return portfolioCategories.find((c) => c.slug === slug);
}
