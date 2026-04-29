import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { RuleDivider } from "./RuleDivider";

function RequestBlock() {
  return (
    <pre className="overflow-x-auto whitespace-pre font-mono text-mono-sm leading-[1.6]">
      <code>
        <span className="text-fg-muted"># Query CMBS distress signals — Manhattan</span>
        {"\n"}
        <span className="text-fg-primary">curl</span>{" "}
        <span className="text-accent">https://api.redplanetdata.com/v1/signals</span>{" "}
        <span className="text-fg-muted">{"\\"}</span>
        {"\n  "}
        <span className="text-fg-secondary">-H</span>{" "}
        <span className="text-fg-primary">{"\"Authorization: Bearer rp_live_...\""}</span>
      </code>
    </pre>
  );
}

const inlineSources = [
  "cmbs_remit",
  "ny_acris",
  "nyc_pluto",
  "ny_sos",
  "fdic_call_reports",
  "treasury_curve",
  "+6 more",
];

function Brace({ children }: { children: string }) {
  return <span className="text-fg-muted">{children}</span>;
}

function Key({ name }: { name: string }) {
  return (
    <>
      <span className="text-fg-muted">{"\""}</span>
      <span className="text-fg-secondary">{name}</span>
      <span className="text-fg-muted">{"\""}</span>
    </>
  );
}

function StringVal({
  value,
  status = false,
}: {
  value: string;
  status?: boolean;
}) {
  return (
    <>
      <span className="text-fg-muted">{"\""}</span>
      <span className={status ? "text-accent" : "text-fg-primary"}>
        {value}
      </span>
      <span className="text-fg-muted">{"\""}</span>
    </>
  );
}

function NumVal({ value }: { value: string }) {
  return <span className="text-accent tabular-nums">{value}</span>;
}

function ResponseBlock() {
  return (
    <pre className="overflow-x-auto whitespace-pre font-mono text-mono-sm leading-[1.6]">
      <code>
        <Brace>{"{"}</Brace>
        {"\n  "}
        <Key name="data" />
        <Brace>{": [{"}</Brace>
        {"\n    "}
        <Key name="address" />
        <Brace>{":      "}</Brace>
        <StringVal value="535 Madison Ave, New York NY" />
        <Brace>{","}</Brace>
        {"\n    "}
        <Key name="owner" />
        <Brace>{":        "}</Brace>
        <StringVal value="535 Madison PropCo LLC" />
        <Brace>{","}</Brace>
        {"\n    "}
        <Key name="balance" />
        <Brace>{":      "}</Brace>
        <StringVal value="$47,200,000" />
        <Brace>{","}</Brace>
        {"\n    "}
        <Key name="signal" />
        <Brace>{":       "}</Brace>
        <StringVal value="CRITICAL" status />
        {"\n  "}
        <Brace>{"}],"}</Brace>
        {"\n  "}
        <Key name="meta" />
        <Brace>{": {"}</Brace>
        {"\n    "}
        <Key name="returned" />
        <Brace>{":     "}</Brace>
        <NumVal value="847" />
        <Brace>{","}</Brace>
        {"\n    "}
        <Key name="sources_used" />
        <Brace>{": "}</Brace>
        <NumVal value="12" />
        <Brace>{","}</Brace>
        {"\n    "}
        <Key name="sources" />
        <Brace>{":      ["}</Brace>
        {inlineSources.map((src, i) => (
          <span key={src}>
            <StringVal value={src} />
            {i < inlineSources.length - 1 ? <Brace>{", "}</Brace> : null}
          </span>
        ))}
        <Brace>{"]"}</Brace>
        {"\n  "}
        <Brace>{"}"}</Brace>
        {"\n"}
        <Brace>{"}"}</Brace>
      </code>
    </pre>
  );
}

export function ApiArtifactSection() {
  return (
    <section id="api-artifact" className="bg-bg-elevated">
      <RuleDivider />
      <Container className="py-16 md:py-24">
        <div className="max-w-[720px]">
          <Eyebrow>One call &middot; Multiple sources</Eyebrow>
          <h2 className="mt-3 text-display-sm-mobile md:text-display-sm text-fg-primary">
            One question. Twelve sources. One answer.
          </h2>
          <p className="mt-6 text-body text-fg-secondary">
            You ask Atlas a question. It figures out which sources have the
            answer, reconciles them, and returns one clean result. The example
            below pulled from twelve sources to answer one query.
          </p>
        </div>

        <div className="mt-12 rounded-[4px] border border-rule bg-bg-base p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-rule pb-4">
            <span className="font-mono text-eyebrow uppercase text-fg-secondary">
              atlas-query.sh
            </span>
            <span className="font-mono text-eyebrow uppercase text-fg-muted">
              Live example
            </span>
          </div>

          <RequestBlock />

          <div className="mt-8 h-px w-full bg-rule" />

          <div className="mt-6 mb-4 overflow-x-auto whitespace-pre font-mono text-eyebrow uppercase text-fg-muted">
            ── RESPONSE ──────────────────────────────────────────
          </div>

          <ResponseBlock />
        </div>

        <p className="mt-12 max-w-[720px] text-body-sm text-fg-muted">
          An analyst could put this together in about a week. Atlas does it in
          under a second.
        </p>
      </Container>
    </section>
  );
}
