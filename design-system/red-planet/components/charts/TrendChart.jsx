import React from 'react';
export function TrendChart({ values = [], height = 96, area = true, step = false, startLabel, endLabel, title, meta, className = '', ...rest }) {
  const W = 1000, H = 100, pad = 4;
  const min = Math.min(...values), max = Math.max(...values);
  const y = v => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);
  const x = n => (n / Math.max(values.length - 1, 1)) * W;
  let d = '';
  values.forEach((v, n) => { d += n === 0 ? 'M' + x(n) + ' ' + y(v) : step ? ' H' + x(n) + ' V' + y(v) : ' L' + x(n) + ' ' + y(v); });
  return (
    <div className={'rp-chart ' + className} {...rest}>
      {(title || meta) && <div className="rp-chart__head"><span className="rp-chart__title">{title}</span><span className="rp-chart__meta">{meta}</span></div>}
      <svg className="rp-trend" viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="none" style={{ height }} role="img" aria-label={title || 'Trend'}>
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="var(--rule-strong)" vectorEffect="non-scaling-stroke" strokeWidth="1" />
        {area && <path d={d + ' V' + H + ' H0 Z'} fill="var(--chart-fill)" />}
        <path d={d} fill="none" stroke="var(--chart-line)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      {(startLabel || endLabel) && <div className="rp-chart__axis"><span>{startLabel}</span><span>{endLabel}</span></div>}
    </div>
  );
}
