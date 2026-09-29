# Atlas UI kit

Illustrative Atlas screens at compact density. No Atlas UI source was provided, so these are **reference compositions** of the system, not recreations. Treat the layouts as defaults to build from.

- `index.html`: interactive app. Sidebar navigation, theme toggle (moon icon).
  - **Sources**: status tabs with a red failed count, filters, sortable sticky table. Click a row to open the Drawer. Filter to nothing to see the empty state.
  - **Overview**: KPI cards, run chart, needs-attention table, trend.
  - **Runs**: run chart and an error state.
  - **Lineage**: FlowDiagram with upstream/downstream tracing.
  - **Map**: MapFrame with layer tabs, legend and readout, plus a geographies list showing live markets and one activating market.
- `data.jsx`: sample sources, geographies and lineage graph (fictional values).
- `Screens.jsx`: Overview, Sources, Lineage, MapScreen, Runs.
- `App.jsx`: shell, navigation groups, routing.

The sidebar is a **placeholder** until the real Atlas menu is supplied. Red appears only on failed status, failed counts, the flagged run bar, failed lineage edges and the retry action.
