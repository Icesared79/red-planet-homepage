import {
  AtlasMark,
  RedPlanetMark,
  SignalMark,
  TeleAcreMark,
} from "@/components/Marks";

export function BuiltOnAtlas() {
  return (
    <section id="products" className="rph-band--plain">
      <div className="rph-kicker">&sect; 05 &mdash; Built on Atlas</div>
      <h2 className="rph-h2 rph-products__h2">
        TeleAcre and Signal are two platforms built on Atlas.
      </h2>
      <p className="rph-intro rph-products__intro">
        Atlas has built-in tools for building platforms on top of its records,
        so a new platform can be built quickly. TeleAcre and Signal are two
        examples, each presenting the part of the records one group of buyers
        needs.
      </p>

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
        <div className="rph-platform">
          <h3 className="rph-platform__lockup">
            <span aria-label="TeleAcre" style={{ gap: "6px" }}>
              <TeleAcreMark />
              <span className="rph-wordmark-teleacre" aria-hidden="true">
                TeleAcre
              </span>
            </span>
          </h3>
          <p className="rph-platform__body">
            A verified record of what county and city governing bodies have
            formally decided about data centers, with the primary document
            behind every entry. It shows where data centers can be approved and
            built. National in scope, with Florida built first, for insurers,
            reinsurers, lenders, private credit funds and investors.
          </p>
          <div className="rph-platform__draws">
            <div className="rph-platform__draws-label">Draws from Atlas</div>
            <div className="rph-platform__draws-body">
              Meetings, agendas and formal decisions of county and city
              governing bodies, with the source document for each.
            </div>
          </div>
          <a
            href="https://teleacre.com"
            className="rph-underline--sm rph-platform__link"
          >
            teleacre.com &#8599;
          </a>
        </div>

        <div className="rph-platform">
          <h3 className="rph-platform__lockup">
            <span aria-label="Signal" style={{ gap: "10px", height: "38px" }}>
              <SignalMark />
              <span className="rph-wordmark-signal" aria-hidden="true">
                Signal
              </span>
            </span>
          </h3>
          <p className="rph-platform__body">
            Residential distress events on parcels, such as foreclosure filings,
            tax delinquency, liens and code enforcement, each with its actual
            filing date. Sold to brokerages, investor firms and agencies.
            Connecticut court foreclosure filings reach Signal in a median of 2
            to 4 days.
          </p>
          <div className="rph-platform__draws">
            <div className="rph-platform__draws-label">Draws from Atlas</div>
            <div className="rph-platform__draws-body">
              Court filings, tax status, liens and code enforcement records,
              each resolved to its parcel and owner.
            </div>
          </div>
          <div className="rph-platform__markets">
            CT &middot; FL &middot; GA &middot; NC &middot; NYC
          </div>
        </div>
      </div>
    </section>
  );
}
