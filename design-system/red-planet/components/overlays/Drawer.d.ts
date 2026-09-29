/** Right-side sheet for inspecting or editing one record without leaving the list. Esc and scrim close it. */
export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Extra header controls, left of the close button. */
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  /** Position within the nearest positioned ancestor instead of the viewport (previews, embedded panes). */
  inline?: boolean;
  width?: number | string;
  children?: React.ReactNode;
  className?: string;
}
export declare function Drawer(props: DrawerProps): JSX.Element;
