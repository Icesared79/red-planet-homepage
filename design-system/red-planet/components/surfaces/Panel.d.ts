/** Bordered working surface with a header row (title, mono eyebrow, actions), body and optional footer. */
export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Remove body padding — for tables, maps and diagrams that run edge to edge. */
  flush?: boolean;
}
export declare function Panel(props: PanelProps): JSX.Element;
