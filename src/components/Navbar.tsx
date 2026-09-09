"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, siteConfig } from "@/lib/site-config";

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-cream-1/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between h-[72px] md:h-[90px] px-6 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.jpg"
            alt={siteConfig.name}
            width={46}
            height={46}
            className="rounded-full object-cover w-9 h-9 md:w-[46px] md:h-[46px]"
          />
          <span className="font-serif text-lg md:text-[22px] tracking-wide">{siteConfig.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${
                pathname === link.href
                  ? "font-semibold text-ink border-b-2 border-gold pb-1"
                  : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-gold hover:bg-gold-dark text-white px-7 py-3 rounded-full text-[13px] tracking-wider uppercase transition-colors"
          >
            Book Now
          </Link>
        </nav>

        <Link
          href="/contact"
          className="md:hidden bg-gold text-white px-4 py-2 rounded-full text-xs tracking-wider uppercase"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
