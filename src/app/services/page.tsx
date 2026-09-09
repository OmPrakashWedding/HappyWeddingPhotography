import Link from "next/link";

const packages = [
  {
    category: "Photography",
    tiers: [
      { name: "Essential", detail: "1 photographer, 6 hours, edited digital gallery" },
      { name: "Signature", detail: "2 photographers, full-day, premium album" },
      { name: "Heritage", detail: "2 photographers, multi-day, album + prints" },
    ],
  },
  {
    category: "Videography",
    tiers: [
      { name: "Essential", detail: "1 videographer, highlight reel (3-5 min)" },
      { name: "Signature", detail: "2 videographers, full ceremony + highlight film" },
      { name: "Heritage", detail: "Multi-camera, drone, full-length + highlight film" },
    ],
  },
  {
    category: "Cinematic Films",
    tiers: [
      { name: "Essential", detail: "Story-led short film, licensed score" },
      { name: "Signature", detail: "Cinematic feature-style film, interviews" },
      { name: "Heritage", detail: "Full documentary-style coverage, multi-day" },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="px-6 md:px-16 py-16 md:py-24">
      <div className="text-center mb-16">
        <div className="text-xs tracking-[0.22em] uppercase text-gold-dark">What We Offer</div>
        <h1 className="font-serif text-3xl md:text-5xl mt-3">Services &amp; Packages</h1>
        <p className="text-sm md:text-base text-ink-soft font-light max-w-[520px] mx-auto mt-5">
          Every package is tailored to your celebration &mdash; exact rates confirmed once we
          know your date and location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
        {packages.map((pkg) => (
          <div key={pkg.category} className="bg-card border border-line rounded-md p-8">
            <h2 className="font-serif text-2xl mb-6">{pkg.category}</h2>
            <div className="flex flex-col gap-5">
              {pkg.tiers.map((tier) => (
                <div key={tier.name} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <div className="text-sm font-medium tracking-wide uppercase text-gold-dark mb-1">
                    {tier.name}
                  </div>
                  <p className="text-sm text-ink-soft font-light leading-relaxed">{tier.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <Link
          href="/contact"
          className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full text-sm tracking-widest uppercase transition-colors"
        >
          Get a Custom Quote
        </Link>
      </div>
    </div>
  );
}
