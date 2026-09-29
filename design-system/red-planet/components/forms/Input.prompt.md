Single-line text field; labels are mono and sit above the control.

```jsx
<Input label="Work email" placeholder="you@company.com" />
<Input prefix={<Icon name="search" />} placeholder="Filter sources" />
<Input label="Parcel ID" mono error="No parcel matches this ID" />
```

- Height follows density (44 / 28). Use `mono` for identifiers and figures.
- Only an error turns a field red.
