/**
 * The five lifecycle states for any geography, source, pipeline, layer or job. Shape + color, so state survives colorblindness and grayscale.
 * live = filled green circle · activating = pulsing green ring · dormant = hollow grey ring · stale = ochre diamond · failed = red square
 * @startingPoint section="Status" subtitle="Live, activating, dormant, stale, failed" viewport="700x180"
 */
export interface StatusIndicatorProps {
  status: 'live' | 'dormant' | 'activating' | 'stale' | 'failed';
  /** Override the default label text. */
  label?: React.ReactNode;
  /** Mono trailing note, e.g. "9h ago", "E-504". */
  meta?: React.ReactNode;
  /** Dot only (label becomes tooltip + aria-label). */
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export declare function StatusIndicator(props: StatusIndicatorProps): JSX.Element;
