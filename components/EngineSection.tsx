import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { RuleDivider } from "./RuleDivider";

const steps = [
  {
    number: "01",
    title: "It finds the source.",
    description:
      "Atlas scans for new datasets continuously — government portals, regulatory filings, court records, infrastructure registries. When something new is published, Atlas knows about it before most analysts do.",
    verb: "Discovers",
  },
  {
    number: "02",
    title: "It writes the code.",
    description:
      "For each new source, Atlas generates the ingestion logic — parsing schemas, handling pagination, normalizing fields. No engineer assigned, no ticket queued. The pipeline grows itself.",
    verb: "Ingests",
  },
  {
    number: "03",
    title: "It checks the output.",
    description:
      "Every ingested record is validated against schema, range, and consistency rules. Anomalies are flagged. Duplicates are reconciled. Data that doesn't pass doesn't land.",
    verb: "Validates",
  },
  {
    number: "04",
    title: "It heals itself.",
    description:
      "When a source changes its format or goes down, Atlas detects the failure, diagnoses the cause, and patches the ingestion logic — usually before anyone notices. Three checks a day, every day.",
    verb: "Heals",
  },
];

export function EngineSection() {
  return (
    <section id="engine" className="bg-bg-base">
      <RuleDivider />
      <Container className="py-16 md:py-24">
        <div className="max-w-[720px]">
          <Eyebrow>How Atlas stays alive</Eyebrow>
          <h2 className="mt-3 text-display-sm-mobile md:text-display-sm text-fg-primary">
            The data is never the same twice.
          </h2>
          <p className="mt-6 text-body text-fg-secondary">
            Most data vendors sell you a snapshot. Atlas runs an autonomous
            pipeline that finds new sources, writes its own ingestion code,
            validates output, and heals itself when something breaks. Every
            night. Without being told to.
          </p>
        </div>

        <ol className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
          {steps.map((step) => (
            <li key={step.number} className="lg:col-span-3">
              <span className="block font-mono text-[32px] font-medium leading-none text-fg-muted tabular-nums mb-4">
                {step.number}
              </span>
              <h3 className="mb-3 text-h3 text-fg-primary">{step.title}</h3>
              <p className="text-body-sm leading-[1.6] text-fg-secondary">
                {step.description}
              </p>
              <p className="mt-4 font-mono text-eyebrow uppercase text-accent">
                &rarr; {step.verb}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-20 max-w-[720px]">
          <p className="text-h3 text-fg-primary">
            This isn&apos;t a feature. It&apos;s the architecture.
          </p>
          <p className="mt-4 text-body-sm text-fg-secondary">
            Atlas was built from the start to run without human bottlenecks.
            The team directs strategy. The engine handles execution.
          </p>
        </div>
      </Container>
    </section>
  );
}
