import { Container } from "./Container";
import { SectionImage } from "./SectionImage";

const HERO_IMAGE_SRC =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2400&auto=format&fit=crop";

export function Hero() {
  return (
    <section className="bg-bg-base">
      <Container className="flex min-h-[calc(100vh-80px)] flex-col justify-between py-16 md:py-20">
        <div className="max-w-[1100px]">
          <h1 className="font-sans text-display-mobile md:text-display text-fg-primary">
            <span className="block">Data is everywhere.</span>
            <span className="block">
              <em className="font-serif font-normal italic text-display-italic-mobile md:text-display-italic">
                Intelligence
              </em>{" "}
              is rare.
            </span>
          </h1>
          <p className="mt-10 max-w-[580px] text-body-lg text-fg-secondary">
            <span className="text-fg-primary">Atlas</span> is the engine that
            finds it. It pulls in property records, ownership chains,
            infrastructure data, and the signals around them &mdash;
            automatically, every night, without anyone telling it what to do.
            Hundreds of millions of records and growing.
          </p>
          <div className="mt-12 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-6">
            <a
              href="#apply"
              className="inline-flex items-center bg-fg-primary px-8 py-4 text-[16px] font-medium text-bg-base transition-colors duration-200 hover:bg-accent"
            >
              Apply for Access
            </a>
            <a
              href="#surface"
              className="text-body text-fg-secondary transition-colors hover:text-fg-primary"
            >
              See what Atlas can answer &rarr;
            </a>
          </div>
        </div>
        <div className="mt-16">
          <SectionImage
            src={HERO_IMAGE_SRC}
            alt="Light raking across a building facade"
            aspectRatio="21 / 9"
            treatment="atmospheric"
            priority
            sizes="(min-width: 1280px) 1200px, 100vw"
          />
        </div>
      </Container>
    </section>
  );
}
