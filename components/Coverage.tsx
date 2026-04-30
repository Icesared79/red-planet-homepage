const ITEMS = [
  {
    num: "01",
    title: "Property records",
    desc: "Parcels, deeds, transactions, and assessments — sourced county by county, normalized into one schema.",
  },
  {
    num: "02",
    title: "Ownership",
    desc: "Current and historical ownership, with entity chain resolution where the records make it possible.",
  },
  {
    num: "03",
    title: "Court activity",
    desc: "Lis pendens, foreclosure filings, judgments, and eviction records pulled from jurisdictional portals.",
  },
  {
    num: "04",
    title: "Entity data",
    desc: "Secretary of State filings, formations, dissolutions, and officer changes across all 50 states.",
  },
  {
    num: "05",
    title: "Debt and liens",
    desc: "Recorded mortgages, UCC-1 filings, mechanics liens, federal tax liens, and assignment activity.",
  },
  {
    num: "06",
    title: "Distress signals",
    desc: "Composite indicators built across ownership, debt, court activity, and asset condition.",
  },
  {
    num: "07",
    title: "Energy infrastructure",
    desc: "Power capacity, interconnection queue activity, renewable mix, and rate data at the utility level.",
  },
  {
    num: "08",
    title: "Climate & environmental",
    desc: "Risk exposure, flood zone designations, and regulatory overlays where they intersect with property.",
  },
  {
    num: "+",
    title: "More",
    desc: "Atlas adds new data layers continuously — tax delinquency, mechanics liens, UCC-1 filings, permits, zoning, rate data, and more as the engine expands.",
  },
];

export function Coverage() {
  return (
    <section className="manifesto">
      <div className="container">
        <div className="manifesto-inner">
          <div className="eyebrow on-light">§ 04 — Coverage</div>
          <h2>
            What <span className="accent">Atlas</span> covers.
          </h2>
          <p className="coverage-intro">
            The data domains Atlas continuously ingests, verifies, and connects.
            Coverage is ongoing — depth and recency matter to us more than
            count.
          </p>
          <div className="coverage-list">
            {ITEMS.map((item) => (
              <div key={item.num} className="coverage-item">
                <div className="coverage-cat">
                  <span className="num">{item.num}</span>
                  {item.title}
                </div>
                <div className="coverage-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
