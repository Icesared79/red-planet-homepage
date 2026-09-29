/**
 * Red Planet public-site top bar: wordmark, 5–6 text links, one dark pill CTA.
 * @startingPoint section="Navigation" subtitle="Red Planet website top bar" viewport="1200x80"
 */
export interface TopBarLink { label: string; href?: string; value?: string; active?: boolean; }
export interface TopBarProps {
  /** Wordmark text or node. Defaults to "Red Planet". */
  brand?: React.ReactNode;
  /** Logo mark node (supply the real asset; the system ships none). */
  mark?: React.ReactNode;
  links?: TopBarLink[];
  cta?: { label: string; href?: string; value?: string };
  onNavigate?: (value: string) => void;
  className?: string;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
