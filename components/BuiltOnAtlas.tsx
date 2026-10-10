import {
  AtlasMark,
  RedPlanetMark,
  SignalMark,
  SunScopeMark,
  TeleAcreMark,
} from "@/components/Marks";

export function BuiltOnAtlas() {
  return (
    <section id="products" className="rph-band--plain">
      <div className="rph-kicker">&sect; 05 &mdash; Built on Atlas</div>
      <h2 className="rph-h2 rph-products__h2">
        TeleAcre, Signal and SunScope are built on Atlas. LeanCRE licenses it.
      </h2>
      <p className="rph-intro rph-products__intro">
        Atlas has built-in tools for building platforms on top of its records,
        so a new platform can be built quickly. These three are examples, each
        presenting the part of the records one group of buyers needs. Other
        companies license the same records to run their own businesses.
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
            target="_blank"
            rel="noopener"
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
            CT &middot; FL &middot; NC &middot; Upstate NY &middot; NYC
          </div>
        </div>

        <div className="rph-platform">
          <h3 className="rph-platform__lockup">
            <span aria-label="SunScope" style={{ gap: "8px", height: "38px" }}>
              <SunScopeMark />
              <span className="rph-wordmark-sunscope" aria-hidden="true">
                <b>Sun</b>Scope
              </span>
            </span>
          </h3>
          <p className="rph-platform__body">
            Roof and solar suitability on every residential parcel in a market,
            scored from roof characteristics, solar potential, utility rates
            and incentive eligibility. Sold to solar and roofing installers,
            who work the scored list as a field-sales territory rather than
            buying leads.
          </p>
          <div className="rph-platform__draws">
            <div className="rph-platform__draws-label">Draws from Atlas</div>
            <div className="rph-platform__draws-body">
              Parcel, ownership and assessment records, joined to roof
              geometry, solar exposure and the utility and incentive rules in
              force for that address.
            </div>
          </div>
          <div className="rph-platform__markets">CT</div>
        </div>

        {/* RECORDS-6. LeanCRE was a one-line strip under a "Licensed by other
            companies" label; the operator asked for it as a fourth card in the
            same format. It is a licensee, not a Red Planet platform, which the
            card states in its own line above the link. The lockup is LeanCRE's
            own file, copied byte for byte out of the LeanCRE codebase
            (apps/leancre/public/brand) -- not redrawn, and not recoloured:
            LeanCRE ships a light and a dark variant and the page picks the one
            that matches the theme. No other LeanCRE token, font or colour is
            used anywhere on this page. */}
        <div className="rph-platform">
          <h3 className="rph-platform__lockup">
            <span style={{ height: "38px" }}>
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
          </h3>
          <p className="rph-platform__body">
            A separate company that sources and underwrites commercial real
            estate loans for banks, private lenders and family offices. It
            licenses Atlas for the record behind each property, its
            surroundings and its owner, and for surveillance of collateral
            through maturity.
          </p>
          <div className="rph-platform__draws">
            <div className="rph-platform__draws-label">Draws from Atlas</div>
            <div className="rph-platform__draws-body">
              Parcel, ownership and assessment records for the collateral and
              the parcels around it, with the court, tax and lien filings that
              follow a property through the life of a loan.
            </div>
          </div>
          <div className="rph-platform__licence">
            Run by a separate company that licenses Atlas. Not a Red Planet
            platform.
          </div>
          <a
            href="https://leancre.com"
            className="rph-underline--sm rph-platform__link"
            target="_blank"
            rel="noopener"
          >
            leancre.com &#8599;
          </a>
        </div>
      </div>
    </section>
  );
}
