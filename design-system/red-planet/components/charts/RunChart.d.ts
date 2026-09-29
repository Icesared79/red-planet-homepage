export type RunStep = 'ok' | 'flagged' | 'running' | 'pending' | 'ink';
/**
 * Homepage "Last night's run" strip: one thin bar per pipeline step, flagged steps in red and slightly taller.
 * @startingPoint section="Charts" subtitle="Run chart — one bar per pipeline step" viewport="700x200"
 */
export interface RunChartProps {
  /** One entry per step. Objects may carry a tooltip label. */
  steps?: Array<RunStep | { status: RunStep; label?: string }>;
  /** Shorthand: number of steps, all ok except flagged/running indices. */
  total?: number;
  flagged?: number | number[];
  running?: number | number[];
  /** Optional bar heights (growth histogram mode, e.g. nightly history). */
  values?: number[];
  height?: number;
  gap?: number;
  title?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}
export declare function RunChart(props: RunChartProps): JSX.Element;
