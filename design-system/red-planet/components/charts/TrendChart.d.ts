/** Thin ink line over a faint fill with a baseline rule and mono end labels — the hero-card "Last 30 days" chart. */
export interface TrendChartProps {
  values: number[];
  height?: number;
  /** Faint fill under the line. Default true. */
  area?: boolean;
  /** Stepped line for cumulative counts. */
  step?: boolean;
  startLabel?: React.ReactNode;
  endLabel?: React.ReactNode;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}
export declare function TrendChart(props: TrendChartProps): JSX.Element;
