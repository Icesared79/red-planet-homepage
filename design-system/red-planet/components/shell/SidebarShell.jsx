import React from 'react';
function Group({ group, activeId, onSelect, query }) {
  const [open, setOpen] = React.useState(group.defaultOpen !== false);
  const q = query.trim().toLowerCase();
  const match = i => !q || String(i.label).toLowerCase().includes(q) || (i.children || []).some(match);
  const items = (group.items || []).filter(match);
  if (!items.length) return null;
  const show = open || !!q;
  const Item = ({ i, child }) => (
    <button className={'rp-nav-item' + (child ? ' rp-nav-item--child' : '')} aria-current={activeId === i.id ? 'page' : undefined} title={i.label} onClick={() => onSelect && onSelect(i.id)}>
      {!child && i.icon}
      <span className="rp-nav-item__label">{i.label}</span>
      {i.meta != null && <span className={'rp-nav-item__meta' + (i.attention ? ' is-attention' : '')}>{i.meta}</span>}
    </button>
  );
  return (
    <div className={'rp-nav-group' + (show ? '' : ' is-closed')}>
      {group.label && <button className="rp-nav-group__label" onClick={() => setOpen(o => !o)} aria-expanded={show}>{group.label}<span className="rp-nav-group__caret" /></button>}
      {show && items.map(i => (
        <React.Fragment key={i.id}>
          <Item i={i} />
          {i.children && (activeId === i.id || i.children.some(c => c.id === activeId) || q) && i.children.filter(match).map(c => <Item key={c.id} i={c} child />)}
        </React.Fragment>
      ))}
    </div>
  );
}
export function SidebarShell({ product = 'Atlas', workspace, groups = [], activeId, onSelect, header, sidebarFooter, search = true, tone = 'forest', collapsed = false, children, className = '', style }) {
  const [query, setQuery] = React.useState('');
  const surface = tone === 'forest' ? { 'data-surface': 'forest' } : tone === 'sage' ? { 'data-surface': 'sage' } : {};
  return (
    <div className={'rp-shell' + (collapsed ? ' is-collapsed' : '') + ' ' + className} data-density="compact" data-product="atlas" style={style}>
      <aside className="rp-sidebar" {...surface}>
        <div className="rp-sidebar__head"><span className="rp-sidebar__product">{product}</span>{workspace && <span className="rp-sidebar__workspace">{workspace}</span>}</div>
        {search && (
          <div className="rp-sidebar__search">
            <span className="rp-input"><input placeholder="Jump to…" value={query} onChange={e => setQuery(e.target.value)} /><span className="rp-input__affix">/</span></span>
          </div>
        )}
        <nav className="rp-sidebar__scroll">{groups.map((g, n) => <Group key={g.label || n} group={g} activeId={activeId} onSelect={onSelect} query={query} />)}</nav>
        {sidebarFooter && <div className="rp-sidebar__foot">{sidebarFooter}</div>}
      </aside>
      <div className="rp-shell__main">
        {header && <div className="rp-shell__header">{header}</div>}
        <div className="rp-shell__body">{children}</div>
      </div>
    </div>
  );
}
export function Breadcrumbs({ items = [] }) {
  return <div className="rp-crumbs">{items.map((c, n) => <React.Fragment key={n}>{n > 0 && <span className="rp-crumbs__sep">/</span>}<span>{c}</span></React.Fragment>)}</div>;
}
