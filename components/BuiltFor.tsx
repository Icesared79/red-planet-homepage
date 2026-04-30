import { Container } from "./Container";

const ROWS = [
  {
    num: "01",
    title: "Capital allocators",
    body: "Investors, opportunity funds, family offices — the people deploying capital into property.",
  },
  {
    num: "02",
    title: "Lenders and advisors",
    body: "Banks, consultants, attorneys — the people guiding decisions and underwriting risk.",
  },
  {
    num: "03",
    title: "Developers and operators",
    body: "Owners, conversion specialists, asset managers — the people changing what a building can become.",
  },
];

export function BuiltFor() {
  return (
    <section id="engine" className="bg-bg-bone py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-20">
          <div className="md:col-span-5">
            <p className="font-serif italic text-[20px] text-ink-muted">
              Built for
            </p>
            <h2 className="mt-4 font-serif text-h2-mobile md:text-h2 text-ink">
              Whatever you're building, we can power it.
            </h2>
            <p className="mt-8 max-w-[440px] text-body-lg text-ink-muted">
              Atlas is purpose-agnostic. Bring us the question — we have the
              data behind the answer.
            </p>
          </div>

          <div className="md:col-span-7">
            <ul className="flex flex-col">
              {ROWS.map((row, idx) => (
                <li
                  key={row.num}
                  className={`grid grid-cols-12 gap-6 py-8 md:py-10 ${
                    idx === 0 ? "" : "border-t border-rule"
                  }`}
                >
                  <span className="col-span-2 font-serif text-[18px] text-accent md:col-span-1">
                    — {row.num}
                  </span>
                  <div className="col-span-10 md:col-span-11">
                    <h3 className="font-serif text-h3 text-ink">{row.title}</h3>
                    <p className="mt-3 text-body text-ink-muted">{row.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
