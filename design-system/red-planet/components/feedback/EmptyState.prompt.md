Fills a panel, table or page when there is nothing to show or something went wrong.

```jsx
<EmptyState code="0 results" title="No sources match these filters." description="Clear a filter or search a different jurisdiction." actions={<Button variant="secondary" size="sm">Clear filters</Button>} />
<EmptyState variant="error" code="E-SRC-504 · 03:12" title="The county server stopped responding." description="Atlas will retry at 04:00. You can retry now." actions={<Button variant="danger" size="sm">Retry now</Button>} />
```

- Say what happened and what to do next, in one sentence each. No apologies, no exclamation marks.
