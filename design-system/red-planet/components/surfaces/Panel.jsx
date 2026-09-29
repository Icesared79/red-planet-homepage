import React from 'react';
export function Panel({ eyebrow, title, actions, footer, flush = false, children, className = '', ...rest }) {
  return (
    <section className={'rp-panel ' + className} {...rest}>
      {(title || eyebrow || actions) && (
        <header className="rp-panel__head">
          <div className="rp-panel__titles">{eyebrow && <span className="rp-label">{eyebrow}</span>}{title && <h3 className="rp-panel__title">{title}</h3>}</div>
          {actions && <div className="rp-panel__actions">{actions}</div>}
        </header>
      )}
      <div className={'rp-panel__body' + (flush ? ' is-flush' : '')}>{children}</div>
      {footer && <footer className="rp-panel__foot">{footer}</footer>}
    </section>
  );
}
