import React from 'react';
const SURF = { sage: 'sage', forest: 'forest', paper: 'paper' };
export function Card({ tone = 'raised', padding, as: Tag = 'div', interactive = false, className = '', style, children, ...rest }) {
  const cls = ['rp-card', tone === 'outline' && 'rp-card--outline', padding === 'none' && 'rp-card--flush', interactive && 'is-interactive', className].filter(Boolean).join(' ');
  const s = tone === 'raised' ? { background: 'var(--bg-raised)' } : tone === 'sunken' ? { background: 'var(--bg-sunken)' } : {};
  const pad = typeof padding === 'number' || (typeof padding === 'string' && padding !== 'none') ? { padding } : {};
  return <Tag className={cls} data-surface={SURF[tone]} style={{ ...s, ...pad, ...style }} {...rest}>{children}</Tag>;
}
