import type { PortfolioCategorySlug } from "./portfolio-categories";

export type VideoPlatform = "youtube" | "instagram";

export type VideoLink = {
  category: PortfolioCategorySlug;
  platform: VideoPlatform;
  url: string;
  caption?: string;
  order: number;
  /** Only set when platform === "youtube" and an ID could be extracted. */
  youtubeId?: string;
};

const VALID_CATEGORIES: PortfolioCategorySlug[] = ["pre-wedding", "wedding", "events", "other"];
const CSV_URL = process.env.GOOGLE_SHEET_VIDEOS_CSV_URL;

/**
 * Minimal CSV parser — handles quoted fields containing commas, which is
 * all a Google Sheets "Publish to web" CSV export needs.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function extractYouTubeId(url: string): string | undefined {
  const patterns = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = url.match(re);
    if (match) return match[1];
  }
  return undefined;
}

let cache: { data: VideoLink[]; fetchedAt: number } | null = null;

export async function getAllVideoLinks(): Promise<VideoLink[]> {
  if (!CSV_URL) return [];

  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 300 } });
    if (!res.ok) {
      console.error(`Video links CSV fetch failed: ${res.status}`);
      return cache?.data ?? [];
    }
    const text = await res.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return [];

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = {
      category: header.indexOf("category"),
      platform: header.indexOf("platform"),
      url: header.indexOf("url"),
      caption: header.indexOf("caption"),
      order: header.indexOf("order"),
    };
    if (idx.category === -1 || idx.platform === -1 || idx.url === -1) {
      console.error("Video links CSV is missing required columns (category, platform, url)");
      return [];
    }

    const links: VideoLink[] = [];
    for (const cells of rows.slice(1)) {
      const category = cells[idx.category]?.trim().toLowerCase() as PortfolioCategorySlug;
      const platform = cells[idx.platform]?.trim().toLowerCase() as VideoPlatform;
      const url = cells[idx.url]?.trim();

      if (!VALID_CATEGORIES.includes(category)) continue;
      if (platform !== "youtube" && platform !== "instagram") continue;
      if (!url) continue;

      const caption = idx.caption !== -1 ? cells[idx.caption]?.trim() || undefined : undefined;
      const orderRaw = idx.order !== -1 ? Number(cells[idx.order]) : NaN;
      const order = Number.isFinite(orderRaw) ? orderRaw : 999;

      links.push({
        category,
        platform,
        url,
        caption,
        order,
        youtubeId: platform === "youtube" ? extractYouTubeId(url) : undefined,
      });
    }

    cache = { data: links, fetchedAt: Date.now() };
    return links;
  } catch (err) {
    console.error("Video links CSV fetch threw:", err);
    return cache?.data ?? [];
  }
}

export async function getVideoLinksByCategory(slug: PortfolioCategorySlug): Promise<VideoLink[]> {
  const all = await getAllVideoLinks();
  return all.filter((v) => v.category === slug).sort((a, b) => a.order - b.order);
}

export const isVideoSheetConfigured = Boolean(CSV_URL);
