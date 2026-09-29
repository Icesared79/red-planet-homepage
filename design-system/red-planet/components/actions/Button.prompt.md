Primary action control; shape and size follow the surrounding density.

```jsx
<Button>Get in touch</Button>
<Button variant="accent">Start the conversation</Button>
<Button variant="secondary" size="sm" icon={<Icon name="refresh-cw" />}>Re-run</Button>
<Button variant="ghost" iconOnly aria-label="More" icon={<Icon name="ellipsis" />} />
```

- `accent` (red) is for the single closing CTA on a Red Planet page. Never use it in Atlas.
- `danger` is Atlas-only for destructive or corrective actions (retry a failed run, delete a source).
- `link` is the underlined inline action ("How it works", "Read the documentation").
