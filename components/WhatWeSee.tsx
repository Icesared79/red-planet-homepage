import { Container } from "./Container";

const CARDS = [
  {
    num: "01",
    title: "Distress, before it surfaces.",
    body: "We trace the chain — entity dissolutions, ownership shifts, debt strain, asset neglect — long before it shows up in the headlines.",
  },
  {
    num: "02",
    title: "Movement, before the market.",
    body: "Capital flows, ownership changes, entity formation, lender activity — the signals that precede every transaction.",
  },
  {
    num: "03",
    title: "Possibility, before it's built.",
    body: "Conversion candidates, infrastructure capacity, zoning shifts, demand patterns — the conditions for what comes next.",
  },
];

export function WhatWeSee() {
  return (
    <section id="what-we-see" className="bg-bg-bone py-24 md:py-32">
      <Container>
        <div className="max-w-[760px]">
          <p className="font-serif italic text-[20px] text-ink-muted">
            What we see
          </p>
          <h2 className="mt-4 font-serif text-h2-mobile md:text-h2 text-ink">
            The signals that precede every property decision.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-12">
          {CARDS.map((card) => (
            <article key={card.num} className="flex flex-col">
              <span className="font-serif text-[15px] text-accent">
                — {card.num}
              </span>
              <h3 className="mt-5 font-serif text-h3 text-ink">
                {card.title}
              </h3>
              <p className="mt-4 text-body text-ink-muted">{card.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
