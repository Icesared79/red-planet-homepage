import { Container } from "./Container";

export function ThesisBar() {
  return (
    <section style={{ backgroundColor: "#EFE8DA" }} className="py-20 md:py-28">
      <Container>
        <p className="mx-auto max-w-[860px] text-center font-serif italic text-thesis-mobile md:text-thesis text-ink-soft">
          We are not a listing service. We are not a SaaS product. We are the
          intelligence engine beneath every property decision worth making.
        </p>
      </Container>
    </section>
  );
}
