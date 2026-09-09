import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 pt-14 md:pt-18 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.jpg"
                alt={siteConfig.name}
                width={38}
                height={38}
                className="rounded-full object-cover"
              />
              <span className="font-serif text-lg">{siteConfig.name}</span>
            </div>
            <p className="text-sm text-ink-soft font-light max-w-[280px] leading-relaxed">
              Wedding &amp; event photography, videography and cinematography.
            </p>
          </div>

          <div>
            <div className="text-xs tracking-widest uppercase text-gold-dark mb-4">Explore</div>
            <div className="flex flex-col gap-2.5 text-sm">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs tracking-widest uppercase text-gold-dark mb-4">Contact</div>
            <div className="flex flex-col gap-2.5 text-sm text-ink-soft">
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              <span>{siteConfig.address}</span>
            </div>
          </div>

          <div>
            <div className="text-xs tracking-widest uppercase text-gold-dark mb-4">Follow</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href={siteConfig.youtubeUrl} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-ink-soft/80 pt-6 border-t border-line">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
