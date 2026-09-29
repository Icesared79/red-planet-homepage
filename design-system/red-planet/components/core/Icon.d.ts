/** Lucide icon (lucide-static 0.460.0, bundled) rendered inline at a thin 1.5 stroke; inherits currentColor. */
export interface IconProps {
  /** Lucide icon name in kebab-case, e.g. "database", "map", "git-branch". */
  name: string;
  /** px number or CSS length. Defaults to var(--icon-size): 20px comfortable, 16px compact. */
  size?: number | string;
  /** Default 1.5. Use 1.25 at >=24px. Never above 1.75. */
  strokeWidth?: number;
  /** Accessible label. Omit for decorative icons (aria-hidden). */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
