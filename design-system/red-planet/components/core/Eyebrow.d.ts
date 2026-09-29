/** Monospace section label, e.g. "§ 01 — What we do". Red on Red Planet pages, muted inside Atlas (automatic via data-product="atlas"). */
export interface EyebrowProps {
  /** Section number; renders "§ 01 —" prefix. */
  index?: number | string;
  children?: React.ReactNode;
  /** auto = follows product scope. accent forces red (Red Planet only). muted forces grey. */
  tone?: 'auto' | 'accent' | 'muted';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}
export declare function Eyebrow(props: EyebrowProps): JSX.Element;
