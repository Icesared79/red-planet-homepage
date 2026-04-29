import { Container } from "./Container";
import { IngestPanel } from "./IngestPanel";

export function Hero() {
  return (
    <section
      id="hero"
      className="bg-bg-base"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <Container className="py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-7">
            <h1 className="text-display-mobile leading-[1.0] md:text-display">
              <span className="block text-fg-primary">Data is everywhere.</span>
              <span className="block text-accent">Intelligence is rare.</span>
            </h1>

            <p className="mt-8 max-w-[540px] text-body-sm text-fg-secondary">
              <span className="text-fg-primary">Atlas</span> is the intelligence
              engine that finds it. Hundreds of millions of verified records on
              properties, owners, infrastructure, and the signals around them
              &mdash; discovered, ingested, and validated by an autonomous
              pipeline that has never needed to be told what to do next.
            </p>

            <div className="mt-10">
              <a
                href="#apply"
                className="inline-flex items-center bg-accent px-6 py-4 font-mono text-eyebrow uppercase text-fg-primary transition-colors hover:bg-accent-dim"
              >
                Apply for Access &rarr;
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 font-mono text-eyebrow uppercase text-fg-muted">
              <span
                aria-hidden="true"
                className="block h-[6px] w-[6px] rounded-full bg-accent animate-pulse-dot"
              />
              <span>Autonomous Pipeline &mdash; Active Now</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <IngestPanel />
          </div>
        </div>
      </Container>
    </section>
  );
}
