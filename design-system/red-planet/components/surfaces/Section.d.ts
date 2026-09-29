/** Red Planet page band: large vertical padding, 18px radius, tonal surface, centred max-width inner column. */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** none = page background. forest = dark band. sage = muted band. paper = quiet raised band. */
  tone?: 'none' | 'forest' | 'sage' | 'paper';
  /** No corner radius (full-bleed edge). */
  plain?: boolean;
  /** Wrap children in the max-width column. Default true. */
  inner?: boolean;
}
export declare function Section(props: SectionProps): JSX.Element;
