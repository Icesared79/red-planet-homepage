import React from 'react';
const SURF = { sage: 'sage', forest: 'forest', paper: 'paper' };
export function Section({ tone = 'none', plain = false, inner = true, id, className = '', style, children, ...rest }) {
  return (
    <section id={id} className={'rp-section' + (plain ? ' rp-section--plain' : '') + ' ' + className} data-surface={SURF[tone]} style={tone === 'none' ? { background: 'transparent', ...style } : style} {...rest}>
      {inner ? <div className="rp-section__inner">{children}</div> : children}
    </section>
  );
}
