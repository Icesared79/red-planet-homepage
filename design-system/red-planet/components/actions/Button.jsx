import React from 'react';
export function Button({ variant = 'primary', size = 'md', icon, iconRight, iconOnly = false, children, className = '', as, ...rest }) {
  const Tag = as || (rest.href ? 'a' : 'button');
  const cls = ['rp-btn', 'rp-btn--' + variant, size !== 'md' && 'rp-btn--' + size, iconOnly && 'rp-btn--icon', className].filter(Boolean).join(' ');
  const extra = Tag === 'button' && !rest.type ? { type: 'button' } : {};
  return <Tag className={cls} {...extra} {...rest}>{icon}{children != null && !iconOnly && <span>{children}</span>}{iconRight}</Tag>;
}
