import React from 'react';
export function MapFrame({ height = 360, toolbar, legend, readout, attribution, placeholder = 'Map canvas — mount MapLibre / Leaflet here', children, className = '', style, ...rest }) {
  return (
    <div className={'rp-map ' + className} style={{ height, ...style }} {...rest}>
      <div className="rp-map__canvas">{children || <div className="rp-map__placeholder">{placeholder}</div>}</div>
      {toolbar && <div className="rp-map__overlay rp-map__overlay--tl">{toolbar}</div>}
      {legend && <div className="rp-map__overlay rp-map__overlay--tr"><div className="rp-map__legend">{legend}</div></div>}
      {readout && <div className="rp-map__overlay rp-map__overlay--bl"><span className="rp-map__chip">{readout}</span></div>}
      {attribution && <div className="rp-map__overlay rp-map__overlay--br"><span className="rp-map__attr">{attribution}</span></div>}
    </div>
  );
}
export function MapLegendItem({ swatch = 'var(--fg-1)', shape = 'square', children }) {
  const s = { width: 10, height: shape === 'line' ? 2 : 10, background: swatch, borderRadius: shape === 'circle' ? '50%' : 1, flex: 'none' };
  return <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={s} />{children}</span>;
}
