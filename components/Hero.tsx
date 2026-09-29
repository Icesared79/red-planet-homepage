import { RecordsCard } from "@/components/RecordsCard";

type Props = {
  total: number;
  updatedIso: string | null;
};

export function Hero({ total, updatedIso }: Props) {
  return (
    <section id="top" className="rph-hero">
      <div className="rph-hero__copy">
        <div className="rph-kicker rph-kicker--hero">&sect; 01 &mdash; What we do</div>
        <h1 className="rph-h1">Deeper Data Intelligence.</h1>
        <p className="rph-lede">
          Red Planet built Atlas, the autonomous data intelligence engine.
        </p>
        <a href="#engine" className="rph-underline">
          How it works
        </a>
      </div>

      <RecordsCard total={total} updatedIso={updatedIso} />
    </section>
  );
}
