/**
 * The homepage carries its footer line inside the § 07 contact band
 * (components/GetInTouch.tsx). This standalone band is for pages that do not
 * end on that section.
 */
export function Footer() {
  return (
    <section className="rph-contact">
      <div className="rph-footer" style={{ marginTop: 0 }}>
        <span>Red Planet Data</span>
        <span>&copy; 2026</span>
      </div>
    </section>
  );
}
