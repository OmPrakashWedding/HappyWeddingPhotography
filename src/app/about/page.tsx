import Link from "next/link";
import Image from "next/image";
import { getAboutImages } from "@/lib/about";

export const revalidate = 300;

const GALLERY_PLACEHOLDERS = [
  "#e7c9b8,#c98f8a",
  "#d8ddc4,#a9b18f",
  "#f0dcc0,#d7a978",
];

export default async function AboutPage() {
  const { ownerPhoto, storyPhoto, galleryPhotos } = await getAboutImages();

  return (
    <div>
      {/* SECTION 1 — Owner spotlight */}
      <div className="px-6 md:px-16 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-10 md:gap-16 items-center max-w-[1200px] mx-auto">
          {ownerPhoto ? (
            <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden shadow-[0_24px_50px_-20px_rgba(80,60,30,0.35)]">
              <Image
                src={ownerPhoto.url}
                alt={ownerPhoto.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-left"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[4/5] rounded-md"
              style={{ background: "linear-gradient(135deg, #f0dcc0, #d7a978)" }}
            />
          )}
          <div>
            <div className="text-xs tracking-[0.22em] uppercase text-gold-dark mb-4">
              Meet Your Photographer
            </div>
            <h1 className="font-serif text-3xl md:text-[42px] leading-tight mb-6">
              Hi, I&rsquo;m Om Prakash.
            </h1>
            <p className="text-base md:text-[17px] leading-relaxed text-ink-soft font-light max-w-[560px]">
              I&rsquo;m the lead photographer behind Happy Wedding Photography. Over the years
              I&rsquo;ve stood behind the lens at some of the most meaningful moments in
              people&rsquo;s lives &mdash; quiet, golden-hour pre-wedding shoots, grand wedding
              celebrations, corporate gatherings, and the fast-moving energy of political events.
            </p>
            <p className="text-base md:text-[17px] leading-relaxed text-ink-soft font-light max-w-[560px] mt-5">
              Every kind of shoot teaches me something different &mdash; patience, precision,
              timing. But what I chase in all of them is the same thing: the moment someone stops
              noticing the camera. My dream has always been simple &mdash; to capture people
              exactly as they are, so a photograph doesn&rsquo;t just show how they looked, but
              how they felt.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Why Happy Wedding Photography (reversed) */}
      <div className="bg-cream-3 px-6 md:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-10 md:gap-16 items-center max-w-[1200px] mx-auto">
          <div className="md:order-1 order-2">
            <div className="text-xs tracking-[0.22em] uppercase text-gold-dark mb-4">
              Why Happy Wedding Photography
            </div>
            <h2 className="font-serif text-2xl md:text-[36px] leading-tight mb-6">
              The moment right after &ldquo;yes.&rdquo;
            </h2>
            <p className="text-base md:text-[17px] leading-relaxed text-ink-soft font-light max-w-[560px]">
              There&rsquo;s a moment I chase at every wedding &mdash; not the vows, not the posed
              portraits, but the instant right after, when it hits a couple that it&rsquo;s real.
              That moment is what first drew me into wedding photography, and it&rsquo;s what
              eventually became Happy Wedding Photography.
            </p>
            <p className="text-base md:text-[17px] leading-relaxed text-ink-soft font-light max-w-[560px] mt-5">
              It&rsquo;s the belief that a family&rsquo;s happiness, captured honestly, becomes
              something they keep forever &mdash; not a performance for the camera, but proof the
              day was exactly as good as it felt.
            </p>
          </div>
          {storyPhoto ? (
            <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden shadow-[0_24px_50px_-20px_rgba(80,60,30,0.3)] md:order-2 order-1">
              <Image
                src={storyPhoto.url}
                alt={storyPhoto.name}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[4/5] rounded-md md:order-2 order-1"
              style={{ background: "linear-gradient(135deg, #e7c9b8, #c98f8a)" }}
            />
          )}
        </div>
      </div>

      {/* SECTION 3 — Gallery */}
      <div className="px-6 md:px-16 py-16 md:py-24 text-center">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark mb-3">
          Moments We Love
        </div>
        <h2 className="font-serif text-2xl md:text-[32px] mb-10 md:mb-12">A Few Favourites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {galleryPhotos.length > 0
            ? galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative w-full aspect-[4/5] rounded-md overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))
            : GALLERY_PLACEHOLDERS.map((grad, i) => (
                <div
                  key={i}
                  className="w-full aspect-[4/5] rounded-md"
                  style={{ background: `linear-gradient(135deg, ${grad})` }}
                />
              ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-6 md:mx-16 mb-20 md:mb-24 rounded-md p-10 md:p-16 text-center bg-gradient-to-br from-ink to-[#5a4a38]">
        <h2 className="font-serif text-white text-2xl md:text-[30px] mb-5">
          Let&rsquo;s tell your story next.
        </h2>
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
