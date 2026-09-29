Wraps a map so its chrome matches the system; the map itself is supplied by the consumer.

```jsx
<MapFrame height={420} toolbar={<Tabs variant="pill" items={['Parcels', 'Filings', 'Coverage']} />}
  legend={<><MapLegendItem swatch="var(--fg-1)">Covered</MapLegendItem><MapLegendItem swatch="var(--attention)" shape="circle">Needs review</MapLegendItem></>}
  readout="41.1792° N, 73.1894° W · z12" attribution="© OpenStreetMap">
  <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
</MapFrame>
```

- Basemap: light, desaturated, warm grey (match --paper / --sage). No satellite by default.
- Data layers: ink for coverage, sage/green tints for density, red only for features needing attention.
- Also exports `MapLegendItem`.
