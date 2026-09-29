import React from 'react';
export function Input({ label, hint, error, prefix, suffix, mono = false, disabled, id, className = '', style, ...rest }) {
  const auto = React.useId();
  const iid = id || auto;
  return (
    <div className={'rp-field ' + className} style={style}>
      {label && <label className="rp-field__label" htmlFor={iid}>{label}</label>}
      <span className={'rp-input' + (mono ? ' rp-input--mono' : '') + (error ? ' is-invalid' : '') + (disabled ? ' is-disabled' : '')}>
        {prefix != null && <span className="rp-input__affix">{prefix}</span>}
        <input id={iid} disabled={disabled} aria-invalid={error ? true : undefined} {...rest} />
        {suffix != null && <span className="rp-input__affix">{suffix}</span>}
      </span>
      {(error || hint) && <span className={'rp-field__hint' + (error ? ' is-error' : '')}>{error || hint}</span>}
    </div>
  );
}
