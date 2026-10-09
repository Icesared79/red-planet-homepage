import { RecordsCard } from "@/components/RecordsCard";

type Props = {
  recordsHeld: number;
  live: number;
  archived: number;
  lastNightNew: number | null;
  countTakenAt: string | null;
  relInitial: string;
  history: { day: string; total: number }[];
};

export function Hero({
  recordsHeld,
  live,
  archived,
  lastNightNew,
  countTakenAt,
  relInitial,
  history,
}: Props) {
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

      <RecordsCard
        recordsHeld={recordsHeld}
        live={live}
        archived={archived}
        lastNightNew={lastNightNew}
        countTakenAt={countTakenAt}
        relInitial={relInitial}
        history={history}
      />
    </section>
  );
}
