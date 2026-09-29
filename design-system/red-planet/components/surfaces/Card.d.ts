/** Rounded container with tonal fill (no shadow). Sets data-surface so nested tokens adapt. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** raised = lighter than page. sunken = darker. sage / forest / paper = brand surfaces. outline = border only. */
  tone?: 'raised' | 'sunken' | 'sage' | 'forest' | 'paper' | 'outline';
  /** CSS padding or "none". Defaults to var(--panel-pad) (32 / 16). */
  padding?: number | string;
  interactive?: boolean;
  as?: React.ElementType;
}
export declare function Card(props: CardProps): JSX.Element;
