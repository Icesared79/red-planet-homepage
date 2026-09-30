import { LegalFooter } from "@/components/LegalFooter";

/**
 * The homepage carries its legal block inside the § 07 closing band
 * (components/GetInTouch.tsx). This is the same block as a standalone band,
 * for pages that do not end on that section.
 */
export function Footer() {
  return (
    <section className="rph-contact">
      <LegalFooter topRule={false} />
    </section>
  );
}
