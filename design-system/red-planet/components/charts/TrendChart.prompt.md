Minimal line chart for one series over time; no gridlines, no legend, labels only at the ends.

```jsx
<TrendChart title="Last 30 days" values={series} startLabel="Aug 27" endLabel="Sep 26" height={80} />
```

- One series per chart. For comparisons, place two charts side by side.
- Never color the line red; mark an anomaly with a RunChart or a Badge instead.
