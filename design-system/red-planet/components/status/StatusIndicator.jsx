import React from 'react';
const LABELS = { live: 'Live', dormant: 'Dormant', activating: 'Activating', stale: 'Stale', failed: 'Failed' };
export function StatusIndicator({ status = 'live', label, meta, showLabel = true, size = 'md', className = '', ...rest }) {
  const text = label ?? LABELS[status] ?? status;
  return (
    <span className={'rp-status rp-status--' + status + (size !== 'md' ? ' rp-status--' + size : '') + ' ' + className} role="status" aria-label={showLabel ? undefined : text} title={showLabel ? undefined : text} {...rest}>
      <span className="rp-status__dot" />
      {showLabel && <span className="rp-status__label">{text}</span>}
      {meta && <span className="rp-status__meta">{meta}</span>}
    </span>
  );
}
