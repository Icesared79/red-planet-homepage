import React from 'react';
export function Drawer({ open, onClose, eyebrow, title, actions, footer, inline = false, width, children, className = '' }) {
  React.useEffect(() => {
    if (!open) return;
    const k = e => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  return (
    <div className={'rp-drawer-layer' + (open ? ' is-open' : '') + (inline ? ' is-inline' : '') + ' ' + className} aria-hidden={!open}>
      <div className="rp-drawer__scrim" onClick={onClose} />
      <aside className="rp-drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} style={width ? { width } : undefined}>
        <header className="rp-drawer__head">
          <div className="rp-drawer__titles">{eyebrow && <span className="rp-label">{eyebrow}</span>}<h2 className="rp-drawer__title">{title}</h2></div>
          {actions}
          <button className="rp-btn rp-btn--ghost rp-btn--icon rp-btn--sm" aria-label="Close" onClick={onClose}><span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>×</span></button>
        </header>
        <div className="rp-drawer__body">{children}</div>
        {footer && <footer className="rp-drawer__foot">{footer}</footer>}
      </aside>
    </div>
  );
}
