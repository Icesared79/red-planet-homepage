import React from 'react';
export function Select({ label, hint, error, options = [], placeholder, id, className = '', style, ...rest }) {
  const auto = React.useId();
  const iid = id || auto;
  return (
    <div className={'rp-field ' + className} style={style}>
      {label && <label className="rp-field__label" htmlFor={iid}>{label}</label>}
      <span className={'rp-input rp-select' + (error ? ' is-invalid' : '')}>
        <select id={iid} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => { const v = typeof o === 'string' ? { value: o, label: o } : o; return <option key={v.value} value={v.value} disabled={v.disabled}>{v.label}</option>; })}
        </select>
      </span>
      {(error || hint) && <span className={'rp-field__hint' + (error ? ' is-error' : '')}>{error || hint}</span>}
    </div>
  );
}
