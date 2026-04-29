import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { RuleDivider } from "./RuleDivider";

const steps = [
  {
    number: "01",
    title: "It finds the source.",
    description:
      "Atlas watches for new datasets across government portals, regulatory filings, court records, and infrastructure registries. When something new shows up, Atlas finds it.",
    verb: "Discovers",
  },
  {
    number: "02",
    title: "It writes the code.",
    description:
      "Atlas writes the code to pull each new source in — handling the schema, the pagination, the field mapping. No engineer queues up the work.",
    verb: "Ingests",
  },
  {
    number: "03",
    title: "It checks the output.",
    description:
      "Every record gets checked. Anomalies get flagged. Duplicates get reconciled. If it doesn't pass, it doesn't land in the dataset.",
    verb: "Validates",
  },
  {
    number: "04",
    title: "It heals itself.",
    description:
      "When a source breaks or changes format, Atlas notices, figures out what broke, and fixes it — usually before anyone needs to look.",
    verb: "Heals",
  },
];

export function EngineSection() {
  return (
    <section id="engine" className="bg-bg-light">
      <RuleDivider tone="on-light" />
      <Container className="py-16 md:py-24">
        <div className="max-w-[720px]">
          <Eyebrow tone="on-light">How Atlas stays alive</Eyebrow>
          <h2 className="mt-3 text-display-sm-mobile md:text-display-sm text-fg-on-light">
            The data changes. Atlas changes with it.
          </h2>
          <p className="mt-6 text-body text-fg-secondary-on-light">
            Most data vendors sell you a snapshot. The minute they hand it to
            you, it starts going stale. Atlas works differently &mdash; it
            watches for new sources, ingests them on its own, checks its own
            work, and fixes itself when something breaks.
          </p>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          {steps.map((step) => (
            <li key={step.number} className="lg:col-span-3">
              <span className="block font-mono text-[32px] font-medium leading-none text-fg-secondary-on-light tabular-nums mb-4">
                {step.number}
              </span>
              <h3 className="mb-3 text-h3 text-fg-on-light">{step.title}</h3>
              <p className="text-body-sm leading-[1.6] text-fg-secondary-on-light">
                {step.description}
              </p>
              <p className="mt-4 font-mono text-eyebrow uppercase text-accent">
                &rarr; {step.verb}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-20 max-w-[720px]">
          <p className="text-h3 text-fg-on-light">
            This is how Atlas was built from day one.
          </p>
          <p className="mt-3 text-body text-fg-secondary-on-light">
            Strategy is human. Execution is the engine.
          </p>
        </div>
      </Container>
    </section>
  );
}
