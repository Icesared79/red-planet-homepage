/** Native select styled to match Input. */
export interface SelectOption { value: string; label: string; disabled?: boolean; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<string | SelectOption>;
  placeholder?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
