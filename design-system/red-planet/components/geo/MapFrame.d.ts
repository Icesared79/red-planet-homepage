/**
 * Container for any map library: sunken surface, hairline border, overlay slots for toolbar, legend, coordinate readout and attribution.
 * @startingPoint section="Geo" subtitle="Map container with overlay slots" viewport="700x360"
 */
export interface MapFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  /** Top-left: layer toggles, search. Usually <Tabs variant="pill"/> or small Buttons. */
  toolbar?: React.ReactNode;
  /** Top-right legend content; use <MapLegendItem/>. */
  legend?: React.ReactNode;
  /** Bottom-left mono chip: coordinates, zoom, feature count. */
  readout?: React.ReactNode;
  attribution?: React.ReactNode;
  /** Text shown in the striped placeholder when no map is mounted. */
  placeholder?: string;
  /** The map canvas (MapLibre, Leaflet, deck.gl…). */
  children?: React.ReactNode;
}
export declare function MapFrame(props: MapFrameProps): JSX.Element;
export interface MapLegendItemProps { swatch?: string; shape?: 'square' | 'circle' | 'line'; children?: React.ReactNode; }
export declare function MapLegendItem(props: MapLegendItemProps): JSX.Element;
