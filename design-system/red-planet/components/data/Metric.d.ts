/** Headline figure in mono with a sans label, optional delta and mono meta line. */
export interface MetricProps {
  label?: React.ReactNode;
  value: React.ReactNode;
  /** e.g. "+424,968". Leading "-" defaults to attention tone; otherwise positive. */
  delta?: React.ReactNode;
  deltaTone?: 'positive' | 'attention' | 'neutral';
  /** Mono secondary line, e.g. "+275.5M archived · 777.9M all-time". */
  meta?: React.ReactNode;
  /** Right-aligned mono note in the label row, e.g. "9 hours ago". */
  aside?: React.ReactNode;
  /** Leading node in the label row, typically <StatusIndicator showLabel={false}/>. */
  status?: React.ReactNode;
  size?: 'xl' | 'l' | 'm' | 's';
  /** Color the value itself. attention only when the number is the problem. */
  tone?: 'attention' | 'positive';
  className?: string;
}
export declare function Metric(props: MetricProps): JSX.Element;
