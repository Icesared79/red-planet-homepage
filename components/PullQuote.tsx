import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";

export function PullQuote() {
  return (
    <section className="bg-bg-dark py-24 md:py-32">
      <Container>
        <p className="mx-auto max-w-[920px] text-center font-serif text-quote-mobile md:text-quote text-ink-oncream">
          Depth over breadth. Truth over volume. Continuity over snapshots.
        </p>
        <div className="mt-10 text-center">
          <Eyebrow tone="oncream">The Red Planet thesis</Eyebrow>
        </div>
      </Container>
    </section>
  );
}
