import { Container } from "./Container";

const COLUMNS = [
  {
    title: "Verified.",
    body: "Every record reconciled across sources. We sweat the parcel-level detail so the answer holds up.",
  },
  {
    title: "Continuous.",
    body: "Atlas runs nightly, watching every market the same way it watched yesterday — so signals don't go cold.",
  },
  {
    title: "Connected.",
    body: "Owners, entities, parcels, capital — stitched into one chain you can follow from cause to consequence.",
  },
];

export function Approach() {
  return (
    <section
      id="approach"
      className="bg-bg-depth py-24 md:py-32"
    >
      <Container>
        <div className="max-w-[760px]">
          <p className="font-serif italic text-[20px] text-ink-muted">
            The approach
          </p>
          <h2 className="mt-4 font-serif text-h2-mobile md:text-h2 text-ink">
            Engineered for what comes next.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-20 md:grid-cols-3 md:gap-10 lg:gap-16">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-serif text-h3 text-ink">{col.title}</h3>
              <p className="mt-4 max-w-[360px] text-body text-ink-muted">
                {col.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
