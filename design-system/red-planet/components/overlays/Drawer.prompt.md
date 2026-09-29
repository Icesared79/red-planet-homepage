Detail view for a row, node or map feature; keeps the list visible behind it.

```jsx
<Drawer open={!!row} onClose={() => setRow(null)} eyebrow="Source · SRC-0142" title="Fairfield County Recorder"
  footer={<><Button variant="secondary">Pause</Button><Button>Open source</Button></>}>
  …
</Drawer>
```

- Width follows density (480 / 400). One drawer at a time; never stack.
- Use for inspect/edit. Use a full page for anything needing more than ~3 sections.
