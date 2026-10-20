import { AtlasMark, RedPlanetMark } from "@/components/Marks";

/* LAND-1 (2026-10-20): Atlas is the one platform customers sign in to, and the four views are the
   ways into the county record. One shape for every view card: index + market line, the view's
   wordmark, one plain sentence, and what it draws from Atlas. No per-card footers or links, so the
   four cards read as one row. Red Planet Data is the author of every view. */
type View = {
  index: string;
  market: string;
  name: string;
  body: string;
  fromAtlas: string;
};

const views: View[] = [
  {
    index: "01",
    market: "Land and local government",
    name: "AtlasLand",
    body: "What each county and city has decided about land and data centers, with the hearing calendar, the land being assembled and the document behind each decision.",
    fromAtlas: "Meetings, agendas and formal decisions of governing bodies, recorded deeds, each with its source document.",
  },
  {
    index: "02",
    market: "Commercial property",
    name: "AtlasCRE",
    body: "Commercial parcels, their owners and sales, permits and site plans, and a pipeline for the deals a firm is working.",
    fromAtlas: "Parcel, ownership, court, tax and lien records for commercial property and its surroundings.",
  },
  {
    index: "03",
    market: "Residential property",
    name: "AtlasProp",
    body: "Residential ownership changes, foreclosure filings, liens, probate and tax certificate sales, dated to the filing and resolved to the parcel.",
    fromAtlas: "Court, tax, lien and code enforcement filings, each resolved to its parcel and owner.",
  },
  {
    index: "04",
    market: "Roof, solar and the trades",
    name: "AtlasTrade",
    body: "Roof and solar suitability for every residential parcel in a county, with solar, roofing, pool, pest and HVAC filters, ranked as a sales territory.",
    fromAtlas: "Parcel, ownership and assessment records, joined to roof geometry and utility rules.",
  },
];

export function BuiltOnAtlas() {
  return (
    <section id="products" className="rph-band--plain">
      {/* The head is centred on the same axis as the lockup, Atlas card and
          bracket below it, so the section is one composition. */}
      <div className="rph-products__head">
        <div className="rph-kicker">&sect; 05 &mdash; Atlas</div>
        <h2 className="rph-h2 rph-products__h2">
          Atlas is the platform. A license is counties and seats, and every view that applies to those counties is included.
        </h2>
        <p className="rph-intro rph-products__intro">
          Customers sign in to Atlas and work the county record in four views.
          A license names the counties and the seats, sold in blocks of ten, and
          each view that applies to a licensed county comes with it at no extra
          charge. Red Planet Data builds and runs Atlas and is the author of
          everything its views present.
        </p>
      </div>

      <div className="rph-tier">
        <span className="rph-brand">
          <RedPlanetMark />
          <span className="rph-brand__name">Red Planet</span>
        </span>
        <span className="rph-tier__desc">
          The company. It builds and runs Atlas, is the author of everything
          Atlas presents, and holds every customer account.
        </span>
      </div>
      <div className="rph-connector rph-connector--32" />

      <div className="rph-atlas-card">
        <div className="rph-atlas-card__head">
          <span className="rph-atlas-card__mark" aria-label="Atlas">
            <AtlasMark />
            <span className="rph-atlas-card__word" aria-hidden="true">
              Atlas
            </span>
          </span>
          <span className="rph-atlas-card__role">
            The county record, in four views
          </span>
        </div>
        <div className="rph-atlas-card__cells">
          <div className="rph-atlas-card__cell">
            <div className="rph-atlas-card__cell-label">Records</div>
            <div className="rph-atlas-card__cell-body">
              Every record Atlas maintains, kept current and with its full
              history.
            </div>
          </div>
          <div className="rph-atlas-card__cell">
            <div className="rph-atlas-card__cell-label">License</div>
            <div className="rph-atlas-card__cell-body">
              Counties plus seat blocks of ten, one annual price, with the
              views that apply included.
            </div>
          </div>
        </div>
      </div>

      <div className="rph-connector rph-connector--24" />
      <div className="rph-bracket" />

      <div className="rph-platforms">
        {views.map((v) => (
          <div className="rph-platform" key={v.index}>
            <div className="rph-platform__meta">
              <span>{v.index}</span>
              <span>{v.market}</span>
            </div>
            <h3 className="rph-platform__lockup">
              <span className="rph-wordmark-atlas-view">{v.name}</span>
            </h3>
            <p className="rph-platform__body">{v.body}</p>
            <div className="rph-platform__draws">
              <div className="rph-platform__draws-label">From Atlas</div>
              <div className="rph-platform__draws-body">{v.fromAtlas}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
