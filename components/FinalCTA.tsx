import { Container } from "./Container";

export function FinalCTA() {
  return (
    <section id="contact" className="bg-bg-bone py-28 md:py-40">
      <Container>
        <div className="mx-auto max-w-[780px] text-center">
          <h2 className="font-serif text-h2-mobile md:text-h2 text-ink">
            Tell us what you need to know.
          </h2>
          <p className="mt-8 text-body-lg text-ink-muted">
            Whether you're underwriting a deal, shaping a thesis, or building
            something entirely new — we'll show you what Atlas can do.
          </p>
          <div className="mt-12">
            <a
              href="mailto:hello@redplanetdata.com?subject=Start%20the%20conversation"
              className="inline-flex items-center rounded-full bg-ink px-8 py-4 font-sans text-[15px] font-medium text-ink-oncream transition-opacity hover:opacity-90"
            >
              Start the conversation
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
