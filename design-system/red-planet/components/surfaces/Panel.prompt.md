Atlas's workhorse container: any table, chart, map or form region gets a Panel.

```jsx
<Panel title="Sources" eyebrow="Catalog" actions={<Button size="sm" variant="secondary">Add source</Button>} flush>
  <DataTable … />
</Panel>
```

- Use `flush` for tables and maps. Keep header actions to 1–3 small buttons.
