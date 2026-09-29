import React from 'react';
export function Tabs({ items = [], value, defaultValue, onChange, variant = 'underline', className = '', ...rest }) {
  const norm = items.map(i => (typeof i === 'string' ? { value: i, label: i } : i));
  const [inner, setInner] = React.useState(defaultValue ?? norm[0]?.value);
  const cur = value !== undefined ? value : inner;
  const pick = v => { if (value === undefined) setInner(v); onChange && onChange(v); };
  return (
    <div role="tablist" className={'rp-tabs rp-tabs--' + variant + ' ' + className} {...rest}>
      {norm.map(i => (
        <button key={i.value} role="tab" aria-selected={cur === i.value} className="rp-tab" onClick={() => pick(i.value)}>
          {i.icon}{i.label}{i.count != null && <span className={'rp-tab__count' + (i.attention ? ' is-attention' : '')}>{i.count}</span>}
        </button>
      ))}
    </div>
  );
}
