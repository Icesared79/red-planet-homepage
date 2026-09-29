/** Tab switcher. underline = view tabs (Atlas screens, docs). pill = segmented filter (homepage coverage). */
export interface TabItem { value: string; label: React.ReactNode; count?: number | string; /** Count shown in red: items need attention. */ attention?: boolean; icon?: React.ReactNode; }
export interface TabsProps {
  items: Array<string | TabItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
