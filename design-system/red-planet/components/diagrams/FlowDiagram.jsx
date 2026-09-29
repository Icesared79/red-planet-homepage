import React from 'react';
export function FlowDiagram({ stages = [], nodes = [], edges = [], selectedId, onSelect, className = '', ...rest }) {
  const wrap = React.useRef(null);
  const refs = React.useRef({});
  const [paths, setPaths] = React.useState([]);
  const related = React.useMemo(() => {
    if (!selectedId) return null;
    const set = new Set([selectedId]);
    let grew = true;
    while (grew) { grew = false; edges.forEach(e => { if (set.has(e.from) && !set.has(e.to)) { set.add(e.to); grew = true; } }); }
    grew = true; const up = new Set([selectedId]);
    while (grew) { grew = false; edges.forEach(e => { if (up.has(e.to) && !up.has(e.from)) { up.add(e.from); grew = true; } }); }
    up.forEach(i => set.add(i));
    return set;
  }, [selectedId, edges]);
  const measure = React.useCallback(() => {
    const w = wrap.current; if (!w) return;
    const b = w.getBoundingClientRect();
    setPaths(edges.map(e => {
      const a = refs.current[e.from], z = refs.current[e.to];
      if (!a || !z) return null;
      const ra = a.getBoundingClientRect(), rz = z.getBoundingClientRect();
      const x1 = ra.right - b.left, y1 = ra.top + ra.height / 2 - b.top, x2 = rz.left - b.left, y2 = rz.top + rz.height / 2 - b.top;
      const mx = (x1 + x2) / 2;
      return { e, d: 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 };
    }).filter(Boolean));
  }, [edges]);
  React.useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [measure, nodes]);
  return (
    <div ref={wrap} className={'rp-flow ' + className} {...rest}>
      <svg className="rp-flow__edges" width="100%" height="100%">
        {paths.map(({ e, d }, n) => {
          const on = related && related.has(e.from) && related.has(e.to);
          const cls = 'rp-flow__edge' + (e.status === 'failed' || e.attention ? ' is-attention' : '') + (on ? ' is-active' : '') + (related && !on ? ' is-dim' : '');
          return <path key={n} d={d} className={cls} />;
        })}
      </svg>
      <div className="rp-flow__grid">
        {stages.map(s => {
          const list = nodes.filter(n => n.stage === s.key);
          return (
            <div key={s.key} className="rp-flow__stage">
              <div className="rp-flow__stage-label"><span>{s.label}</span><span>{s.count ?? list.length}</span></div>
              {list.map(n => (
                <button key={n.id} ref={el => (refs.current[n.id] = el)} className={'rp-flow__node' + (selectedId === n.id ? ' is-selected' : '') + (n.status === 'failed' ? ' is-attention' : '') + (related && !related.has(n.id) ? ' is-dim' : '')} onClick={() => onSelect && onSelect(selectedId === n.id ? null : n.id)}>
                  <span className="rp-flow__node-top"><span>{n.label}</span>{n.status && <span className={'rp-status rp-status--sm rp-status--' + n.status} title={n.status}><span className="rp-status__dot" /></span>}</span>
                  {n.meta && <span className="rp-flow__node-meta">{n.meta}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
