Shows how data moves from sources through tables and layers to places and storage, and what a failure affects downstream.

```jsx
<FlowDiagram
  stages={[{ key: 'src', label: 'Sources' }, { key: 'tbl', label: 'Tables' }, { key: 'lyr', label: 'Layers' }, { key: 'plc', label: 'Places' }, { key: 'sto', label: 'Storage' }]}
  nodes={[{ id: 'a', stage: 'src', label: 'Fairfield Recorder', meta: 'SRC-0142', status: 'live' }, …]}
  edges={[{ from: 'a', to: 't1' }, { from: 'b', to: 't1', status: 'failed' }]}
  selectedId={sel} onSelect={setSel} />
```

- Left-to-right only. Connectors are 1px rule lines; failed edges are red dashed.
- Selection highlights the full upstream + downstream path and dims everything else.
- Keep ≤ 8 nodes per column; group the rest ("+ 214 more") and link to the table view.
