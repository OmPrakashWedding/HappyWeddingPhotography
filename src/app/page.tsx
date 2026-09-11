import Link from "next/link";
import { GoogleRatingBadge } from "@/components/GoogleRatingBadge";
import { StarIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site-config";
import { getFolderImages } from "@/lib/googleDrive";

export const revalidate = 300;

const featuredWork = [
  { span: "md:col-span-2", from: "#f0dcc0", to: "#d7a978" },
  { span: "", from: "#e7c9b8", to: "#c98f8a" },
  { span: "", from: "#d8ddc4", to: "#a9b18f" },
];

const services = [
  {
    title: "Photography",
    body: "Candid, editorial and portrait coverage across the full wedding timeline.",
  },
  {
    title: "Videography",
    body: "Multi-camera coverage of ceremony, reception and every in-between moment.",
  },
  {
    title: "Cinematic Films",
    body: "Story-led wedding films scored and edited like a short feature.",
  },
];

const instaTiles = ["#e9d3b0,#c99a72", "#e7c9b8,#c98f8a", "#d8ddc4,#a9b18f", "#f0dcc0,#d7a978", "#e3cfae,#b98b4e"];

export default async function HomePage() {
  // Both the hero photo and the Featured Work tiles pull from the same Drive
  // folder used by About's Section 2/gallery — a shared photo pool, fixed
  // pick per slot (not re-randomized per visit), same pattern as the rest
  // of the site. Falls back to the original gradients wherever a slot
  // doesn't have a real photo yet.
  const pool = await getFolderImages(process.env.GOOGLE_DRIVE_FOLDER_ABOUT_STORY ?? "");
  const heroPhoto = pool[0];
  const featuredPhotos = pool.slice(1, 4);

  return (
    <div>
      {/* HERO */}
      <div className="mx-6 md:mx-16 mt-8 md:mt-12 rounded-md overflow-hidden relative h-[420px] md:h-[660px] shadow-[0_18px_40px_-18px_rgba(80,60,30,0.28)]">
        {heroPhoto ? (
          <img
            src={heroPhoto.url}
            alt={heroPhoto.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(120deg, #e9d3b0 0%, #dcb98c 45%, #c99a72 100%)" }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(120,80,40,0.25), transparent 50%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 bg-gradient-to-t from-black/55 to-transparent">
          <div className="text-cream-2 text-[11px] md:text-xs tracking-[0.28em] uppercase mb-3">
            Wedding &middot; Pre-Wedding &middot; Films
          </div>
          <h1 className="font-serif text-white text-4xl md:text-6xl leading-[1.05] max-w-[680px]">
            Timeless stories, beautifully told.
          </h1>
          <p className="text-cream-2 text-sm md:text-base max-w-[520px] my-5 font-light">
            Wedding photography, videography &amp; cinematography for couples who want their day
            remembered exactly as it felt.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* INTRO */}
      <div className="max-w-[760px] mx-auto mt-20 md:mt-32 text-center px-6">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Our Philosophy</div>
        <h2 className="font-serif text-2xl md:text-[34px] leading-[1.4] mt-3.5">
          We photograph the quiet glances, not just the poses &mdash; so your wedding film feels
          like the day itself.
        </h2>
      </div>

      {/* FEATURED WORK */}
      <div className="mt-16 md:mt-24 px-6 md:px-16">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-serif text-2xl md:text-[30px]">Featured Work</h2>
          <Link href="/portfolio" className="text-xs tracking-wider uppercase">
            View Portfolio &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {featuredWork.map((tile, i) => {
            const photo = featuredPhotos[i];
            return photo ? (
              <img
                key={i}
                src={photo.url}
                alt={photo.name}
                className={`w-full h-64 md:h-[420px] rounded object-cover ${tile.span}`}
              />
            ) : (
              <div
                key={i}
                className={`h-64 md:h-[420px] rounded ${tile.span}`}
                style={{ background: `linear-gradient(135deg, ${tile.from}, ${tile.to})` }}
              />
            );
          })}
        </div>
      </div>

      {/* SERVICES TEASER */}
      <div className="mt-20 md:mt-32 px-6 md:px-16 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">What We Offer</div>
        <h2 className="font-serif text-2xl md:text-[32px] mt-3 mb-10">
          Photography, Films &amp; Cinematic Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 text-left">
          {services.map((s) => (
            <div key={s.title} className="bg-card border border-line rounded-md p-9">
              <div className="w-11 h-11 rounded-full bg-cream-3 mb-5" />
              <h3 className="font-serif text-xl md:text-[22px] mb-2.5">{s.title}</h3>
              <p className="text-sm text-ink-soft font-light leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="mt-24 md:mt-32 py-16 md:py-20 px-6 md:px-16 bg-cream-3">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="mb-6">
            <GoogleRatingBadge />
          </div>
          <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Kind Words</div>
          <p className="font-serif italic text-xl md:text-[28px] leading-[1.5] my-5">
            &ldquo;They didn&apos;t just capture our wedding &mdash; they captured how it felt to
            be there.&rdquo;
          </p>
          <div className="text-xs tracking-wider uppercase text-gold-dark">
            Priya &amp; Arjun &middot; Udaipur
          </div>
          <div className="flex justify-center gap-0.5 mt-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={14} />
            ))}
          </div>
        </div>
      </div>

      {/* INSTAGRAM TEASER */}
      <div className="mt-16 md:mt-24 px-6 md:px-16 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Follow the Studio</div>
        <a
          href={siteConfig.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-serif text-xl md:text-[28px] my-3 mb-8 text-ink hover:text-gold-dark"
        >
          @{siteConfig.instagramHandle}
        </a>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3.5">
          {instaTiles.map((grad, i) => (
            <div
              key={i}
              className="aspect-square rounded"
              style={{ background: `linear-gradient(160deg, ${grad})` }}
            />
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="mt-20 md:mt-32 mx-6 md:mx-16 rounded-md p-10 md:p-16 text-center bg-gradient-to-br from-ink to-[#5a4a38]">
        <h2 className="font-serif text-white text-2xl md:text-[32px] mb-4">
          Have a date in mind?
        </h2>
        <p className="text-cream-3 font-light mb-7">
          Tell us about your celebration and we&apos;ll check availability.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-colors"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
