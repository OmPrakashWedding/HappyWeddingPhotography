import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="px-6 md:px-16 py-16 md:py-24">
      <div className="max-w-[760px] mx-auto text-center mb-16">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">Our Story</div>
        <h1 className="font-serif text-3xl md:text-5xl mt-3">About Happy Wedding Photography</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[560px] mx-auto mt-5 leading-relaxed">
          We started Happy Wedding Photography with one belief: a wedding film should feel like
          the day itself &mdash; not a performance for the camera. Every couple we work with gets
          the same quiet, observant approach, whether we&apos;re shooting an intimate pre-wedding
          shoot or a three-day celebration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto mb-20">
        <div
          className="aspect-[4/5] rounded"
          style={{ background: "linear-gradient(135deg, #f0dcc0, #d7a978)" }}
        />
        <div
          className="aspect-[4/5] rounded"
          style={{ background: "linear-gradient(135deg, #e7c9b8, #c98f8a)" }}
        />
        <div
          className="aspect-[4/5] rounded"
          style={{ background: "linear-gradient(135deg, #d8ddc4, #a9b18f)" }}
        />
      </div>

      <div className="text-center">
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
