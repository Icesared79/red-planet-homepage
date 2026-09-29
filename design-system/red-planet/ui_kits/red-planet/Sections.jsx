const g = () => window.DS;
const Col = ({ children, cols = '1.15fr 1fr', gap = 64, align = 'start', style }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap, alignItems: align, ...style }}>{children}</div>;

function Hero() {
  const { Eyebrow, Metric, TrendChart, Card, Button } = g();
  const series = [20, 20, 21, 21, 21, 22, 22, 22, 22, 23, 23, 23, 24, 24, 31, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 40, 41, 43];
  return (
    <section id="top" style={{ padding: '72px var(--page-gutter) 120px', maxWidth: 'calc(var(--page-max) + 2 * var(--page-gutter))', margin: '0 auto' }}>
      <Col align="center">
        <div style={{ display: 'grid', gap: 32 }}>
          <Eyebrow index={1}>What we do</Eyebrow>
          <h1 className="rp-display-xl">Deeper Data Intelligence.</h1>
          <p className="rp-body-l" style={{ maxWidth: 440 }}>Red Planet built Atlas, the autonomous data intelligence engine.</p>
          <div><Button variant="link" href="#how">How it works</Button></div>
        </div>
        <Card tone="sunken" style={{ display: 'grid', gap: 22 }}>
          <Metric size="xl" status={<span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flex: 'none' }} />} label="Verified property and data records:" aside="9 hours ago" value="502,392,645" meta="+275.5M archived · 777.9M all-time" />
          <TrendChart title="Last 30 days" values={series} step startLabel="Aug 27" endLabel="Sep 26" height={84} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
            <span className="rp-small">Latest Update:</span><span className="rp-figure-s" style={{ color: 'var(--positive)' }}>+424,968</span>
          </div>
        </Card>
      </Col>
    </section>
  );
}

function MissionControl() {
  const { Section, Eyebrow, RunChart, Metric } = g();
  return (
    <Section tone="forest" id="atlas">
      <div style={{ display: 'grid', gap: 20, maxWidth: 760 }}>
        <Eyebrow index={2}>Mission control</Eyebrow>
        <h2 className="rp-display-l">Atlas allows us to monitor the entire data stack every night.</h2>
        <p className="rp-small" style={{ color: 'var(--fg-2)' }}>This also allow us to build any number of products on top of the data.</p>
      </div>
      <div style={{ marginTop: 72, display: 'grid', gap: 48 }}>
        <RunChart title="Last night's run" meta="Updated 9 hours ago" total={127} flagged={78} height={44} />
        <Col gap={32}><Metric size="m" label="Pipeline steps completed" value="126 of 127" /><Metric size="m" label="Flagged for retry" value="1" tone="attention" /></Col>
      </div>
    </Section>
  );
}

function WhyDifferent() {
  const { Section, Eyebrow, DataTable, Badge } = g();
  const L = [['Judgment · Norwalk · 9/25', 'Judgment · Norwalk · 9/25'], ['Mechanics lien · Bridgeport · 9/25', 'Mechanics lien · Bridgeport · 9/25'], ['Code violation · Hartford · 9/24', 'Code violation · Hartford · 9/24'], ['Foreclosure · Stamford · 9/24', 'Foreclosure · Stamford · 9/24'], ['Tax lien · Waterbury · 9/23', 'Tax lien · Waterbury · 9/23'], [null, 'Lis pendens · Bristol · 9/23'], [null, 'Tax warrant · Meriden · 9/22'], [null, 'Judgment · New Haven · 9/22']];
  const rows = L.map(([a, b], i) => ({ id: i, a, b }));
  return (
    <Section tone="sage">
      <Col>
        <div style={{ display: 'grid', gap: 24 }}>
          <Eyebrow index={3}>Why it's different</Eyebrow>
          <h2 className="rp-display-l" style={{ maxWidth: 520 }}>Much of what Atlas captures cannot be collected again.</h2>
          <p className="rp-body" style={{ maxWidth: 500, color: 'var(--fg-2)' }}>Most county and city sources show only the current version of a record and overwrite or remove older ones. Atlas captures them every night and keeps each version, so a company that starts collecting today cannot recover the history Atlas already holds.</p>
        </div>
        <DataTable caption="Illustration of a source that keeps only its latest five filings." rows={rows} columns={[
          { key: 'a', label: 'The source shows', render: r => r.a || <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>Removed from source</span> },
          { key: 'b', label: 'Atlas holds · 27 filings', render: r => <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>{r.b}{!r.a && <Badge tone="attention" variant="text">kept</Badge>}</span> },
        ]} />
      </Col>
    </Section>
  );
}

function HowItWorks() {
  const { Section, Eyebrow, Button } = g();
  const steps = [['01 Discovery', 'AI Agents find sources.', 'Jurisdiction by jurisdiction, automatically.'], ['02 Extraction', 'They write their own logic.', 'The agent derives how to read a source, then validates the output.'], ['03 Resolution', 'Records get synced instantly.', 'Ownership chains that were previously overlooked.'], ['04 Signals', 'Changes monitored every night.', 'Data is recomputed as records come in, not next quarter.']];
  return (
    <Section tone="forest" id="how">
      <Col align="end">
        <div style={{ display: 'grid', gap: 20 }}><Eyebrow index={4}>How it works</Eyebrow><h2 className="rp-display-l">Atlas uses AI agents to capture and maintain every source.</h2></div>
        <div style={{ display: 'grid', gap: 20 }}>
          <p className="rp-small" style={{ color: 'var(--fg-2)' }}>Sources include county recorders, courts, tax collectors, and county and city governing bodies. Every property record resolves to one connected record, and local government decisions are linked to the body that made them.</p>
          <div><Button variant="link">Read the documentation</Button></div>
        </div>
      </Col>
      <div style={{ borderTop: 'var(--border-accent)', marginTop: 64, paddingTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
        {steps.map(([k, t, d]) => <div key={k} style={{ display: 'grid', gap: 12, alignContent: 'start' }}><span className="rp-label">{k}</span><h3 className="rp-title-s" style={{ fontWeight: 400, fontSize: 18 }}>{t}</h3><p className="rp-small" style={{ color: 'var(--fg-2)' }}>{d}</p></div>)}
      </div>
    </Section>
  );
}

function Coverage() {
  const { Section, Eyebrow, Tabs, Card, RunChart } = g();
  const [tab, setTab] = React.useState('Property records');
  const all = ['Connecticut', 'Florida', 'North Carolina', 'New York · Niagara and Erie counties', 'New York City · Manhattan'];
  const data = {
    'Property records': ['Parcels, ownership, deeds, mortgages and assessments, resolved to one record per parcel.', all],
    'Court and tax': ['Foreclosure filings, liens, judgments and tax status, each resolved to its parcel and owner.', all.slice(0, 4)],
    'Local government': ['Meetings, agendas and formal decisions of county and city governing bodies.', ['Florida']],
  };
  const steps = [['01', 'A market is requested', 'A customer or partner asks about a county, city or state Atlas does not yet cover.'], ['02', 'Sources are found', 'Agents identify the county and city offices that publish records for that market.'], ['03', 'Records are captured', 'Each source is collected and resolved into the same connected records as every other market.'], ['04', 'History starts building', "From the first night, Atlas keeps every version it captures, so the market's history grows each night."]];
  const hist = Array.from({ length: 36 }, (_, i) => 4 + i + (i % 4));
  return (
    <Section tone="paper" id="coverage">
      <Col>
        <div style={{ display: 'grid', gap: 24 }}>
          <Eyebrow index={5}>Coverage</Eyebrow>
          <h2 className="rp-display-l">Coverage grows market by market, on request.</h2>
          <p className="rp-small" style={{ color: 'var(--fg-2)' }}>Coverage in any market can be expanded on request.</p>
          <Tabs variant="pill" items={Object.keys(data)} value={tab} onChange={setTab} />
          <p className="rp-small" style={{ color: 'var(--fg-2)', maxWidth: 420 }}>{data[tab][0]}</p>
          <div>
            <div className="rp-label" style={{ borderBottom: '1px solid var(--rule-ink)', paddingBottom: 10 }}>Current markets</div>
            {data[tab][1].map(m => <div key={m} className="rp-small" style={{ borderBottom: '1px solid var(--rule)', padding: '12px 0' }}>{m}</div>)}
          </div>
        </div>
        <Card tone="raised" style={{ display: 'grid', gap: 20 }}>
          <span className="rp-small" style={{ fontWeight: 500 }}>How a new market is added</span>
          {steps.map(([k, t, d]) => <div key={k} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 8, borderTop: '1px solid var(--rule)', paddingTop: 16 }}><span className="rp-label" style={{ color: 'var(--accent-fg)' }}>{k}</span><div style={{ display: 'grid', gap: 6 }}><span className="rp-small">{t}</span><span className="rp-caption">{d}</span></div></div>)}
          <div style={{ display: 'grid', gap: 8 }}><RunChart values={hist} steps={hist.map(() => 'ink')} height={28} gap={2} /><div className="rp-chart__axis"><span>First night</span><span>Each night adds to the history</span></div></div>
        </Card>
      </Col>
    </Section>
  );
}

function Contact() {
  const { Section, Eyebrow, Button } = g();
  return (
    <Section tone="forest" id="contact" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'grid', gap: 20 }}><Eyebrow index={6}>Get in touch</Eyebrow><h2 className="rp-display-xl" style={{ fontSize: 'var(--fs-display-l)' }}>Get in touch.</h2><p className="rp-small" style={{ color: 'var(--fg-2)' }}>Tell us what you're looking for and we'll show you what we have.</p></div>
        <Button variant="accent">Start the conversation</Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 96 }} className="rp-label"><span>Red Planet Data</span><span>© 2026</span></div>
    </Section>
  );
}
Object.assign(window, { Hero, MissionControl, WhyDifferent, HowItWorks, Coverage, Contact });
