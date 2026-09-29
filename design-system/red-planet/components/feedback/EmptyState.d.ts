/** Typographic empty / error message: a short rule, mono code, plain headline, one sentence, one action. No illustration. */
export interface EmptyStateProps {
  /** error turns the rule and code red. */
  variant?: 'empty' | 'error';
  /** Mono reference, e.g. "No results" or "E-SRC-504 · 03:12". */
  code?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: 'start' | 'center';
  className?: string;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
