import React from 'react';
export function EmptyState({ variant = 'empty', code, title, description, actions, align = 'start', className = '', ...rest }) {
  return (
    <div className={'rp-empty rp-empty--' + variant + (align === 'center' ? ' rp-empty--center' : '') + ' ' + className} role={variant === 'error' ? 'alert' : undefined} {...rest}>
      <span className="rp-empty__mark" />
      {code && <span className="rp-empty__code">{code}</span>}
      <h3 className="rp-empty__title">{title}</h3>
      {description && <p className="rp-empty__desc">{description}</p>}
      {actions && <div className="rp-empty__actions">{actions}</div>}
    </div>
  );
}
