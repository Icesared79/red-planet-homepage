import { Container } from "./Container";
import { Wordmark } from "./Wordmark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-16 md:h-[72px] bg-bg-base/80 backdrop-blur">
      <Container className="flex h-full items-center justify-between">
        <a href="#top" aria-label="Red Planet Data home">
          <Wordmark />
        </a>
        <a
          href="#apply"
          className="border border-rule px-4 py-2 font-mono text-eyebrow uppercase text-fg-primary transition-colors hover:bg-accent hover:border-accent"
        >
          Apply for Access &rarr;
        </a>
      </Container>
    </header>
  );
}
