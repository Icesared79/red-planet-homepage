import { LegalFooter } from "@/components/LegalFooter";

/**
 * Pages that do not end on the § 07 band close on the legal footer alone, so
 * it takes the rounded top that band would have carried.
 */
export function Footer() {
  return <LegalFooter standalone />;
}
