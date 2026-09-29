/** Text input with mono label, optional affixes, hint and error. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  /** Error message; turns the field red (attention). */
  error?: string;
  /** Leading node — an <Icon/> or short mono text like "$". */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Monospace value text, for IDs, parcel numbers, SQL. */
  mono?: boolean;
}
export declare function Input(props: InputProps): JSX.Element;
