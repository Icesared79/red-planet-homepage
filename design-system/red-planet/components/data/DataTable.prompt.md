Tabular records in the homepage's ruled style — the default for any list of records, sources, runs or filings.

```jsx
<DataTable sortable onRowClick={open}
  columns={[{ key: 'name', label: 'Source' }, { key: 'status', label: 'Status', render: r => <StatusIndicator status={r.status} /> }, { key: 'rows', label: 'Rows', align: 'right', mono: true }]}
  rows={sources} />
```

- Red Planet: 0 side padding, 48px rows, used as editorial evidence (2–8 rows).
- Atlas: 10px cell padding, 32px rows, sticky header, sortable, click row → Drawer.
- Flags such as "kept" use `<Badge tone="attention" variant="text">`.
