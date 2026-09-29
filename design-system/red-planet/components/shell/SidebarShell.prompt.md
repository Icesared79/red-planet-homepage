Frame for every Atlas screen: a dense, grouped, filterable sidebar holding dozens of items plus a header row and scrolling content area.

```jsx
<SidebarShell workspace="prod" activeId="sources" onSelect={setId}
  groups={[
    { label: 'Monitor', items: [{ id: 'overview', label: 'Overview', icon: <Icon name="activity" /> }, { id: 'runs', label: 'Runs', meta: 1, attention: true }] },
    { label: 'Catalog', items: [{ id: 'sources', label: 'Sources', meta: '2,418' }, { id: 'tables', label: 'Tables' }] },
  ]}
  header={<Breadcrumbs items={['Catalog', 'Sources']} />}>
  …screen…
</SidebarShell>
```

- Sets `data-density="compact"` and `data-product="atlas"` for everything inside.
- Group by task (Monitor, Catalog, Geography, Storage, Admin). Mono group labels, sentence case.
- `attention` meta is the only red in the sidebar.
- Also exports `Breadcrumbs`.
