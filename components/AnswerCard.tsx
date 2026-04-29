import { Eyebrow } from "./Eyebrow";

type StatLine = {
  label: string;
  value: string;
};

type AnswerCardProps = {
  audience: string;
  question: string;
  stats: StatLine[];
  sourcedFrom: string;
};

export function AnswerCard({
  audience,
  question,
  stats,
  sourcedFrom,
}: AnswerCardProps) {
  return (
    <article className="flex h-full min-h-[380px] flex-col rounded-[4px] border border-rule bg-bg-elevated p-8 transition-colors duration-200 hover:border-accent-dim">
      <div className="mb-6 flex items-center justify-between">
        <Eyebrow>{audience}</Eyebrow>
        <span className="font-mono text-eyebrow uppercase text-fg-muted">
          Query
        </span>
      </div>

      <h3 className="text-h3 text-fg-primary">{question}</h3>

      <div className="mt-6 rounded-[4px] border border-rule bg-bg-base p-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 font-mono text-mono-sm">
          {stats.map((s) => (
            <div key={s.label} className="contents">
              <dt className="text-fg-muted">{s.label}</dt>
              <dd className="tabular-nums text-fg-primary">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-auto pt-6 font-mono text-eyebrow uppercase text-fg-muted">
        Sourced from {sourcedFrom}
      </div>
    </article>
  );
}
