const d = () => window.DS;
const fmt = n => n.toLocaleString('en-US');
const Page = ({ children, style }) => <div style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start', ...style }}>{children}</div>;

function Overview({ go }) {
  const { Card, Metric, Panel, RunChart, DataTable, StatusIndicator, Button, TrendChart } = d();
  const failing = SOURCES.filter(s => s.status === 'failed' || s.status === 'stale');
  const series = [470, 471, 473, 474, 476, 477, 479, 480, 482, 483, 485, 486, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 499, 500, 500, 501, 502, 502.4];
  return (
    <Page>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        <Card tone="raised" style={{ border: '1px solid var(--rule)' }}><Metric size="m" label="Verified records" value="502,392,645" delta="+424,968" meta="last night" /></Card>
        <Card tone="raised" style={{ border: '1px solid var(--rule)' }}><Metric size="m" label="Sources live" value="2,301" meta="of 2,418" /></Card>
        <Card tone="raised" style={{ border: '1px solid var(--rule)' }}><Metric size="m" label="Stale sources" value="48" meta="past expected interval" /></Card>
        <Card tone="raised" style={{ border: '1px solid var(--rule)' }}><Metric size="m" label="Failed runs" value="2" tone="attention" meta="needs retry" /></Card>
      </div>
      <Panel title="Last night's run" eyebrow="Monitor" actions={<Button size="sm" variant="secondary" onClick={() => go('runs')}>Open run</Button>}>
        <RunChart meta="Started 03:00 · finished 05:41" total={127} flagged={[78]} height={40} />
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 12 }}>
        <Panel title="Needs attention" flush actions={<Button size="sm" variant="ghost" onClick={() => go('sources')}>All sources</Button>}>
          <DataTable onRowClick={() => go('sources')} rows={failing} columns={[{ key: 'id', label: 'ID', mono: true, muted: true, width: 84 }, { key: 'name', label: 'Source' }, { key: 'status', label: 'Status', render: r => <StatusIndicator status={r.status} /> }, { key: 'last', label: 'Last', align: 'right', mono: true, muted: true }]} />
        </Panel>
        <Panel title="Verified records · 30 days"><TrendChart values={series} height={120} startLabel="Aug 27" endLabel="Sep 26" /></Panel>
      </div>
    </Page>
  );
}

function Sources() {
  const { Tabs, DataTable, StatusIndicator, Badge, Input, Select, Button, Drawer, EmptyState, Icon, Panel } = d();
  const [tab, setTab] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [market, setMarket] = React.useState('');
  const [row, setRow] = React.useState(null);
  const count = s => SOURCES.filter(x => s === 'all' || x.status === s).length;
  const rows = SOURCES.filter(s => (tab === 'all' || s.status === tab) && (!market || s.market === market) && s.name.toLowerCase().includes(q.toLowerCase()));
  const tabs = [{ value: 'all', label: 'All', count: count('all') }, { value: 'live', label: 'Live', count: count('live') }, { value: 'activating', label: 'Activating', count: count('activating') }, { value: 'stale', label: 'Stale', count: count('stale') }, { value: 'failed', label: 'Failed', count: count('failed'), attention: true }, { value: 'dormant', label: 'Dormant', count: count('dormant') }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0 16px' }}><Tabs items={tabs} value={tab} onChange={setTab} /></div>
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--rule)' }}>
        <Input prefix={<Icon name="search" />} placeholder="Filter by name" value={q} onChange={e => setQ(e.target.value)} style={{ width: 260 }} />
        <Select placeholder="All markets" options={['CT', 'FL', 'NC', 'NY', 'NYC']} value={market} onChange={e => setMarket(e.target.value)} style={{ width: 140 }} />
        <span className="rp-label" style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11 }}>{rows.length} of {SOURCES.length}</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {rows.length ? (
          <DataTable stickyHeader sortable selectedKey={row && row.id} onRowClick={setRow} rows={rows} columns={[
            { key: 'id', label: 'ID', mono: true, muted: true, width: 90 },
            { key: 'name', label: 'Source' },
            { key: 'kind', label: 'Type', render: r => <Badge>{r.kind}</Badge> },
            { key: 'market', label: 'Market', mono: true },
            { key: 'status', label: 'Status', render: r => <StatusIndicator status={r.status} /> },
            { key: 'rows', label: 'Records', align: 'right', mono: true, render: r => fmt(r.rows) },
            { key: 'cadence', label: 'Cadence', muted: true },
            { key: 'last', label: 'Last', align: 'right', mono: true, render: r => <span style={{ color: r.status === 'failed' ? 'var(--attention)' : 'var(--fg-3)' }}>{r.last}</span> },
          ]} />
        ) : <EmptyState code="0 results" title="No sources match these filters." description="Clear a filter or search a different jurisdiction." actions={<Button variant="secondary" onClick={() => { setQ(''); setMarket(''); setTab('all'); }}>Clear filters</Button>} />}
      </div>
      <Drawer open={!!row} onClose={() => setRow(null)} eyebrow={row ? 'Source · ' + row.id : ''} title={row ? row.name : ''}
        footer={row && <>{row.status === 'dormant' ? <Button variant="secondary">Resume</Button> : <Button variant="secondary">Pause</Button>}{row.status === 'failed' ? <Button variant="danger" icon={<Icon name="rotate-ccw" />}>Retry now</Button> : <Button>Open lineage</Button>}</>}>
        {row && <div style={{ display: 'grid', gap: 16 }}>
          <StatusIndicator status={row.status} size="lg" meta={row.last} />
          {row.status === 'failed' && <div style={{ border: '1px solid var(--attention)', borderRadius: 4, padding: 12, display: 'grid', gap: 4 }}><span className="rp-label" style={{ color: 'var(--attention)', fontSize: 11 }}>{row.last} · 03:12</span><span style={{ fontSize: 13 }}>The source stopped responding on page 214 of 380. Atlas will retry at 04:00.</span></div>}
          <DataTable columns={[{ key: 'k', label: 'Field', muted: true }, { key: 'v', label: 'Value', mono: true, align: 'right' }]} rows={[{ id: 1, k: 'Type', v: row.kind }, { id: 2, k: 'Market', v: row.market }, { id: 3, k: 'Records held', v: fmt(row.rows) }, { id: 4, k: 'Versions kept', v: fmt(Math.round(row.rows * 1.55)) }, { id: 5, k: 'Cadence', v: row.cadence }]} />
        </div>}
      </Drawer>
    </div>
  );
}

function Lineage() {
  const { FlowDiagram, Panel, Button, StatusIndicator } = d();
  const [sel, setSel] = React.useState('s3');
  const node = FLOW.nodes.find(n => n.id === sel);
  return (
    <Page>
      <Panel title="Lineage" eyebrow="Sources → storage" actions={<><span className="rp-label" style={{ fontSize: 11 }}>{node ? 'Tracing ' + node.label : 'Select a node to trace'}</span>{sel && <Button size="sm" variant="ghost" onClick={() => setSel(null)}>Clear</Button>}</>}>
        <FlowDiagram {...FLOW} selectedId={sel} onSelect={setSel} />
      </Panel>
      {node && node.status === 'failed' && <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}><StatusIndicator status="failed" /><span>{node.label} blocks tax_status and Distress events. Parcels still serve yesterday's version.</span></div>}
    </Page>
  );
}

function MapScreen() {
  const { MapFrame, MapLegendItem, Tabs, Panel, DataTable, StatusIndicator } = d();
  const [layer, setLayer] = React.useState('Parcels');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', height: '100%' }}>
      <div style={{ padding: 16 }}>
        <MapFrame height="100%" toolbar={<div style={{ background: 'var(--bg-raised)', padding: 4, borderRadius: 4, boxShadow: 'var(--elev-1)' }}><Tabs variant="pill" items={['Parcels', 'Filings', 'Coverage']} value={layer} onChange={setLayer} /></div>}
          legend={<><MapLegendItem>Live geography</MapLegendItem><MapLegendItem swatch="var(--chart-muted)">Activating · not ready</MapLegendItem><MapLegendItem swatch="var(--green-300)">{layer} density</MapLegendItem><MapLegendItem swatch="var(--attention)" shape="circle">Needs review</MapLegendItem></>}
          readout="41.1792° N, 73.1894° W · z12 · 18,204 parcels" attribution="Basemap attribution" placeholder={'Map canvas — ' + layer.toLowerCase() + ' layer'} />
      </div>
      <div style={{ borderLeft: '1px solid var(--rule)', padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
        <span className="rp-label" style={{ fontSize: 11 }}>Geographies</span>
        <DataTable columns={[{ key: 'name', label: 'Market' }, { key: 'status', label: 'Status', align: 'right', render: r => <StatusIndicator status={r.status} label={r.status === 'activating' ? 'Activating' : 'Live'} meta={r.meta} /> }]} rows={GEOGRAPHIES} />
        <span className="rp-caption" style={{ fontSize: 12 }}>Rhode Island is being restored from the version archive. It will serve once the restore completes.</span>
        <span className="rp-label" style={{ fontSize: 11, marginTop: 8 }}>In view</span>
        <DataTable columns={[{ key: 'k', label: 'Place', muted: true }, { key: 'v', label: 'Parcels', align: 'right', mono: true }]} rows={[{ id: 1, k: 'Bridgeport', v: '38,112' }, { id: 2, k: 'Fairfield', v: '21,406' }, { id: 3, k: 'Stratford', v: '19,873' }, { id: 4, k: 'Trumbull', v: '12,950' }]} />
      </div>
    </div>
  );
}

function Runs() {
  const { Panel, RunChart, EmptyState, Button, Metric } = d();
  return (
    <Page>
      <Panel title="Run 2026-09-26 · 03:00" eyebrow="Nightly">
        <div style={{ display: 'grid', gap: 16 }}>
          <RunChart total={127} flagged={[78]} height={48} meta="127 steps" />
          <div style={{ display: 'flex', gap: 40 }}><Metric size="s" label="Completed" value="126 of 127" /><Metric size="s" label="Flagged for retry" value="1" tone="attention" /><Metric size="s" label="Duration" value="2h 41m" /></div>
        </div>
      </Panel>
      <Panel title="Step 79 · Miami-Dade tax extraction">
        <EmptyState variant="error" code="E-SRC-504 · 03:12" title="The county server stopped responding." description="Atlas will retry at 04:00. You can retry now." actions={<><Button variant="danger">Retry now</Button><Button variant="ghost">View log</Button></>} />
      </Panel>
    </Page>
  );
}

function Placeholder({ label }) {
  const { EmptyState } = d();
  return <EmptyState code={label} title="This screen isn't part of the kit." description="Build it from Panel, DataTable and the other system components." />;
}
Object.assign(window, { Overview, Sources, Lineage, MapScreen, Runs, Placeholder });
