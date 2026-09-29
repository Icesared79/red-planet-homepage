import React from 'react';
export function TopBar({ brand, mark, links = [], cta, onNavigate, className = '', ...rest }) {
  return (
    <header className={'rp-topbar ' + className} {...rest}>
      <a className="rp-topbar__brand" href="#" onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate('home'); } }}>{mark}{brand ?? 'Red Planet'}</a>
      <nav className="rp-topbar__nav">
        {links.map(l => (
          <a key={l.label} className="rp-topbar__link" href={l.href || '#'} aria-current={l.active ? 'page' : undefined} onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate(l.value ?? l.label); } }}>{l.label}</a>
        ))}
      </nav>
      {cta && <a className="rp-btn rp-btn--primary" href={cta.href || '#'} onClick={e => { if (onNavigate) { e.preventDefault(); onNavigate(cta.value ?? 'cta'); } }}>{cta.label}</a>}
    </header>
  );
}
