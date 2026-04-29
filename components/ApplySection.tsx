import { ApplicationForm } from "./ApplicationForm";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { RuleDivider } from "./RuleDivider";

const features = [
  "No contracts",
  "No licenses",
  "API keys generated within 24 hours",
];

export function ApplySection() {
  return (
    <section id="apply" className="bg-bg-base">
      <RuleDivider />
      <Container className="py-20 md:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-5">
            <Eyebrow>Get access</Eyebrow>
            <h2 className="mt-3 text-display-sm-mobile leading-[1.05] md:text-display-sm">
              <span className="block text-fg-primary">Tell us what you&apos;re</span>
              <span className="block text-accent">trying to figure out.</span>
            </h2>
            <p className="mt-8 max-w-[460px] text-body text-fg-secondary">
              Atlas access is gated. We review every application. If the data
              is in Atlas, we&apos;ll get you wired up within 24 hours. If it
              isn&apos;t yet, we&apos;ll tell you when it will be.
            </p>
            <ul className="mt-12 flex flex-col gap-3">
              {features.map((feature) => (
                <li key={feature}>
                  <Eyebrow>{feature}</Eyebrow>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <ApplicationForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
