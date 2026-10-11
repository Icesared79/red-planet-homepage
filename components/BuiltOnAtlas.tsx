import {
  AtlasMark,
  RedPlanetMark,
  SignalMark,
  SunScopeMark,
  TeleAcreMark,
} from "@/components/Marks";

/* One shape for every platform card: index + market line, lockup, a
   two-sentence body (what it is, who it is for), and a "From Atlas" foot
   pinned to the bottom under an ink rule. No per-card footers, links or
   coverage lines, so the four cards read as one row. */
type Platform = {
  index: string;
  market: string;
  lockup: React.ReactNode;
  body: string;
  fromAtlas: string;
};

const platforms: Platform[] = [
  {
    index: "01",
    market: "Data center decisions",
    lockup: (
      <span aria-label="TeleAcre" style={{ gap: "6px" }}>
        <TeleAcreMark size={36} />
        <span className="rph-wordmark-teleacre" aria-hidden="true">
          TeleAcre
        </span>
      </span>
    ),
    body:
      "What county and city governments have decided about data centers, with the source document behind each decision. For insurers, lenders and investors.",
    fromAtlas:
      "Meetings, agendas and formal decisions of governing bodies, with each source document.",
  },
  {
    index: "02",
    market: "Residential distress",
    lockup: (
      <span aria-label="Signal" style={{ gap: "10px" }}>
        <SignalMark />
        <span className="rph-wordmark-signal" aria-hidden="true">
          Signal
        </span>
      </span>
    ),
    body:
      "Residential distress on parcels: foreclosures, tax delinquency, liens and code enforcement, dated to the filing. For brokerages, investors and agencies.",
    fromAtlas:
      "Court, tax, lien and code enforcement filings, each resolved to its parcel and owner.",
  },
  {
    index: "03",
    market: "Roof and solar",
    lockup: (
      <span aria-label="SunScope" style={{ gap: "8px" }}>
        <SunScopeMark size={32} />
        <span className="rph-wordmark-sunscope" aria-hidden="true">
          <b>Sun</b>Scope
        </span>
      </span>
    ),
    body:
      "Roof and solar suitability for every residential parcel in a market, scored and ranked as a sales territory. For solar and roofing installers.",
    fromAtlas:
      "Parcel, ownership and assessment records, joined to roof geometry and utility rules.",
  },
  {
    index: "04",
    market: "CRE lending",
    lockup: (
      <span>
        <img
          className="rph-platform__logo rph-platform__logo--light"
          src="/brand/leancre-horizontal-light.svg"
          alt="LeanCRE"
          width={151}
          height={24}
        />
        <img
          className="rph-platform__logo rph-platform__logo--dark"
          src="/brand/leancre-horizontal-dark.svg"
          alt=""
          aria-hidden="true"
          width={151}
          height={24}
        />
      </span>
    ),
    body:
      "Commercial real estate loans sourced and underwritten on Atlas records for the collateral and its owner. For banks, private lenders and family offices.",
    fromAtlas:
      "Parcel, ownership, court, tax and lien records for the collateral and its surroundings.",
  },
];

export function BuiltOnAtlas() {
  return (
    <section id="products" className="rph-band--plain">
      {/* The head is centred on the same axis as the lockup, Atlas card and
          bracket below it, so the section is one composition. */}
      <div className="rph-products__head">
        <div className="rph-kicker">&sect; 05 &mdash; What we can build</div>
        <h2 className="rph-h2 rph-products__h2">
          We build new platforms on Atlas for the people who license it.
        </h2>
        <p className="rph-intro rph-products__intro">
          A platform built around one company used to be something only a
          large enterprise could afford. Atlas already has the records and the
          tools to build on them, and we write new platforms with AI coding
          agents on that foundation. So any licensee can have a platform shaped
          to their business that grows with it. TeleAcre, Signal and SunScope
          were built this way.
        </p>
      </div>

      <div className="rph-tier">
        <span className="rph-brand">
          <RedPlanetMark />
          <span className="rph-brand__name">Red Planet</span>
        </span>
        <span className="rph-tier__desc">
          The company. It builds and runs Atlas, is the author of everything its
          platforms publish, and holds every customer account.
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
            Records and platform tools
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
            <div className="rph-atlas-card__cell-label">Platform tools</div>
            <div className="rph-atlas-card__cell-body">
              Built-in tools for building a platform on those records.
            </div>
          </div>
        </div>
      </div>

      <div className="rph-connector rph-connector--24" />
      <div className="rph-bracket" />

      <div className="rph-platforms">
        {platforms.map((p) => (
          <div className="rph-platform" key={p.index}>
            <div className="rph-platform__meta">
              <span>{p.index}</span>
              <span>{p.market}</span>
            </div>
            <h3 className="rph-platform__lockup">{p.lockup}</h3>
            <p className="rph-platform__body">{p.body}</p>
            <div className="rph-platform__draws">
              <div className="rph-platform__draws-label">From Atlas</div>
              <div className="rph-platform__draws-body">{p.fromAtlas}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
