import React from 'react';
export function Metric({ label, value, delta, deltaTone, meta, aside, status, size = 'l', tone, className = '', ...rest }) {
  const dt = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'attention' : 'positive');
  return (
    <div className={'rp-metric rp-metric--' + size + ' ' + className} {...rest}>
      {(label || aside) && <div className="rp-metric__label">{status}{label}{aside && <span className="rp-metric__aside">{aside}</span>}</div>}
      <p className={'rp-metric__value' + (tone ? ' is-' + tone : '')}>{value}</p>
      {(delta != null || meta) && <div className="rp-metric__foot">{delta != null && <span className={'rp-metric__delta is-' + dt}>{delta}</span>}{meta && <span>{meta}</span>}</div>}
    </div>
  );
}
