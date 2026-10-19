import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fewer responsive variants = fewer distinct fetches through
    // /api/drive-image -> Google Drive per photo. Drive isn't a CDN and
    // has abuse-protection rate limits; the default 8 device sizes x 8
    // image sizes fans every photo out into way more Drive requests than
    // this site's layouts (masonry tiles, fixed-ratio boxes) need.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [96, 256, 384],
    // Cache optimized output for a day minimum, matching the proxy's own
    // Cache-Control — keeps repeat loads (and dev restarts) off Drive.
    minimumCacheTTL: 86400,
    // Photos are served via Cloudinary's fetch delivery (see
    // src/lib/googleDrive.ts) when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is
    // set — next/image needs this host allow-listed to optimize it.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
