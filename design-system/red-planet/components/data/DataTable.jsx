import React from 'react';
export function DataTable({ columns = [], rows = [], rowKey = 'id', selectedKey, onRowClick, sortable = false, stickyHeader = false, caption, className = '', ...rest }) {
  const [sort, setSort] = React.useState(null);
  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const c = columns.find(c => c.key === sort.key);
    const get = r => (c && c.sortValue ? c.sortValue(r) : r[sort.key]);
    return [...rows].sort((a, b) => { const x = get(a), y = get(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
  }, [rows, sort, columns]);
  const cls = c => [c.align === 'right' && 'is-right', c.mono && 'is-mono', c.muted && 'is-muted'].filter(Boolean).join(' ');
  const onSort = c => { if (!sortable || c.sortable === false) return; setSort(s => (s && s.key === c.key ? (s.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 })); };
  return (
    <div className="rp-table-wrap">
      <table className={'rp-table' + (onRowClick ? ' is-interactive' : '') + (stickyHeader ? ' is-sticky' : '') + ' ' + className} {...rest}>
        {caption && <caption>{caption}</caption>}
        <thead><tr>{columns.map(c => (
          <th key={c.key} className={cls(c) + (sortable && c.sortable !== false ? ' is-sortable' : '')} style={{ width: c.width }} onClick={() => onSort(c)}>
            {c.label}{sort && sort.key === c.key && <span className="rp-sort">{sort.dir === 1 ? '↑' : '↓'}</span>}
          </th>))}</tr></thead>
        <tbody>{sorted.map((r, n) => {
          const k = r[rowKey] ?? n;
          return (
            <tr key={k} aria-selected={selectedKey != null && selectedKey === k ? true : undefined} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {columns.map(c => <td key={c.key} className={cls(c)}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
