import Image from "next/image";

/**
 * The decorative artwork (flowers/watercolor framing, zero text) was
 * generated in Canva and exported as a static panoramic asset — see
 * Documents/ for how it was made if it ever needs regenerating. The couple
 * names are never part of that image: they're real text, rendered here,
 * sourced from the Drive-backed `names` prop (ultimately from the client's
 * Couples/ folder naming — see src/lib/couples.ts) and never hard-coded.
 */
export function CoupleNameBanner({ names }: { names: string }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[900px] h-[110px] sm:h-[150px] md:h-[180px] lg:h-[210px] mb-6 md:mb-8 rounded-md overflow-hidden"
      style={{ backgroundColor: "#faf7ef" }}
    >
      <Image
        src="/images/wedding-banner-background.png"
        alt=""
        fill
        priority={false}
        sizes="(max-width: 900px) 100vw, 900px"
        className="object-contain"
      />
      <div className="absolute inset-0 flex items-center justify-center px-[12%]">
        <div
          className="font-script leading-none text-center w-full"
          style={{
            color: "#8f6a34",
            fontSize: "clamp(1.5rem, 5vw, 3.75rem)",
            textShadow: "0 2px 12px rgba(255,250,241,0.65)",
          }}
        >
          {names}
        </div>
      </div>
    </div>
  );
}
