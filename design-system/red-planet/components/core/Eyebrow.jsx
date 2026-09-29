import React from 'react';
export function Eyebrow({ index, children, tone = 'auto', as: Tag = 'p', className = '', ...rest }) {
  const cls = 'rp-eyebrow' + (tone !== 'auto' ? ' rp-eyebrow--' + tone : '') + ' ' + className;
  return <Tag className={cls} {...rest}>{index != null && <span>§ {String(index).padStart(2, '0')} —</span>}<span>{children}</span></Tag>;
}
