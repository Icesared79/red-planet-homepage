export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Right-aligned mono text: a count, a time, a short code. */
  meta?: React.ReactNode;
  /** Render meta in red — this item needs attention. */
  attention?: boolean;
  /** Nested items, revealed when the parent or a child is active. */
  children?: NavItem[];
}
export interface NavGroup { label?: string; items: NavItem[]; defaultOpen?: boolean; }
/**
 * Atlas application frame: collapsible grouped sidebar with jump-to filter, header row and scrolling body. Forces compact density.
 * @startingPoint section="Atlas" subtitle="App shell with grouped sidebar for many menu items" viewport="1200x720"
 */
export interface SidebarShellProps {
  product?: string;
  /** Short mono workspace/env label, e.g. "prod". */
  workspace?: string;
  groups: NavGroup[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Content for the 48px main header row (breadcrumbs, actions). */
  header?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  /** Show the jump-to filter. Default true. */
  search?: boolean;
  /** Sidebar surface. Default forest (dark). */
  tone?: 'forest' | 'paper' | 'sage';
  collapsed?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function SidebarShell(props: SidebarShellProps): JSX.Element;
export interface BreadcrumbsProps { items: React.ReactNode[]; }
export declare function Breadcrumbs(props: BreadcrumbsProps): JSX.Element;
