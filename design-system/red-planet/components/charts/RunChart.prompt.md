Shows every step of a run at once so a single failure is visible at a glance; the signature data graphic of the brand.

```jsx
<RunChart title="Last night's run" meta="Updated 9 hours ago" total={127} flagged={78} height={36} />
<RunChart values={nightly} steps={nightly.map(() => 'ink')} height={24} gap={2} />
```

- Bars are green-sage for ok, red for flagged, ink-blinking for running, muted for pending.
- Red bars only for steps that failed or need a retry.
- Pair with two `Metric size="m"` underneath (completed / flagged).
