import React from 'react';
export function RunChart({ steps, total, flagged = [], running = [], values, height = 36, gap = 3, title, meta, footer, className = '', ...rest }) {
  const fl = [].concat(flagged), rn = [].concat(running);
  const list = steps || Array.from({ length: total || 0 }, (_, n) => (fl.includes(n) ? 'flagged' : rn.includes(n) ? 'running' : 'ok'));
  const max = values ? Math.max(...values, 1) : 1;
  return (
    <div className={'rp-chart ' + className} {...rest}>
      {(title || meta) && <div className="rp-chart__head"><span className="rp-chart__title">{title}</span><span className="rp-chart__meta">{meta}</span></div>}
      <div className="rp-run" style={{ height, '--run-gap': gap + 'px' }} role="img" aria-label={(title || 'Run') + ': ' + list.filter(s => s === 'flagged').length + ' flagged of ' + list.length}>
        {list.map((s, n) => {
          const st = typeof s === 'string' ? s : s.status;
          const h = values ? Math.max(4, (values[n] / max) * 100) + '%' : st === 'flagged' ? '100%' : '82%';
          return <span key={n} className={'rp-run__bar' + (st !== 'ok' ? ' is-' + st : '')} style={{ height: h }} title={typeof s === 'object' && s.label ? s.label : 'Step ' + (n + 1) + ' · ' + st} />;
        })}
      </div>
      {footer}
    </div>
  );
}
