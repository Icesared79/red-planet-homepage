function App() {
  const { SidebarShell, Breadcrumbs, Button, Icon } = window.DS;
  const [id, setId] = React.useState('sources');
  const [dark, setDark] = React.useState(false);
  const I = n => <Icon name={n} />;
  const groups = [
    { label: 'Monitor', items: [{ id: 'overview', label: 'Overview', icon: I('activity') }, { id: 'runs', label: 'Runs', icon: I('play'), meta: '1', attention: true }, { id: 'alerts', label: 'Alerts', icon: I('bell'), meta: '2', attention: true }, { id: 'agents', label: 'Agents', icon: I('bot') }] },
    { label: 'Catalog', items: [{ id: 'sources', label: 'Sources', icon: I('database'), meta: '2,418', children: [{ id: 'recorders', label: 'Recorders' }, { id: 'courts', label: 'Courts' }, { id: 'tax', label: 'Tax collectors' }, { id: 'gov', label: 'Governing bodies' }] }, { id: 'tables', label: 'Tables', icon: I('table-2'), meta: '312' }, { id: 'layers', label: 'Layers', icon: I('layers'), meta: '41' }, { id: 'lineage', label: 'Lineage', icon: I('git-branch') }] },
    { label: 'Geography', items: [{ id: 'map', label: 'Map', icon: I('map') }, { id: 'places', label: 'Places', icon: I('map-pin') }, { id: 'markets', label: 'Markets', icon: I('globe'), meta: '6' }] },
    { label: 'Storage', items: [{ id: 'archive', label: 'Version archive', icon: I('archive') }, { id: 'warehouse', label: 'Warehouse', icon: I('hard-drive') }, { id: 'exports', label: 'Exports', icon: I('download') }] },
    { label: 'Admin', defaultOpen: false, items: [{ id: 'users', label: 'Users', icon: I('users') }, { id: 'keys', label: 'API keys', icon: I('key-round') }, { id: 'settings', label: 'Settings', icon: I('settings') }] },
  ];
  const names = { overview: ['Monitor', 'Overview'], runs: ['Monitor', 'Runs'], sources: ['Catalog', 'Sources'], lineage: ['Catalog', 'Lineage'], map: ['Geography', 'Map'] };
  const screens = { overview: <Overview go={setId} />, sources: <Sources />, lineage: <Lineage />, map: <MapScreen />, runs: <Runs /> };
  const header = <>
    <Breadcrumbs items={names[id] || ['Atlas', id]} />
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
      <Button size="sm" variant="ghost" iconOnly aria-label="Toggle theme" icon={I(dark ? 'sun' : 'moon')} onClick={() => setDark(v => !v)} />
      {id === 'sources' && <Button size="sm" icon={I('plus')}>Add source</Button>}
    </div>
  </>;
  return (
    <div data-theme={dark ? 'dark' : undefined} style={{ height: '100%', background: 'var(--bg)' }}>
      <SidebarShell workspace="prod" groups={groups} activeId={id} onSelect={setId} header={header}
        sidebarFooter={<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', fontSize: 12, color: 'var(--fg-2)' }}><span className="rp-status rp-status--live rp-status--sm"><span className="rp-status__dot" /></span>All systems collecting<span className="rp-label" style={{ marginLeft: 'auto', fontSize: 11 }}>03:00</span></div>}>
        <div style={{ position: 'relative', height: '100%' }}>{screens[id] || <Placeholder label={id} />}</div>
      </SidebarShell>
    </div>
  );
}
