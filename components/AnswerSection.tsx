import { AnswerCard } from "./AnswerCard";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { RuleDivider } from "./RuleDivider";

const cards = [
  {
    audience: "For solar installers",
    question:
      "Which homes in this ZIP have south-facing roofs, no existing solar, and owners who've been there 5+ years?",
    stats: [
      { label: "matched", value: "1,847 properties" },
      {
        label: "filtered",
        value: "south-facing · no PV permits · owner tenure ≥ 5y",
      },
      { label: "updated", value: "nightly" },
    ],
    sourcedFrom:
      "Parcels · Building footprints · Permits · Ownership history",
  },
  {
    audience: "For lenders",
    question:
      "Which CMBS borrowers are showing distress signals before the watchlist catches them?",
    stats: [
      { label: "flagged", value: "342 borrowers" },
      {
        label: "signals",
        value: "DSCR decline · vacancy rise · LLC dissolution",
      },
      {
        label: "lead time",
        value: "47 days avg before official watchlist",
      },
    ],
    sourcedFrom:
      "CMBS performance · SOS filings · Tenant rolls · Property tax",
  },
  {
    audience: "For infrastructure funds",
    question:
      "Which parcels have grid capacity, water access, and zoning to host a 50MW data center?",
    stats: [
      { label: "qualified", value: "213 parcels" },
      {
        label: "criteria",
        value: "substation < 2mi · water rights · M-2 zoning",
      },
      { label: "states", value: "across 14 states" },
    ],
    sourcedFrom:
      "Parcels · FERC queue · Water rights · Zoning · Transmission",
  },
];

export function AnswerSection() {
  return (
    <section id="answers" className="bg-bg-base">
      <RuleDivider />
      <Container className="py-16 md:py-24">
        <Eyebrow>What Atlas can answer</Eyebrow>
        <h2 className="mt-3 text-display-sm-mobile md:text-display-sm text-fg-primary">
          Three questions. Different industries. One engine.
        </h2>
        <p className="mt-6 max-w-[640px] text-body text-fg-secondary">
          Atlas isn&apos;t built for one vertical. It&apos;s built to answer
          questions about places &mdash; properties, owners, infrastructure,
          signals &mdash; wherever those questions come from. Here are three
          real examples.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {cards.map((card) => (
            <div key={card.audience} className="lg:col-span-4">
              <AnswerCard {...card} />
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-body-sm text-fg-muted">
          Three of thousands of questions Atlas can answer.{" "}
          <a
            href="#apply"
            className="text-fg-primary no-underline transition-all duration-200 hover:underline"
          >
            Tell us yours.
          </a>
        </p>
      </Container>
    </section>
  );
}
