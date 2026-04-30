import Image from "next/image";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";

export function Hero() {
  return (
    <section className="bg-bg-bone">
      <Container className="grid min-h-[calc(100vh-80px)] grid-cols-1 items-center gap-12 py-16 md:grid-cols-12 md:gap-16 md:py-24">
        <div className="md:col-span-7">
          <Eyebrow as="p">Property intelligence · Engineered</Eyebrow>

          <h1 className="mt-8 font-serif text-display-mobile md:text-display text-ink">
            Every property has a story.{" "}
            <em className="italic text-ink-soft">
              We tell you what it means.
            </em>
          </h1>

          <p className="mt-8 max-w-[560px] text-body-lg text-ink-muted">
            Atlas is the engine beneath the work — verified records, continuous
            signals, every American market — built to power whatever you need to
            see, build, or decide.
          </p>

          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <a
              href="#contact"
              className="inline-flex items-center rounded-full bg-ink px-7 py-3.5 font-sans text-[15px] font-medium text-ink-oncream transition-opacity hover:opacity-90"
            >
              Start the conversation
            </a>
            <a
              href="#engine"
              className="inline-flex items-center rounded-full border border-ink/15 px-7 py-3.5 font-sans text-[15px] font-medium text-ink transition-colors hover:border-ink/40"
            >
              Explore the engine
            </a>
          </div>
        </div>

        <div className="md:col-span-5">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "4 / 5" }}
          >
            <Image
              src="/images/hero.jpg"
              alt="Light raking across a modernist facade"
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
              style={{ filter: "saturate(0.85) contrast(1.02)" }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
