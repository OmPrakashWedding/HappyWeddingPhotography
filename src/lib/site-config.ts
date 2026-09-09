/**
 * Central place for site-wide constants that come from env vars.
 * See docs/CREDENTIALS_SETUP.md for where each value comes from.
 */
export const siteConfig = {
  name: "Happy Wedding Photography",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+91 98103 49614",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "happyweddingds@gmail.com",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "A-64, Pocket A, Sarita Vihar, New Delhi, Delhi 110076",
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "happy_wedding_photography",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/happy_wedding_photography/",
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@happyweddingphotography2030",
  googleRating: "5.0",
} as const;

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/galleries", label: "Galleries" },
] as const;
