Switches between sibling views or filters without leaving the page.

```jsx
<Tabs variant="pill" items={['Property records', 'Court and tax', 'Local government']} />
<Tabs items={[{ value: 'all', label: 'All', count: 412 }, { value: 'failed', label: 'Failed', count: 3, attention: true }]} />
```

- `underline` for switching views of one object; `pill` for filtering a list.
- A red count means "these need attention"; don't use it for totals.
