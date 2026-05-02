import { SectionLabel } from "./SectionLabel";

const ITEMS = [
  {
    num: "01",
    title: "Property records",
    desc: "Parcels, deeds, transactions, assessments. Sourced county by county.",
  },
  {
    num: "02",
    title: "Ownership",
    desc: "Current and historical owners, with entity chains resolved where the records allow.",
  },
  {
    num: "03",
    title: "Court activity",
    desc: "Lis pendens, foreclosures, judgments, evictions. Pulled directly from jurisdictional sources.",
  },
  {
    num: "04",
    title: "Entity data",
    desc: "Secretary of State filings — formations, dissolutions, officer changes. All 50 states.",
  },
  {
    num: "05",
    title: "Debt and liens",
    desc: "Mortgages, UCC-1s, mechanics liens, federal tax liens, assignments.",
  },
  {
    num: "06",
    title: "Distress signals",
    desc: "Composite indicators built across ownership, debt, courts, and asset condition.",
  },
  {
    num: "07",
    title: "Energy infrastructure",
    desc: "Power capacity, interconnection queues, renewable mix, utility-level rate data.",
  },
  {
    num: "08",
    title: "Climate & environmental",
    desc: "Risk exposure, flood zones, regulatory overlays — where they intersect with property.",
  },
  {
    num: "+",
    title: "More",
    desc: "Atlas grows continuously. Tax delinquency, permits, zoning, water rights, broker activity — added as the engine expands.",
  },
];

export function Coverage() {
  return (
    <section className="manifesto">
      <div className="container">
        <div className="section-grid">
          <SectionLabel title="§ 05 — Coverage" num="05" />
          <div className="section-body">
            <div className="manifesto-inner">
              <h2>
                What&apos;s in <span className="accent">Atlas.</span>
              </h2>
              <p className="coverage-intro">
                Depth and freshness over volume. Here&apos;s what the foundation is
                built on.
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
        </div>
      </div>
    </section>
  );
}
