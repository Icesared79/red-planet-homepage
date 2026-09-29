export interface Column<R = any> {
  key: string;
  label: React.ReactNode;
  align?: 'left' | 'right';
  /** Monospace + tabular numbers. Use for figures, IDs, dates. */
  mono?: boolean;
  /** Secondary text color. */
  muted?: boolean;
  width?: number | string;
  render?: (row: R) => React.ReactNode;
  sortValue?: (row: R) => string | number;
  sortable?: boolean;
}
/**
 * Ruled table: mono header over an ink rule, hairline row rules, no zebra, no cell borders. Row height follows density (48 / 32).
 * @startingPoint section="Data" subtitle="Ruled data table" viewport="700x320"
 */
export interface DataTableProps<R = any> {
  columns: Column<R>[];
  rows: R[];
  rowKey?: string;
  selectedKey?: string | number;
  onRowClick?: (row: R) => void;
  sortable?: boolean;
  stickyHeader?: boolean;
  /** Mono footnote under the table, e.g. "Illustration of a source that keeps only its latest five filings." */
  caption?: React.ReactNode;
  className?: string;
}
export declare function DataTable<R = any>(props: DataTableProps<R>): JSX.Element;
