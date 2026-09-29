import React from 'react';
export function Badge({ tone = 'neutral', variant = 'solid', icon, children, className = '', ...rest }) {
  const cls = ['rp-badge', tone !== 'neutral' && 'rp-badge--' + tone, variant === 'outline' && 'rp-badge--outline', variant === 'text' && 'rp-badge--text', className].filter(Boolean).join(' ');
  return <span className={cls} {...rest}>{icon}{children}</span>;
}
