/** Small mono tag for categories, counts and flags. */
export interface BadgeProps {
  /** attention = red, needs action. caution = degraded. positive = verified/healthy. */
  tone?: 'neutral' | 'attention' | 'caution' | 'positive' | 'inverse';
  /** text = no background, like the homepage's red "kept" marker. */
  variant?: 'solid' | 'outline' | 'text';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
export declare function Badge(props: BadgeProps): JSX.Element;
