Shows the lifecycle state of a source, pipeline, layer or job.

```jsx
<StatusIndicator status="live" meta="9h ago" />
<StatusIndicator status="failed" meta="E-504" />
<StatusIndicator status="activating" showLabel={false} />
```

- **live**: a geography or source that is active and current.
- **activating**: a geography being brought online from storage; not ready yet. Reads as in progress, never as a problem. Use `meta` for progress ("62%").
- **dormant**: intentionally paused. Grey, not a problem.
- **stale**: last success is older than its expected interval. Ochre, watch it.
- **failed**: last run errored and needs action. The only red state.
- Put the dot-only form in dense tables and nav; keep the label everywhere else.
