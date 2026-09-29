/**
 * Pill button on Red Planet pages, 4px-radius button inside Atlas (density-driven).
 * @startingPoint section="Actions" subtitle="Primary, accent, secondary, ghost, danger and link buttons" viewport="700x300"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = ink fill. accent = red fill (Red Planet only, max one per view). danger = destructive, Atlas. link = underlined text. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon node, typically <Icon/>. */
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Square button showing only the icon; pass aria-label. */
  iconOnly?: boolean;
  href?: string;
  as?: React.ElementType;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
